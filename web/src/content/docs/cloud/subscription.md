---
title: Subscription
description: Manage an OpenQuok Cloud subscription — Stripe checkout, plan changes, invoices, and cancellation from account billing.
order: 3
lastUpdated: 2026-08-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Cloud billing lives at <a href="/account/billing">/account/billing</a>. OpenQuok uses **Stripe** for checkout, invoices, and the customer portal. Workspace **owners** change plans and payment methods; other roles can view limits but cannot subscribe, upgrade, or cancel.

<Callout type="warning">
<p>Self-hosted instances with Stripe unset show billing as not configured — no upgrade cards and no paywall. Limits are not enforced by Stripe in that mode. See <a href="/docs/configuration-backend/stripe">Stripe billing</a>.</p>
</Callout>

## Subscribe or change plan

1. Open <Badge text="Billing" variant="default" /> from the account menu (owners only).
2. Pick **monthly** or **yearly**, then a tier (Solo, Team, Ultimate, Max).
3. New subscriptions go through **Stripe Checkout**. If you already have a Stripe subscription, plan changes update that subscription (including a portal link when Stripe requires it).
4. After success, you return to the app; Billing shows the active tier and usage.

Yearly vs monthly and any proration follow Stripe for that subscription. Confirm the next invoice in the Stripe portal if you need a line-item breakdown.

## Payment methods and invoices

From Billing, open the **Stripe customer portal** to:

- Add or replace a card
- Download invoices and receipts
- Update the billing email Stripe has on file

Do not send card numbers to support — portal updates stay in Stripe.

## Cancel

Cancel from Billing when you are the workspace owner. Cancellation **stops future renewals**; it does not refund the current period by itself (see [Refunds and support](/docs/cloud/refunds-and-support)).

If a cancel-at date is set, you keep Cloud access until that date. You can often **reactivate** before it lapses.

<Callout type="note">
<p>Downgrading can require dropping extra workspaces, channels, or seats first. Billing warns when the target tier is below current usage.</p>
</Callout>

## Team and multiple workspaces

Billing is per **organization** (the workspaces you own). Switch workspace in the header if you own more than one and need to manage a different subscription context. Invited members do not pay separately; they consume seats on the owner’s plan.

## Related

<CardGrid>
<LinkCard title="Trial" description="7-day trial, then paid billing on Cloud" href="/docs/cloud/trial" />
<LinkCard title="Limits" description="Caps that block connect, schedule, invite, or upload" href="/docs/cloud/limits" />
<LinkCard title="Where things live" description="Where Billing, Settings, and Developers sit in the app" href="/docs/getting-started/where-things-live" />
<LinkCard title="Pricing" description="Plan names and included limits" href="/pricing" />
</CardGrid>
