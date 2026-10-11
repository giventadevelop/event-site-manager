# Stripe or Zoho for tenant platform fees

This note answers one question: should tenant organizations (event sites and gas stations) pay through a custom Stripe setup we already have, or through Zoho Billing as a separate system?

In conversation this was called “SOHO.” That name is treated here as **Zoho Billing**. If a different product was meant, the same tests below still apply: does it replace Stripe, or does it sit on top of Stripe and add a second source of truth?

## The short answer

Use Stripe. Do not open a Zoho payment account for this.

Stripe Checkout is the pay page. Stripe Billing runs the recurring plan. The Stripe Customer Portal is where the tenant updates a card or a US bank account and downloads invoices. Our database stores the switch, the custom fee, and the Stripe ids. Zoho is not in that path.

Zoho Billing can still be considered later as a **copy of invoices for a bookkeeper**, and only if the business already runs Zoho Books. Even then, Stripe remains the system that charges the card or the bank.

## What we need the payment system to do

1. Charge a credit or debit card.
2. Charge a US bank account (ACH) for tenants who do not want card fees on a large monthly bill.
3. Charge a card for a tenant outside the United States on the same pay page.
4. Offer a catalog of plans and also a one-off price for a single tenant.
5. Support a monthly or yearly subscription and a one-time payment.
6. Leave a tenant unpaid and fully usable until a platform admin turns a charge switch on. No card on file during that time.
7. Let the tenant update a card or bank account and see invoices without calling support.
8. Fit the Stripe account, webhooks, and Checkout this application already uses for tickets and memberships, without mixing those payments up.

## Side-by-side

**Already in this application.** Stripe is already used for ticket Checkout, Apple Pay, Google Pay, membership subscriptions, and webhooks. Zoho is not integrated. Chargebee, Paddle, and Lemon Squeezy are not integrated.

**Cards.** Stripe charges them directly. Zoho Billing does not replace a card processor. Zoho’s own help says card and ACH charges go through a gateway, and Stripe is the documented gateway. You would pay Stripe’s fee either way, plus a Zoho subscription.

**US bank account (ACH).** Stripe ACH Direct Debit is about 0.8 percent, capped at $5 per payment, on Stripe’s published US pricing. The tenant verifies the bank with Financial Connections or micro-deposits. Settlement takes several business days, and the bank can still return the payment. Zoho can show an ACH option only by turning on the same Stripe ACH feature underneath. Paddle and Lemon Squeezy are card-and-wallet merchant-of-record products. They are a poor fit for US bank debit.

**International tenants.** Stripe accepts international cards on a US Stripe account. Extra card and currency-conversion fees apply (on the order of 1.5 percent for an international card and about 1 percent if the charge is converted, on Stripe’s published US account pricing). ACH is a US rail. Do not promise ACH to a bank outside the US. Zoho does not remove those card fees, because the card still runs through Stripe or another gateway.

**Custom price per tenant.** Stripe can create a Price used by one customer and leave the shared catalog prices for everyone else. Zoho can also store a custom price, but then both Zoho and Stripe must be updated when the admin changes the fee. That is the failure mode this design avoids.

**Subscription and one-time.** Stripe Checkout has two modes: `subscription` and `payment`. One pay page covers both. Zoho subscriptions and one-time invoices are a second implementation of the same choice.

**Free until a person turns charging on.** This is our rule, not a Stripe or Zoho feature. While the switch is off we simply do not create a Stripe subscription. Zoho’s trial and dunning settings would fight that rule if Zoho were allowed to decide when the first invoice goes out.

**Hosted pay page and mobile.** Stripe Checkout and the Customer Portal are hosted and work on phones. We do not build a card form, so we do not take on card-data scope. The membership mobile wallet button is the wrong tool here: it was built for a person’s membership, not for a negotiated tenant fee plus ACH.

**Extra cost.** Stripe Billing on pay-as-you-go adds a small percentage on recurring volume (about 0.7 percent on Stripe’s published pricing) on top of the card or ACH fee. There is no second vendor. Zoho Billing is a paid Zoho plan per organization, and the card fee is still Stripe’s. Paddle and similar merchant-of-record products take roughly 5 percent and file sales tax for you. That extra percent is only worth it if filing tax in many countries is the actual problem.

**Tax in many countries.** Stripe will calculate tax if we turn Stripe Tax on, but we still file the returns. A merchant of record (Paddle, Lemon Squeezy) files for you and costs more. That question is phase 5 in [BUILD_PLAN.md](BUILD_PLAN.md). It is not a reason to start on Zoho.

## Why a second system is the expensive mistake

If Zoho created the invoice and Stripe collected it:

- The charge switch would have to be enforced in two places.
- A custom fee edited in our admin screen could be overwritten by a Zoho price.
- Webhooks would arrive from both products. Ticket code, membership code, Zoho code, and tenant-fee code would share one Stripe endpoint and would be easy to mix up.
- A failed ACH return might show “paid” in one system and “open” in the other.
- Support would have to open Zoho, Stripe, and this admin app to answer “why was this tenant charged?”

None of that buys a payment method Stripe does not already have.

## What we will configure in Stripe (when the build starts)

This is the checklist for phase 2. It is not done yet.

1. One Product for “Event site platform” and one Product for “Gas station platform.”
2. Shared Prices on those products for the published catalog (monthly, and yearly if offered).
3. Gas-station location pricing as a graduated recurring Price (each tier applies only to the locations inside that tier).
4. A one-off Price only when a tenant has a custom fee. Store that Price id on that tenant’s product row.
5. Checkout payment methods: card, Link, and `us_bank_account`. Wallets appear when the device supports them.
6. Customer Portal: update payment method, invoice history, cancel at period end.
7. Every Checkout session for this fee includes metadata `billingScope=platform_tenant`, plus the tenant id and the product (event site or gas station).
8. The existing Stripe webhook keeps handling tickets and memberships. It must ignore `billingScope=platform_tenant` in those branches and handle it in a separate branch that updates the tenant product row only.

## When Zoho would be reconsidered

Only if all of these are true:

- The bookkeeper already lives in Zoho Books and will not read Stripe invoices.
- Zoho is a read-only or after-the-fact copy. Stripe still creates the charge.
- Nobody turns the charge switch, edits the custom fee, or marks a tenant paid inside Zoho.

If those are not all true, do not add Zoho.

## Pricing figures in this note

Dollar fees above are Stripe’s published US-account figures at the time this note was written (card 2.9 percent plus 30 cents, international card surcharge, ACH 0.8 percent capped at $5, Billing about 0.7 percent of recurring volume). Confirm them in the Stripe Dashboard before the first live tenant is charged. Catalog prices for our own plans ($49, $149, gas-station tiers) are placeholders in [PLATFORM_TENANT_BILLING_GUIDE.md](PLATFORM_TENANT_BILLING_GUIDE.md), not Stripe’s fees.
