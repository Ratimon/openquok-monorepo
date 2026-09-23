---
title: Downgrades and cancellation
description: What changes in your OpenQuok Cloud workspace when you move to a smaller plan or cancel.
order: 3
lastUpdated: 2026-09-23
sidebar:
  label: Downgrades
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Downgrades and cancellation

> A smaller plan applies new limits right away. OpenQuok does not ask you to pick which channels to keep.

**Where:** Open the account menu in the header, then choose <Badge text="Billing" variant="default" />. The page opens at <a href="/account/billing">/account/billing</a>.

<Callout type="note">
<p>Pick a smaller tier or <strong>Cancel subscription</strong> there. Only the workspace <strong>owner</strong> can change plan or cancel.</p>
</Callout>

Read this before you <a href="/docs/billing/subscription">change plan</a> or cancel.

## Plan downgrade

When you move to a lower tier:

- **New limits apply** as soon as Stripe accepts the plan change (same as on <a href="/docs/billing/subscription">Subscription</a>).
- **Active channels** — if too many are enabled, OpenQuok disables the **newest** ones until you fit the cap. See <a href="/docs/billing/downgrades#active-channels-over-the-new-cap">Active channels over the new cap</a>.
- **Billing may ask you to confirm** when the new plan includes fewer team seats than your current plan.

### Active channels over the new cap

If more channels are **enabled** than the new plan allows, OpenQuok **disables the newest** active channels until you fit the cap.

- Disabled channels **stay connected** — history remains, while they show as disabled on <a href="/account">Home</a>.
- **Scheduled posts on disabled channels do not publish.** Check the <a href="/account/calendar">calendar</a> after a downgrade.
- To publish again, disable a channel you do not need and re-enable the one you want, or upgrade.

Details: <a href="/docs/billing/limits#connected-vs-active-channels">Limits → Connected vs active channels</a>.

### Connected channels over the new cap

The **connected** cap counts every non-deleted channel, including disabled ones. Downgrading does not delete channels.

If you are above the connected cap, you cannot add new accounts until you **delete** channels you no longer need or upgrade.

### Workspaces and seats

- **Workspaces you already own stay** after a downgrade. You **cannot create** another owned workspace until you are under the new cap. Delete or transfer extras if you need a free slot later.
- **Team seats** — members and **pending invites** count toward the per-workspace cap. After a downgrade, **new invites stay blocked** while you are over the cap. Remove extra people or revoke invites yourself, as members are not automaticallyremoveed when the plan shrinks.

When the workspace is full:

> This workspace has reached its team member limit for your current plan.

See <a href="/docs/billing/limits#team-seats">Limits → Team seats</a>.

### Features by plan

Some capabilities are tier-gated (for example **shareable post previews** from Team upward, **public API** on paid tiers).

<Callout type="warning">
<p>Downgrading turns off UI and guards for features your new plan does not include. Settings data usually remains, while the feature simply stops working until you upgrade.</p>
</Callout>

## Cancel entirely

Use **Cancel subscription** on <a href="/account/billing">Billing</a> when you are the workspace owner. You may see a retention offer or a short feedback step first — see <a href="/docs/billing/subscription">Subscription</a>.

When cancel succeeds:

- **Access usually continues** until the end of the period you already paid for (or until the trial ends). Choose **Reactivate subscription** before that date if you change your mind.
- If the subscription is **past due**, or the latest invoice is **open** or **uncollectible**, cancel can end access **immediately** instead of at period end.

When the paid period ends without renewal:

- **Scheduling and publishing stop** for workspaces that no longer have an active paid plan. Scheduled posts stay on the calendar but **do not go out** during the lapse. They are **not published retroactively** when you return.
- **Public API, CLI, and MCP** calls that need a paid plan return billing errors.
- **Your data stays** — channels, posts, media, and settings are not deleted.

One subscription can **cover several workspaces** you own. When that subscription ends, every workspace that relied on it loses paid access together.

Canceling is not the same as deleting your account. Canceling does **not** refund the current period by itself — see <a href="/docs/billing/refunds-and-support">Refunds and support</a>.

## Before you downgrade: checklist

1. Count channels you need enabled; disable the rest yourself if you care which ones survive.
2. Review scheduled posts on channels that might be auto-disabled.
3. Note team members and pending invites if seats will shrink.
4. Check automations that rely on the <a href="/docs/getting-started-for-public-api">public API</a> or MCP.
5. Then change the plan on Billing.

## Related

<CardGrid>
<LinkCard title="Subscription" description="Checkout, portal, cancel, and reactivate" href="/docs/billing/subscription" />
<LinkCard title="Limits" description="Every cap and how to clear it" href="/docs/billing/limits" />
<LinkCard title="Trial" description="Cancel during trial to avoid first charge" href="/docs/cloud/trial" />
</CardGrid>
