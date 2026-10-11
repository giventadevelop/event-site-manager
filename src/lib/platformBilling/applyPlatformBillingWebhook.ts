import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { patchTenantProductBillingFromWebhook } from '@/app/admin/platform-billing/ApiServerActions';
import type { TenantProductBillingDTO } from '@/types/platformBilling';

function asMeta(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry != null) out[key] = String(entry);
  }
  return out;
}

async function findBySubscription(subscriptionId: string, tenantId?: string): Promise<TenantProductBillingDTO | null> {
  const params = new URLSearchParams({ 'stripeSubscriptionId.equals': subscriptionId, size: '1' });
  const headers: Record<string, string> = {};
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  const response = await fetchWithJwtRetry(
    `${getApiBaseUrl()}/api/tenant-product-billings?${params.toString()}`,
    { cache: 'no-store', headers }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const row = Array.isArray(data) ? data[0] : data?.content?.[0];
  return row ?? null;
}

function paidThrough(mode: string | undefined, interval: string | undefined): string {
  const date = new Date();
  if (interval === 'YEAR') date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  if (mode !== 'ONE_TIME') return date.toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/**
 * Handles Stripe events whose metadata says billingScope=platform_tenant.
 * Returns a response when the event belongs to platform billing so ticket and
 * membership code is not run. Returns null for every other event.
 */
export async function handlePlatformTenantBillingEvent(event: Stripe.Event): Promise<NextResponse | null> {
  const object = event.data.object as unknown as Record<string, unknown>;
  const nested = asMeta(
    (object.subscription_details as { metadata?: unknown } | undefined)?.metadata
  );
  const meta = { ...asMeta(object.metadata), ...nested };
  const subscriptionId =
    typeof object.subscription === 'string'
      ? object.subscription
      : event.type.startsWith('customer.subscription')
        ? String(object.id || '')
        : '';

  let billingId = meta.billingId ? Number(meta.billingId) : NaN;
  let tenantId = meta.tenantId || '';
  const isMarked = meta.billingScope === 'platform_tenant';

  if (!isMarked && !subscriptionId) return null;

  let existing: TenantProductBillingDTO | null = null;
  if ((!Number.isFinite(billingId) || !tenantId) && subscriptionId) {
    existing = await findBySubscription(subscriptionId, tenantId || undefined);
    if (!existing && !isMarked) return null;
    if (existing?.id) billingId = existing.id;
    if (existing?.tenantId) tenantId = existing.tenantId;
  }

  if (!isMarked && !existing) return null;
  if (!Number.isFinite(billingId) || !tenantId) {
    return new NextResponse('Platform billing event is missing billingId', { status: 200 });
  }

  const mode = meta.billingMode || existing?.billingMode || undefined;
  const base = { id: billingId, tenantId };

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const paid = object.payment_status === 'paid' || event.type === 'checkout.session.async_payment_succeeded';
      if (!paid) {
        await patchTenantProductBillingFromWebhook({ ...base, status: 'PAYMENT_DUE' });
      } else {
        await patchTenantProductBillingFromWebhook({
          ...base,
          status: 'ACTIVE',
          stripeSubscriptionId: subscriptionId || undefined,
          stripePaymentId: typeof object.payment_intent === 'string' ? object.payment_intent : undefined,
          paidThroughDate: mode === 'ONE_TIME' ? paidThrough(mode, meta.billingInterval) : undefined,
        });
      }
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'invoice.payment_failed') {
      await patchTenantProductBillingFromWebhook({ ...base, status: 'PAST_DUE' });
    } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      await patchTenantProductBillingFromWebhook({
        ...base,
        status: 'ACTIVE',
        stripeSubscriptionId: subscriptionId || undefined,
      });
    } else if (event.type === 'customer.subscription.deleted') {
      const reason = (object.cancellation_details as { reason?: string } | undefined)?.reason;
      if (reason === 'payment_failed') {
        await patchTenantProductBillingFromWebhook({ ...base, status: 'LOCKED', stripeSubscriptionId: '' });
      } else {
        await patchTenantProductBillingFromWebhook({
          ...base,
          chargeEnabled: false,
          status: 'COMPLIMENTARY',
          stripeSubscriptionId: '',
        });
      }
    } else if (!isMarked) {
      return null;
    }
  } catch (error) {
    console.error('[platform-billing] webhook update failed', error);
    return new NextResponse('Platform billing update failed', { status: 500 });
  }

  return new NextResponse(JSON.stringify({ ok: true, billingScope: 'platform_tenant' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
