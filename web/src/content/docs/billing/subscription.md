---
title: Managing your subscription
description: OpenQuok Subscription — upgrade, downgrade, switch monthly or yearly, cancel, and open the Stripe portal for cards and invoices.
order: 1
lastUpdated: 2026-09-23
sidebar:
  label: Subscription
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Managing your subscription

> Upgrade, downgrade, switch billing period, update your card, or cancel — from Billing in the account menu.

**Where:** Open the account menu in the header, then choose <Badge text="Billing" variant="default" />. The page opens at <a href="/account/billing">/account/billing</a>. When you own more than one workspace, switch workspace in the header.

<Callout type="note">
<p>Only the workspace <strong>owner</strong> can subscribe, change plan, or cancel. Other members can open Billing to see plans for that workspace, but still can not checkout or cancel.</p>
</Callout>

The 7-day trial is offered once per account and per Stripe customer when you are eligible. See <a href="/docs/cloud/trial">Trial</a>.

<Callout type="warning">
<p>Self-hosted installs with Stripe unset show billing as not configured. Subscription guards do not run in that mode. See <a href="/docs/configuration-backend/stripe">Stripe billing</a>.</p>
</Callout>

## Changing plan

On Billing, use the **monthly / yearly** toggle, then choose a tier (Solo, Team, Ultimate, 10x Max).

- **First checkout** (no active Stripe subscription yet): you may pay on the **First Billing** screen after sign-up. Eligible accounts see **Start 7 days free trial** instead of **Purchase**.

- **Plan change** (you already have an active or trialing subscription): Stripe updates the subscription in place. New limits apply when the update succeeds.

<Steps
	howToName="Change your OpenQuok Cloud plan"
	howToDescription="Upgrade, downgrade, or switch monthly and yearly billing from the workspace Billing page."
>

### Open Billing

Sign in as the workspace owner. Open the account menu, choose Billing, and confirm the correct workspace when you own more than one.

### Pick monthly or yearly and a tier

Use the billing period toggle, then select Solo, Team, Ultimate, or 10x Max. Stripe applies the new limits when the update succeeds.

### Review Pay Today

When proration applies, plan cards show Pay Today for the rest of the current period. Upgrades usually charge the difference; downgrades may credit unused time.

</Steps>

When you change tier or billing period, other plan cards can show **Pay Today** — a proration preview for the rest of the current period. Upgrades usually charge the difference. Downgrades credit unused time (Pay Today may show <strong>$0</strong>).

<Callout type="warning">
<p>Read <a href="/docs/billing/downgrades">Downgrades</a> before you shrink a plan. A smaller tier can disable channels or even block seats.</p>
</Callout>

<Callout type="tip">
<p>If Stripe cannot charge the plan change, Billing opens a dialog to the **customer portal** so you can fix the payment method, then try again.</p>
</Callout>

<Callout type="note">
Billing may ask you to confirm a plan change when it would drop team seats below your current usage.
</Callout>

## Switching between monthly and yearly

Use the same period toggle on Billing. Pick the tier again for the period you want. Proration works like a tier change.

Yearly prices include a 20% discount versus twelve monthly payments. See <a href="/docs/cloud/plans">Plans and limits</a>.

## Payment method and invoices

When you have a Stripe customer on file, Billing shows **Update payment method / invoices history**. That opens the **Stripe customer portal** for:

- Card add or replace
- Invoice and receipt download
- Billing email on file

Do not send card numbers to support. Portal changes stay in Stripe.

## Cancelling

Use **Cancel subscription** on Billing when you are the owner and the plan is not already set to end at period end.

<Steps
	howToName="Cancel your OpenQuok Cloud subscription"
	howToDescription="Stop future renewals from Billing while keeping workspace data in your account."
>

### Start cancel from Billing

As the workspace owner, open Billing and choose Cancel subscription when the plan is not already set to end at period end.

### Confirm in the dialog

Complete the cancel flow. You may see a warning if canceling would exceed team limits on a smaller tier.

### Accept or decline retention offers

You may be offered 50% off for three months when you qualify. See Codes and offers for eligibility.

</Steps>

When cancel succeeds:

- Access usually continues until the end of the period you already paid for (or until the trial ends if you are trialing).
- On your **current plan** card, choose **Reactivate subscription** before that date if you change your mind.

Cancellation stops future renewals. It does not refund the current period by itself — see <a href="/docs/billing/refunds-and-support">Refunds and support</a>.

<Callout type="warning">
<p>If the subscription is <strong>past due</strong>, or the latest invoice is <strong>open</strong> or <strong>uncollectible</strong>, cancel can end access <strong>immediately</strong> instead of at period end.</p>
</Callout>

## When the subscription ends

If the paid period ends without a renewal (or the subscription is removed after a failed payment):

- **Scheduling and publishing** stop for workspaces that no longer have an active paid plan. Scheduled posts stay on the calendar but do not go out during the lapse. They are not published retroactively when you return — review the calendar after you resubscribe.
- **Public API, CLI, and MCP** calls that need a paid plan return billing errors.
- **Your data stays** — channels, posts, media, and settings remain in the account.

Canceling is not the same as deleting your account.

## Workspaces you own

Each workspace can have its own Stripe customer. Checkout and portal actions apply to the workspace shown on Billing.

If you own several workspaces, one paid subscription can **cover multiple workspaces** when your plan allows it and you stay within the workspace cap. 

<Callout type="tip">
<p>Workspaces without their own subscription row can inherit the same plan from another workspace you own. Plan limits (channels, storage, seats) still apply <strong>per workspace</strong>.</p>
</Callout>

<Callout type="note">
<p>Invited editors do not pay separately. They use seats on the owner’s plan.</p>
</Callout>




## Related

<CardGrid>
<LinkCard title="Downgrades" description="What shrinks when you move to a smaller plan" href="/docs/billing/downgrades" />
<LinkCard title="Codes and offers" description="Promotion codes and retention discounts" href="/docs/billing/codes-and-offers" />
<LinkCard title="Limits" description="Caps when you connect, schedule, invite, or upload" href="/docs/billing/limits" />
<LinkCard title="Trial" description="7-day trial before paid billing" href="/docs/cloud/trial" />
<LinkCard title="Refunds and support" description="Refund window and how to reach the team" href="/docs/billing/refunds-and-support" />
<LinkCard title="Pricing" description="Plan prices and included limits" href="/pricing" />
</CardGrid>
