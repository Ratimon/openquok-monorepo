---
title: Refunds and support
description: OpenQuok Cloud refund policy — 7-day window for unused billing periods, billing page tips, and how to reach support.
order: 5
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Refunds and support

> Cancel from Billing. Refund requests follow the policy below.

**Where:** Open the account menu in the header, then choose <Badge text="Billing" variant="default" /> at <a href="/account/billing">/account/billing</a> to cancel or open the Stripe portal for invoices. Email <a href="mailto:admin@openquok.com">admin@openquok.com</a> for refund requests (see **Refunds** below). Only the workspace **owner** manages subscription and portal access.

## Refunds

**Within 7 days** of a charge, you can request a refund if you **have not used** OpenQuok Cloud during that billing period.

**Used** means meaningful product use in that period — for example connecting channels, scheduling or publishing posts, or similar activity in the workspace.

**How to request:** email <a href="mailto:admin@openquok.com">admin@openquok.com</a> from your account email. Include your workspace name, the billing date, and a short note that you did not use the product during that period. Eligible requests are processed through Stripe.

If you **have used** the product during that period, contact support anyway. We will work with you, but a refund is not guaranteed.

**Cancel vs refund:** **Cancel subscription** on Billing stops future renewals. It does **not** automatically refund the current period or unused time. Outside the 7-day unused window, fees are generally **non-refundable**, including partial periods — see our <a href="/terms">Terms of Service</a>.

<Callout type="note">
<p>Self-hosted deployments are not billed by OpenQuok Cloud. Refund rules for a private install are yours.</p>
</Callout>

This matches the refund answer on <a href="/pricing">Pricing</a> and our <a href="/terms">Terms of Service</a>.

## Billing page problems

| Problem | What to try |
| --- | --- |
| Checkout or portal will not load | Allow <Badge text="*.stripe.com" variant="default" /> in ad blockers. Try a normal browser window (not strict private mode). |
| Card declined | Use the Stripe portal from Billing to update the payment method. |
| Discount code rejected | See <a href="/docs/billing/codes-and-offers">Codes and offers</a> — spelling, expiry, and monthly vs yearly rules. |

## How to get help

See <a href="/docs/help">Help and support</a> for the full guide.

- **Billing and invoices** — <a href="/account/billing">Billing</a> and the Stripe portal first.
- **Product issues** — <a href="/docs/troubleshooting">Troubleshooting</a> and <a href="/docs/getting-started/quickstart">Quickstart</a>.
- **Discord** — <DocsExternalLink href="https://discord.gg/wXgWcYzU4">OpenQuok Discord</DocsExternalLink> for quick questions (no API keys or secrets).
- **Email** — <a href="mailto:admin@openquok.com">admin@openquok.com</a>. Company contact on <a href="/about">About</a>.

## Related

<CardGrid>
<LinkCard title="Subscription" description="Cancel, portal, and plan changes" href="/docs/billing/subscription" />
<LinkCard title="Trial" description="7-day trial before paid billing" href="/docs/cloud/trial" />
<LinkCard title="OpenQuok Cloud" description="Hosted vs self-host" href="/docs/cloud" />
<LinkCard title="Help and support" description="How to describe a problem" href="/docs/help" />
<LinkCard title="Pricing" description="Current Cloud plans" href="/pricing" />
</CardGrid>
