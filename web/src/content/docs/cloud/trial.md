---
title: Trial
description: OpenQuok Cloud 7-day free trial for the social scheduler — no credit card required to start, plan limits apply, cancel anytime from billing.
order: 2
lastUpdated: 2026-08-22
---

<script>
import { Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

New OpenQuok Cloud workspaces can start a **7-day free trial**. You can create an account, connect channels, and schedule posts **without a credit card**. The trial is 100% free for those seven days; cancel from billing settings at any time.

There is no ongoing free Cloud plan. After the trial, you need an active subscription to keep using the hosted scheduler.

<Callout type="tip">
<p>Plan limits still apply during the trial — they match the tier you pick, time-boxed to seven days. See <a href="/docs/cloud/limits">Limits</a> and <a href="/pricing">Pricing</a>.</p>
</Callout>

## Start the trial

<Steps>

### Create a Cloud account

Sign up from the marketing site and confirm your email if prompted. Your first workspace is created automatically.

### Choose a plan

Open <a href="/account/billing">Billing</a> (or the first-billing screen if Cloud asks you to pick a plan). Select Solo, Team, Ultimate, or Max. Eligible workspaces include a 7-day trial on checkout.

### Use the scheduler

Connect a channel, compose, and schedule as in the [Quickstart](/docs/getting-started/quickstart). Trial quotas are the same categories as paid plans (workspaces, channels, posts per month, seats, storage).

</Steps>

## What you pay

- **Days 1–7** — no charge for the trial period.
- **After day 7** — the subscription for the plan you selected begins unless you cancelled.
- You can **cancel anytime** from <a href="/account/billing">Billing</a> during the trial so you are not billed when it ends.

<Callout type="note">
<p>Some checkout flows confirm a card so billing can start after the trial. The public trial still does <strong>not</strong> require a card to <em>explore</em> the scheduler — if a card is collected, you can cancel before the trial ends without being charged for those seven days.</p>
</Callout>

## End the trial early

If you are ready to start paid billing before day 7, Billing can **finish the trial** and activate the subscription immediately. Wait until the spinner confirms the subscription is active.

## When the trial expires

If the trial ends without an active paid subscription, Cloud blocks scheduling and similar actions until you subscribe. Existing drafts remain in the workspace; they do not publish until the account is on a plan again.

Self-hosted deployments are not on this trial — they follow your operator’s Stripe configuration (or none).

## Related

<CardGrid>
<LinkCard title="Plans" description="How Solo, Team, Ultimate, and Max differ" href="/docs/cloud/plans" />
<LinkCard title="Subscription" description="Checkout, portal, and cancel from Billing" href="/docs/cloud/subscription" />
<LinkCard title="Quickstart" description="Connect a channel and schedule your first post" href="/docs/getting-started/quickstart" />
<LinkCard title="Pricing" description="Current Cloud prices and included limits" href="/pricing" />
</CardGrid>
