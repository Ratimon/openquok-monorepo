---
title: Codes and offers
description: Promotion codes at checkout and retention discounts when you cancel OpenQuok Plan.
order: 4
lastUpdated: 2026-09-23
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Codes and offers

> Discounts apply through Stripe at checkout or when Billing offers a retention deal.

OpenQuok Cloud does not run a separate coupon box inside the OpenQuok web app itself. Valid codes are entered in **Stripe Checkout** when checkout allows promotion codes.

## Promotion codes at checkout

When you start a new subscription or some plan changes, Stripe Checkout may show a field for a **promotion code**.

- Codes are **case-sensitive** and validated by Stripe.
- An expired, already-used, or wrong-plan code is rejected at checkout.
- If a code does not appear, the campaign may not apply to your billing period (for example some codes are monthly-only).

If checkout fails after you apply a code, try again without it or email <a href="mailto:admin@openquok.com">admin@openquok.com</a> with the code name and plan you chose.

## Retention offer when you cancel

If you start cancellation from <a href="/account/billing">Billing</a>, you may be offered a **limited-time discount** (for example 50% off for several months) instead of canceling immediately.

- The offer appears only when your account qualifies — not every cancel flow shows it.
- Accepting it keeps the subscription active at the reduced rate for the offer period, then billing returns to the normal price unless you cancel again.

This is separate from promotion codes at first checkout.

## Special or partner billing

There is no public self-serve “lifetime deal” checkout in the app today. Partner or manual arrangements are applied by the OpenQuok team on the backend. Contact <a href="mailto:admin@openquok.com">admin@openquok.com</a> if you were told you have non-standard billing.

<Callout type="note">
<p>Self-hosted installs bill themselves if they enable Stripe. Promotion and retention flows on <a href="https://www.openquok.com">OpenQuok Cloud</a> do not apply to private deployments.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Plans" description="Tiers and what each includes" href="/docs/cloud/plans" />
<LinkCard title="Subscription" description="Upgrade, downgrade, and cancel" href="/docs/billing/subscription" />
<LinkCard title="Refunds and support" description="Refund window and billing help" href="/docs/billing/refunds-and-support" />
</CardGrid>
