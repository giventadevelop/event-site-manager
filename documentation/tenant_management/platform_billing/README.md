# Tenant platform billing

This folder is the plan for charging **tenant organizations** (event sites and gas stations) to use this platform. It is not the plan for ticket sales or member dues.

## Decision

Stay on the Stripe account this app already uses. Use Stripe Checkout for the pay page, Stripe Billing for recurring plans, and the Stripe Customer Portal for invoices and for updating a card or a US bank account. Do not add Zoho Billing (sometimes called SOHO in conversation) as a second payment system.

A new tenant uses the platform for free until a platform super-admin turns a charge switch on. The switch does not turn itself on when a reminder date arrives.

## Read these in order

1. [PLATFORM_TENANT_BILLING_GUIDE.md](PLATFORM_TENANT_BILLING_GUIDE.md) — who pays, the charge switch, plans, custom fees, cards and bank payments, and the steps an admin and a tenant follow. Same content as a web page: [PLATFORM_TENANT_BILLING_GUIDE.html](PLATFORM_TENANT_BILLING_GUIDE.html).
2. [STRIPE_VS_ZOHO_ANALYSIS.md](STRIPE_VS_ZOHO_ANALYSIS.md) — why Stripe, and when Zoho would still be the wrong payment desk.
3. [BUILD_PLAN.md](BUILD_PLAN.md) — the build phases. No application code is included in this folder yet.

## What already exists (do not reuse it for this)

| Already built | Who pays | Leave it alone |
| --- | --- | --- |
| Event ticket Checkout, Apple Pay, Google Pay | A person buying tickets | Yes |
| Membership auto-renewal | A person joining as a member | Yes |
| Tenant organization fields `subscriptionPlan`, `subscriptionStatus`, `monthlyFeeUsd`, `stripeCustomerId` | Nobody yet — labels only | Extend later; do not pretend these labels are a live subscription |
| Gas-station location billing note in the mosc-temp repo | Gas-station owners, per location | Use the quantity idea; this folder is the source of truth going forward |

## Cursor rule

[.cursor/rules/platform_tenant_billing.mdc](../../../.cursor/rules/platform_tenant_billing.mdc) tells future work to follow this folder and not to mix tenant fees with ticket or membership payments.
