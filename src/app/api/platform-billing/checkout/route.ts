import { NextResponse } from 'next/server';
import { assertCanPayTenant } from '@/app/admin/platform-billing/ApiServerActions';
import { createPlatformCheckout, loadBillingRow, loadPlan } from '@/lib/platformBilling/stripeCheckout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const billingId = Number(body.billingId);
    const tenantId = String(body.tenantId || '');
    const mode = body.mode === 'ONE_TIME' ? 'ONE_TIME' : 'RECURRING';
    if (!billingId || !tenantId) {
      return NextResponse.json({ error: 'billingId and tenantId are required' }, { status: 400 });
    }
    await assertCanPayTenant(tenantId);
    const billing = await loadBillingRow(billingId, tenantId);
    if (billing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Billing row does not match the tenant' }, { status: 403 });
    }
    const plan = billing.platformPlanId ? await loadPlan(billing.platformPlanId, tenantId) : null;
    const session = await createPlatformCheckout({ billing, plan, mode });
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    const status = /not live|not configured|STRIPE_SECRET/i.test(message) ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
