---
title: Limits
description: What happens when your OpenQuok's workspace hits a plan cap — channels, posts, seats, storage, and API.
order: 2
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Limits

> Plan caps block the action and show a billing message. Nothing is silently truncated.

**Where:** Caps come from the plan on your workspace. See numbers on <a href="/pricing">Pricing</a> and <a href="/docs/cloud/plans">Plans and limits</a>. Open <Badge text="Billing" variant="default" /> at <a href="/account/billing">/account/billing</a> (account menu) to change tier. Usage hints also appear in the composer, media library, and team settings when you are close to a cap.

<Callout type="note">
<p>During a trial, the same caps apply as the plan you picked. Self-hosted installs with Stripe unset skip these guards.</p>
</Callout>

## What gets capped

| Area | Typical block | What to do |
| --- | --- | --- |
| **Workspaces you own** | Cannot create another owned workspace | Upgrade, or delete a workspace you no longer need |
| **Connected channels** | Cannot connect another account | Delete a channel you no longer need, or upgrade |
| **Active channels** | Cannot turn a disabled channel back on | Disable a different active channel first, or upgrade |
| **Posts per billing month** | Schedule or publish rejected | Wait for the post counter to reset, or upgrade |
| **Team seats (per workspace)** | Invite or join blocked | Remove a member or pending invite, or upgrade |
| **Media storage (per workspace)** | Upload rejected | Delete files in the media library, or upgrade |
| **Public API** | Plan error on <Badge text="/api/v1/public/*" variant="path" /> | Subscribe on a paid tier that includes the public API |
| **Shareable post preview** | Preview links or collaboration comments blocked | Team plan or above on **this workspace’s** subscription (see below) |

## Messages you may see

The app shows plain-language errors like the examples below. The number in the message matches your plan. Many responses also link to <a href="/account/billing">Billing</a> so you can upgrade.

### Workspaces you own

> Your plan includes one workspace. Upgrade to add more.

On higher tiers you may see:

> Your plan allows up to **N** workspaces. Upgrade to add more.

**What to do:** Delete a workspace you no longer need, or upgrade. See <a href="/docs/billing/subscription">Subscription</a>.

### Connected channels

> Your plan allows up to **N** connected channels per workspace. Disconnect a channel or upgrade to add more.

If the plan includes no channels at all:

> Social channels are not included on your current plan.

**What to do:** **Delete** a channel you no longer need (disable alone does not free a connected slot), or upgrade. Reconnecting an **existing** channel does not use an extra slot. See <a href="/docs/channels/manage">Manage a channel</a>.

### Active channels

> Your plan allows up to **N** active channels per workspace. Disable another channel or upgrade to enable this one.

**What to do:** Disable an active channel you do not need, then enable the one you want, or upgrade.

### Posts per billing month

> Your plan allows up to **N** scheduled posts per billing month. Upgrade to schedule more.

If scheduling is not on your plan:

> Scheduled posts are not included on your current plan.

**What to do:** Wait for the billing-month counter to reset, or upgrade. The window follows your subscription period (see below), not always the 1st of the calendar month.

### Team seats

When you send an invite:

> Your plan does not include additional workspace seats. Upgrade to invite team members.

When the workspace is full:

> This workspace has reached its team member limit for your current plan.

If the plan has no team feature:

> Team members are not included on your current plan.

**What to do:** Remove a member or cancel a pending invite, or upgrade. Pending invites count toward the cap.

### Media storage

> Workspace media storage limit reached. Upgrade your plan or delete files.

**What to do:** Delete files in the media library, or upgrade. The quota is **per workspace**.

### Public API (plan)

> Public API access is not included on your current plan.

**What to do:** Subscribe on a paid Cloud tier that includes the public API (Solo and above on current plans).

### Shareable post previews

On the workspace:

> Shareable post previews are not included on this workspace's plan.

For collaboration comments on a preview link:

> Collaboration comments are not included on your current plan.

**What to do:** Upgrade **this workspace’s** subscription to Team or above for preview links. Collaboration comments also need your **account** on a tier that includes previews.

### API and upload rate limits

When you exceed hourly traffic limits, the API returns <Badge text="429" variant="param" /> with a message such as:

> Too many requests, please try again later.

Defaults: **30** requests per hour per <Badge text="opo_" variant="default" /> token on <Badge text="/api/v1/public/*" variant="path" />; **120** per hour on <Badge text="/mcp" variant="path" />; **20** uploads per hour on upload routes.

<Callout type="note">
<p>If you outgrow the defaults, batch calls, spread work across the hour, or email <a href="mailto:admin@openquok.com">admin@openquok.com</a> with your use case. We may offer higher throughput or usage-based API add-ons later. When those ship, they will be listed on <a href="/social-media-posting-api">Social Scheduling API</a>.</p>
</Callout>

<Callout type="tip">
<p>Self-hosted operators can raise or disable limits with backend env vars — <a href="/docs/configuration-backend/rate-limiting">Rate limiting</a>.</p>
</Callout>

**What to do:** Slow down, batch work (one <Badge text="POST /public/posts" variant="path" /> can carry many channels), and retry after the hour rolls over.

## Posts per billing month (how counting works)

The counter is **per workspace**, not per calendar month.

- On a **monthly** subscription, the window starts at your current Stripe period start.
- On **yearly** billing (or when no period start is stored), the window rolls monthly from your subscription anchor (or workspace creation date as a fallback).

Each row counts when it is a **scheduled** post (<Badge text="QUEUE" variant="default" />) or a **published** post with a publish date in the current window.

<Callout type="tip">
<p>Solo has a limit cap, while higher tiers treat volume as unlimited for normal use..</p>
</Callout>

## Shareable post previews

Preview links use **this workspace’s own subscription row**, not a plan inherited from another workspace you own.

<Callout type="note">
<p>A Solo workspace stays without previews even if you also own an Ultimate workspace elsewhere.</p>
</Callout>

## Public API, CLI, and MCP

| Layer | What counts |
| --- | --- |
| **Plan** | Paid tier with public API enabled (Cloud FREE / unpaid blocked) |
| **Hourly public API** | Each HTTP request to <Badge text="/api/v1/public/*" variant="path" /> |
| **Hourly MCP** | Each MCP request on <Badge text="/mcp" variant="path" /> (separate bucket from public API) |
| **Hourly uploads** | <Badge text="/public/upload*" variant="path" /> and dashboard media upload routes |
| **Monthly posts** | Scheduled or published post rows in the billing month |

<p><strong>Same programmatic token.</strong> The <Badge text="opo_" variant="default" /> token from <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> powers the HTTP API, SDK, CLI, and MCP for that workspace.</p>

Quickstart: <a href="/docs/getting-started-for-public-api">Public API getting started</a>.

## Connected vs active channels

Both caps use the **per-workspace channel limit** from your plan (see Pricing for totals when you have several workspaces).

- **Connected** — every channel row in the workspace, including disabled ones. New connect checks this cap. **Disable does not free a slot.** **Delete** frees one.
- **Active** — channels that are not disabled. Scheduling and **Enable channel** check this cap.

<Callout type="note">
<p>After a <a href="/docs/billing/downgrades">downgrade</a>, OpenQuok may auto-disable the **newest** active channels until you fit the active limit. They stay connected. You can re-enable them after you disable something else or upgrade.</p>
</Callout>

### Example (cap = 3 per workspace)

You have **5 connected** and **3 active** (2 disabled):

- You **cannot** add a sixth connection.
- You **can** disable one active channel and enable a disabled one (swap).
- To connect a **new** account, **delete** a channel you no longer need.

## In the app

- Composer and channel pickers show an **upgrade** prompt at the connected cap.
- **Enable channel** is blocked at the active cap until you disable another channel or upgrade.
- Media uploads and the media library show storage usage against the workspace quota.

<Callout type="note">
<p>Provider rules (caption length, expired tokens) are separate from plan caps — see <a href="/docs/troubleshooting/failed-posts">A post failed to publish</a>.</p>
</Callout>

## Losing a limit

Downgrading to a smaller plan does not ask you what to keep. Channels may be auto-disabled; seats and workspaces may block the change until you free capacity. Read <a href="/docs/billing/downgrades">Downgrades</a> before you change plan.

## Cloud vs self-host

| Cloud (Stripe on) | Self-host, Stripe unset |
| --- | --- |
| Guards run; unpaid workspaces cannot schedule | Guards skipped; no hosted paywall |
| Limits from your Cloud plan | Billing UI explains Stripe is not configured |

## Related

<CardGrid>
<LinkCard title="Plans and limits" description="Tier prices and included caps" href="/docs/cloud/plans" />
<LinkCard title="Subscription" description="Upgrade or change billing period" href="/docs/billing/subscription" />
<LinkCard title="Downgrades" description="Auto-disabled channels and other shrink effects" href="/docs/billing/downgrades" />
<LinkCard title="Pricing" description="Interactive compare table" href="/pricing" />
</CardGrid>
