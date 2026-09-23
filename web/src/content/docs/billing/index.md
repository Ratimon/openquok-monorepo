---
title: Overview - Billing
description: OpenQuok Cloud billing — Stripe subscription, plan limits, downgrades, offers, and refunds.
order: 0
lastUpdated: 2026-09-23
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Billing

> Stripe subscriptions, plan limits, downgrades, offers, and refunds for OpenQuok Cloud.

**Where:** Open the account menu in the header, then choose <Badge text="Billing" variant="default" />. The page opens at <a href="/account/billing">/account/billing</a>. When you own more than one workspace, pick the workspace in the Billing title or switch workspace in the header.

Charges run through **Stripe**. Workspace **owners** subscribe, upgrade, and cancel. Other members can open Billing to see plans but cannot checkout or change billing.

Plan names and included limits are on <a href="/pricing">Pricing</a>. How hosted OpenQuok differs from self-host is in <a href="/docs/cloud">OpenQuok Cloud</a>.

<Callout type="note">
<p>Self-hosted installs without Stripe do not use this billing flow. See <a href="/docs/configuration-backend/stripe">Stripe billing</a> if you bill your own users.</p>
</Callout>

## In this section

<CardGrid>
<LinkCard title="Subscription" description="Checkout, plan changes, portal, and cancellation" href="/docs/billing/subscription" />
<LinkCard title="Limits" description="Channels, posts, seats, storage, and API caps" href="/docs/billing/limits" />
<LinkCard title="Downgrades and cancellation" description="What changes when a plan shrinks or ends" href="/docs/billing/downgrades" />
<LinkCard title="Codes and offers" description="Promotion codes and retention discounts" href="/docs/billing/codes-and-offers" />
<LinkCard title="Refunds and support" description="Refund window and billing help" href="/docs/billing/refunds-and-support" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Plans" description="Solo, Team, Ultimate, and Max" href="/docs/cloud/plans" />
<LinkCard title="Trial" description="7-day Cloud trial" href="/docs/cloud/trial" />
<LinkCard title="Help" description="Support channels and troubleshooting" href="/docs/help" />
</CardGrid>
