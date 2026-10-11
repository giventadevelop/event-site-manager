import { NextResponse } from 'next/server';
import { assertPlatformSuperAdmin, saveTenantProductBilling } from '@/app/admin/platform-billing/ApiServerActions';
import { cancelPlatformSubscription, loadBillingRow } from '@/lib/platformBilling/stripeCheckout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const billingId = Number(body.billingId);
    const tenantId = String(body.tenantId || '');
    const cancelNow = body.cancelNow !== false;
    if (!billingId || !tenantId) {
      return NextResponse.json({ error: 'billingId and tenantId are required' }, { status: 400 });
    }
    await assertPlatformSuperAdmin();
    const billing = await loadBillingRow(billingId, tenantId);
    await cancelPlatformSubscription(billing, cancelNow);
    if (cancelNow) {
      await saveTenantProductBilling({
        ...billing,
        chargeEnabled: false,
        status: 'COMPLIMENTARY',
        stripeSubscriptionId: null,
      });
    }
    return NextResponse.json({ ok: true, cancelNow });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cancel failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
