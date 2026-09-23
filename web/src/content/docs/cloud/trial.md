---
title: Free trial
description: OpenQuok Cloud 7-day trial — eligibility, abuse policy, payment checks, limits, early finish, cancel, and day 7 billing.
order: 2
lastUpdated: 2026-09-23
sidebar:
  label: Free Trial
---

<script>
import { Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## The free trial

OpenQuok Cloud offers a **7-day trial** on the paid plan you pick. You use the full plan for those seven days. There is no permanent free Cloud tier.

This page applies to **hosted Cloud** at openquok.com.

<Callout type="tip">
<p>Self-hosted installs use your own Stripe setup, or none. See <a href="/docs/cloud">Cloud overview</a>.</p>
</Callout>

## Who gets a trial

You may receive **one** trial per **account** and per **payment customer**. This matches <a href="/terms">Terms of Service</a>.

You will not be eligible for a trial if:

- You already started or finished a Cloud trial on this account
- You already subscribed on this account or payment customer
- You canceled and try to subscribe again
- You create another workspace after you used your trial

The trial is **one per person**, not one per email address. If you register again with a different email to get another trial, that breaks the rules even when checkout allows it.

<Callout type="warning">
<p>If we find repeat trials, shared payment details, or other signs that one person is abusing eligibility, we may <strong>end the trial</strong>, require <strong>immediate paid billing</strong>, or <strong>suspend or close</strong> the affected accounts. We do not owe a second trial.
.</p>
</Callout>

If you expect a trial and do not get one, you likely used it already. Contact support if you think that is wrong.

## Payment method

You can sign up  **without a credit card**. The checkout still asks for a card so billing can start after day 7.

When a card is required, Stripe may place a small **authorization** to verify the card. It is not a charge.

If authorization fails, fix the card or use another one. The trial does not start until checkout succeeds.

## What applies during the trial

During the trial you get the **same limits** as the tier you chose. Scheduling, channels, posts, seats, storage, and API access follow that plan. See <a href="/docs/billing/limits">Limits</a> and <a href="/pricing">Pricing</a>.

We do not hide any features during the trial. Limits still block actions when you hit them, same as on a paid subscription.

## Start the trial

<Steps
	howToName="Start the Cloud trial"
	howToDescription="Sign up, pick a plan, and subscribe with a 7-day trial when your account is eligible."
>

### Create an account

Sign up and confirm your email if we ask you to. Your first workspace is created automatically.

### Pick a plan

Open <a href="/account/billing">Billing</a>, or the first-billing screen after sign-up. Choose Solo, Team, Ultimate, or Max, and monthly or yearly billing.

### Complete checkout

If your account is eligible, checkout includes a 7-day trial. Connect a channel and schedule from the <a href="/docs/getting-started/quickstart">Quickstart</a>.

</Steps>

## End the trial early

Open <a href="/account/billing">Billing</a> and use **Finish trial** when you want paid billing to start now. Wait until the UI confirms the subscription is active.

Use this when you are ready to pay before day 7 ends.

## When the trial ends

On day 7, Stripe charges the plan you selected unless you canceled. The app keeps the same tier and limits. Nothing new unlocks because you already had the full plan.

If the trial ends without a paid subscription, the features is locked until you subscribe afain. Drafts stay in the workspace. They do not publish until billing is active again.

## Cancel during the trial

Cancel from <a href="/account/billing">Billing</a> before day 7 and you are not charged for the trial period. Cancellation stops future renewals. See <a href="/docs/billing/subscription">Subscription</a> for portal access and reactivation.

## Related

<CardGrid>
<LinkCard title="Plans" description="Solo, Team, Ultimate, and Max limits" href="/docs/cloud/plans" />
<LinkCard title="Subscription" description="Checkout, portal, cancel, and invoices" href="/docs/billing/subscription" />
<LinkCard title="Limits" description="What happens when you hit a plan cap" href="/docs/billing/limits" />
<LinkCard title="Pricing" description="Current Cloud prices" href="/pricing" />
</CardGrid>
