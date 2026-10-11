import { NextResponse } from 'next/server';
import { assertCanPayTenant } from '@/app/admin/platform-billing/ApiServerActions';
import { loadBillingRow, syncGasQuantity } from '@/lib/platformBilling/stripeCheckout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const billingId = Number(body.billingId);
    const tenantId = String(body.tenantId || '');
    if (!billingId || !tenantId) {
      return NextResponse.json({ error: 'billingId and tenantId are required' }, { status: 400 });
    }
    await assertCanPayTenant(tenantId);
    const billing = await loadBillingRow(billingId, tenantId);
    const updated = await syncGasQuantity(billing);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Quantity sync failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
