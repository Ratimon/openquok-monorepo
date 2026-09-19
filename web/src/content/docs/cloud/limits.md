---
title: Limits
description: What happens when an OpenQuok Cloud workspace hits a plan cap — channels, posts, seats, storage, API, and how to unblock.
order: 4
lastUpdated: 2026-09-19
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

On **OpenQuok Cloud**, plan limits are enforced. When a cap is reached, the action fails with a billing message instead of silently queueing work. Open <a href="/account/billing">Billing</a> to compare usage with your tier, then [upgrade](/docs/cloud/subscription) or free capacity (delete a channel you no longer need, disable channels to swap which ones are active, delete media, wait for the monthly post window).

Exact numbers live on <a href="/pricing">Pricing</a>. This page describes **behavior**, not the price matrix.

<Callout type="note">
<p>During a trial, the same caps apply as the plan you selected — only the clock is seven days. Self-hosted installs with Stripe unset skip these guards.</p>
</Callout>

## What gets capped

| Area | Typical block | What to do |
| --- | --- | --- |
| **Workspaces** | Cannot create another workspace | Upgrade, or delete a workspace you no longer need |
| **Connected channels** | Cannot connect (or invite-to-connect) another social account | Delete channels you no longer need, or upgrade. Counts every non-deleted channel, including disabled ones. Per workspace |
| **Active channels** | Cannot re-enable a disabled channel | Disable another active channel first (swap within your cap), or upgrade. Counts only non-disabled channels. After a downgrade, OpenQuok may auto-disable the most recently connected channels until you are within the new active limit |
| **Posts per month** | Schedule / publish rejected | Wait for the billing month to roll, delete unused scheduled posts if your process allows, or upgrade |
| **Team seats** | Invite or accept member blocked | Remove a member, or upgrade. Seat copy is “invites + you as owner” |
| **Media storage** | Upload rejected | Delete files in the media library, or upgrade |
| **Public API** | HTTP calls to <Badge text="/api/v1/public/*" variant="path" /> with an <Badge text="opo_" variant="default" /> token (same token powers CLI and MCP) | Subscribe to a paid Cloud tier; hourly cap is <strong>30 requests per hour per token</strong> (see below) |
| **Shareable post preview** | Public preview links unavailable | Team and above on current Cloud plans |

Community features and admin-only actions have separate gates; those errors name the missing capability.

## Public API, CLI, and MCP

OpenQuok Cloud enforces two separate caps for programmatic access:

| Cap | What counts | Typical block |
| --- | --- | --- |
| **Hourly API traffic** | Every HTTP request to <Badge text="/api/v1/public/*" variant="path" /> | <code>429</code> when you exceed <strong>30 requests per hour per <Badge text="opo_" variant="default" /> token</strong> |
| **Monthly posts** | Each scheduled or published post row, whether created in the dashboard or via API | Plan guard when <Badge text="posts_per_month" variant="param" /> is exhausted |

<p><strong>Paid plan required.</strong> The free tier does not include public API access. All current paid Cloud tiers (SOLO, TEAM, ULTIMATE, MAX) include it.</p>

<p><strong>Workspace billing, not credits.</strong> OpenQuok charges a subscription per workspace. We do not sell per-post API credits.</p>

<p><strong>Same token, shared limit.</strong> Your workspace programmatic token from Developers → Access powers the HTTP API, Node SDK, CLI, and MCP. OAuth app tokens for third-party apps count toward the same hourly bucket for that workspace.</p>

<p>The hourly cap applies per HTTP request, not per post. Batch multiple channels in one <Badge text="POST /public/posts" variant="path" /> call to stay efficient. Uploads (<Badge text="POST /public/upload*" variant="path" />) have a separate <strong>20 requests per hour</strong> limit per token.</p>

Operators can tune limits with environment variables — see <a href="/docs/configuration-backend/rate-limiting">Rate limiting</a>. End-user quickstart: <a href="/docs/getting-started-for-public-api">Public API getting started</a>.

## Connected vs active channels

Each workspace has two related channel limits on Cloud:

- **Connected** — every channel row that is not deleted, including disabled channels and channels still finishing setup. New connect and invite flows check this cap. **Disable does not free a connected slot.** **Delete** frees one (and also deletes posts for that channel in the workspace).
- **Active** — only channels that are not disabled. Scheduling and re-enable check this cap. You can swap which channels are active by disabling one and enabling another without connecting a new account.

If a downgrade lowers your active limit below how many channels are currently enabled, OpenQuok auto-disables the most recently connected channels until the workspace fits the new limit. Those channels stay connected; they are just paused until you disable something else and re-enable them.

See <a href="/docs/channels/manage">Manage a channel</a> for disable, delete, and enable behavior.

### Example (cap = 3)

Say your plan allows **3 channels per workspace**, and you have **5 connected** — **3 active** and **2 disabled** (for example after a downgrade):

- You **cannot** connect a sixth new account. Connected count is 5; cap is 3.
- You **can** disable one active channel, then enable one of the disabled ones. Active count stays at 3 — a swap, not a new connection.
- To connect a **brand-new** account, **delete** a channel you no longer need to free a connected slot.

| | Connected | Active |
| --- | --- | --- |
| What it counts | Every non-deleted channel | Only non-disabled channels |
| Disable | Still counts | Stops counting |
| Delete | Frees a slot | Frees a slot |

## How it feels in the app

- Composer, Home, and channel pickers show an **upgrade** prompt instead of completing the action when you hit the connected cap.
- **Enable channel** is unavailable (with a billing message) when you are at the active cap until you disable another channel or upgrade.
- API and CLI return an error payload with the same meaning (for example public API not on the plan, or a quota exceeded).
- Media uploads fail with a storage-limit message rather than a generic 500.

None of this changes provider rules (caption length, invalid tokens). Those are product issues — see [Quickstart](/docs/getting-started/quickstart) (confirm a failed card) — not plan caps.

## Cloud vs self-host

| Cloud (Stripe on) | Self-host, Stripe unset |
| --- | --- |
| Guards run; FREE / unpaid workspaces cannot schedule | Guards skipped; no hosted paywall |
| Usage shown on Billing | Billing explains that Stripe is not configured |
| Upgrade at <a href="/account/billing">/account/billing</a> | Operator may still set local quotas in their own fork; stock config does not bill |

Operators who enable Stripe on their instance get the same guard behavior as Cloud.

## Related

<CardGrid>
<LinkCard title="Plans" description="Which Cloud tier to choose before you hit a cap" href="/docs/cloud/plans" />
<LinkCard title="Subscription" description="Upgrade or change billing period" href="/docs/cloud/subscription" />
<LinkCard title="Quickstart" description="Connect a channel, schedule a post, and confirm a failed card" href="/docs/getting-started/quickstart" />
<LinkCard title="Pricing" description="Current numeric limits per plan" href="/pricing" />
<LinkCard title="Public API getting started" description="Authentication, rate limits, and your first POST /public/posts call" href="/docs/getting-started-for-public-api" />
<LinkCard title="Rate limiting" description="Operator env vars for public API, MCP, upload, and other backend limiters" href="/docs/configuration-backend/rate-limiting" />
</CardGrid>
