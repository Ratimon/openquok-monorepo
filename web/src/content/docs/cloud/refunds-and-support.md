---
title: Refunds and support
description: OpenQuok Cloud refund policy for the social scheduler — 7-day refund window for unused billing periods, how to contact support, and self-hosted billing.
order: 5
lastUpdated: 2026-09-20
---

<script>
import { Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Cloud charges go through Stripe. Cancel anytime from <a href="/account/billing">Billing</a> to stop the next renewal. Cancellation does not automatically refund the current period.

## Refunds

**Within 7 days** of payment, you can request a refund if you **have not used** the product during that billing period. This window matches our Cloud trial length — evaluate the scheduler during the trial, then contact us within seven days of your first charge if you paid but did not use the product.

**How to request a refund:** email <a href="mailto:admin@openquok.com">admin@openquok.com</a> from your account email. Include your workspace name, the billing date, and a short note that you did not use the product during that period. We process eligible requests through Stripe.

If you **have used** the product during that billing period (connected channels, scheduled or published posts, and similar product use), contact support. We will work with you on a fair resolution, but a refund is not guaranteed.

<Callout type="note">
<p>Self-hosted deployments are not billed by OpenQuok Cloud. Refund and invoice policies for a private install are yours (or your vendor’s).</p>
</Callout>

This is OpenQuok&apos;s written refund policy for Cloud billing. It matches the refund answer on the public FAQ and Pricing page. Our <a href="/terms">Terms of Service</a> apply where they are more specific (for example mandatory consumer rights in your country).

## How to get help

- **Billing, invoices, plan changes** — workspace owners use <a href="/account/billing">Billing</a> and the Stripe portal first (cards, invoices, cancel).
- **Product questions** — [Overview](/docs/getting-started) and [Quickstart](/docs/getting-started/quickstart).
- **Talk to a person** — join the OpenQuok <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink> and describe the workspace, plan, and what you already tried.
- **Email** — <a href="mailto:admin@openquok.com">admin@openquok.com</a>. Company address and phone are on <DocsExternalLink href="https://www.openquok.com/about">About</DocsExternalLink>.

Do not paste programmatic tokens, Stripe secret keys, or provider app secrets into Discord or email.

## Related

<CardGrid>
<LinkCard title="Subscription" description="Cancel, portal, and plan changes" href="/docs/cloud/subscription" />
<LinkCard title="Trial" description="7-day trial before paid billing" href="/docs/cloud/trial" />
<LinkCard title="Cloud overview" description="Hosted vs self-host comparison" href="/docs/cloud" />
<LinkCard title="Pricing" description="Current Cloud plans" href="/pricing" />
<LinkCard title="About" description="Support email, phone, and company contact" href="/about" />
</CardGrid>
