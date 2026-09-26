---
title: OpenQuok's Plans and limits
description: Every Cloud tier — Solo, Team, Ultimate, and Max. Their prices, and what features are included.
order: 1
lastUpdated: 2026-09-26
pricingSchema: true
sidebar:
  label: Paid Plans
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok Social Scheuler has four paid cloud tiers as specified in below table.

## The plans

Yearly billing gives a 20% discount compared to paying monthly for the same year.

| | Solo | Team | Ultimate | 10X Max |
| --- | --- | --- | --- | --- |
| **Per month** | \$29 | \$49 | \$69 | \$129 |
| **Per year** | \$278 | \$470 | \$662 | \$1,238 |
| **Agent workspaces** | 1 | 3 | 5 | 10 |
| **Total channels** | 15 | 45 (15/ workspace) | 100 (20/ workspace) | 250 (25/ workspace) |
| **Posts per month** | 500 | Unlimited | Unlimited | Unlimited |
| **Team members** | 1 | 9 (3/ workspace) | Unlimited | Unlimited |
| **Cloud media storage** | 5 GiB | 15 GiB (5 GiB/ workspace) | 25 GiB (5 GiB/ workspace) | 60 GiB (6 GiB/ workspace) |
| **Shareable preview post to clients** | No | Yes | Yes | Yes |
| **Public API, CLI, and MCP** | Yes | Yes | Yes | Yes |
| **OAuth apps and MCP servers** | 1 | 3 (1/ workspace) | 5 (1/ workspace) | 10 (1/ workspace) |
| **AI Writer and Summarizer** | Unlimited (experimental) | Unlimited (experimental) | Unlimited (experimental) | Unlimited (experimental) |
| **Scheduling, analytics, agents, plugs** | Yes | Yes | Yes | Yes |

<Callout type="note">
<p>These numbers match the plan catalog the app enforces. The live <a href="/pricing">Pricing</a> page list the same catalog with more details and FAQs. If anything disagrees, treat Pricing as the commercial source of truth.</p>
</Callout>

## What the rows mean

<Callout type="tip">
<p>Terms such as workspace, channel, plugs, and templates have longer definitions in the <a href="/docs/getting-started/glossary">Glossary</a>.</p>
</Callout>

**Agent workspaces** separate brands, clients, or agents. One workspace is one agent context. Higher tiers add more workspaces before you hit the cap.

**Total channels** is the count of connected social accounts across all workspaces on the plan. Each profile, page, or server you connect uses one channel. Caps apply per workspace; the table shows the account total. See <a href="/docs/channels/manage">Manage a channel</a>.

**Posts per month** counts scheduled and published posts on your billing account. Solo has a fixed cap; Team, Ultimate, and Max treat volume as unlimited for normal use.

**Team members** are invited editors on your organisation. Seats are per workspace on Team; Ultimate and Max do not cap seats per workspace. Solo is one seat only.

**Cloud media storage** is shared inside each workspace. The table shows total storage on the plan and the per-workspace share when you have more than one workspace.

**Shareable post previews** are public links to review a draft before publish. They start on Team.

**Public API, CLI, and MCP** use the same programmatic token per workspace. See <a href="/docs/getting-started-for-public-api">Public API getting started</a> and <a href="/docs/getting-started-for-mcp">MCP getting started</a>.

**OAuth apps and MCP servers** — each workspace can register one OAuth app (and one MCP endpoint tied to that app) when public API access is on.

**On-device AI Writer and Summarizer** run in a supported Chromium browser. They do not use Cloud credits. Status is experimental.

**Scheduling, analytics, agents, plugs** covers calendar, kanban, multi-channel publish, templates, signatures, agent skills, and plug rules. Every paid tier includes these.

## There is no free plan

A Cloud organisation without a subscription cannot schedule. The app shows the plan picker until you subscribe or start a <a href="/docs/cloud/trial">7-day trial</a>.

Self-hosting does not require Cloud billing. Leave Stripe unset and the hosted paywall stays off — <a href="/docs/configuration-backend/stripe">Stripe billing</a>.

## Choosing a plan

| Plan | Who it is for |
| --- | --- |
| **Solo** | Individuals and solo creators. One agent workspace keeps posting experiments in one place until you know what works. |
| **Team** | Growing teams and businesses. Add workspaces, editors, and reviewers; share drafts with clients; comment in the app and publish after sign-off instead of chasing approval in chat. |
| **Ultimate** | Multiple brands or AI agents. Split brands across workspaces, invite the full team, and skip per-seat limits. |
| **10x Max** | Heavy use at scale — many agents, workspaces, and channels when volume is the main job and your format is already proven. |

Count the channels and workspaces you need first. Channel and workspace caps are hard limits. Other limits are easier to work around.

## Hitting a limit

Each cap returns a clear error and a path to fix it. See <a href="/docs/billing/limits">Limits</a>.

## Related

<CardGrid>
<LinkCard title="Trial" description="Start a 7-day Cloud trial without a credit card" href="/docs/cloud/trial" />
<LinkCard title="Limits" description="What the app blocks when a cap is reached" href="/docs/billing/limits" />
<LinkCard title="Subscription" description="Upgrade, downgrade, and manage Stripe billing" href="/docs/billing/subscription" />
<LinkCard title="Pricing" description="Interactive compare table and plan cards" href="/pricing" />
</CardGrid>
