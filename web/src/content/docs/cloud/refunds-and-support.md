---
title: Refunds and support
description: OpenQuok Cloud refund policy for the social scheduler — unused billing periods, how to contact support, and self-hosted billing.
order: 5
lastUpdated: 2026-08-22
---

<script>
import { Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Cloud charges go through Stripe. Cancel anytime from <a href="/account/billing">Billing</a> to stop the next renewal. Cancellation does not automatically refund the current period.

## Refunds

**Within one month** of payment, you can receive a refund if you **have not used** the product during that billing period.

If you **have used** the product during that billing period (connected channels, scheduled or published posts, and similar product use), contact support. We will work with you on a fair resolution.

<Callout type="note">
<p>Self-hosted deployments are not billed by OpenQuok Cloud. Refund and invoice policies for a private install are yours (or your vendor’s).</p>
</Callout>

This matches the refund answer on the public FAQ / Pricing page. Legal terms on the site still apply where they are more specific.

## How to get help

- **Billing, invoices, plan changes** — workspace owners use <a href="/account/billing">Billing</a> and the Stripe portal first (cards, invoices, cancel).
- **Product questions** — [Overview](/docs/getting-started) and [Quickstart](/docs/getting-started/quickstart).
- **Talk to a person** — join the OpenQuok <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink> and describe the workspace, plan, and what you already tried.

Do not paste programmatic tokens, Stripe secret keys, or provider app secrets into Discord or email.

## Related

<CardGrid>
<LinkCard title="Subscription" description="Cancel, portal, and plan changes" href="/docs/cloud/subscription" />
<LinkCard title="Trial" description="7-day trial before paid billing" href="/docs/cloud/trial" />
<LinkCard title="Cloud overview" description="Hosted vs self-host comparison" href="/docs/cloud" />
<LinkCard title="Pricing" description="Current Cloud plans" href="/pricing" />
</CardGrid>
