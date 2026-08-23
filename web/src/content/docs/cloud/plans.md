---
title: Plans
description: OpenQuok Cloud plans for the social scheduler — Solo, Team, Ultimate, and Max. See Pricing for current limits; this page does not duplicate the price matrix.
order: 1
lastUpdated: 2026-08-22
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok Cloud sells four paid tiers: **Solo**, **Team**, **Ultimate**, and **Max**. Current prices, workspace counts, channel caps, posts per month, seats, and storage are on <a href="/pricing">Pricing</a> — this page does not copy that matrix so it cannot drift.

Every paid plan includes the same product surfaces: multi-channel publishing, calendar and kanban, media library, templates, signatures, analytics, agent integrations, public API, and one OAuth app (and MCP endpoint) per workspace.

<Callout type="note">
<p>Need exact numbers for channels, seats, or storage? Open <a href="/pricing">Pricing</a>. The comparison table there is generated from the same plan catalog the app enforces.</p>
</Callout>

## Which plan to pick

- **Solo** — one agent workspace for an individual or solo creator. Tight channel and post-per-month caps; one seat.
- **Team** — more workspaces and invited editors so a small team can review drafts before publish.
- **Ultimate** — several brands or agents, higher channel totals, unlimited seats per workspace.
- **Max** — high-volume agencies and many parallel agents (most workspaces and channels).

Channel caps are **per workspace**. Totals on Pricing multiply per-workspace channels by the workspace count (for example 15 channels × 3 workspaces). You can connect several accounts on the same network — they all count toward the channel cap.

## What every Cloud plan includes

Shared capabilities (not a substitute for the Pricing table):

- Multi-channel scheduling, calendar, and kanban review
- Media library, reusable templates and signatures, post delays and comments
- Public API, programmatic tokens, and one MCP server per workspace
- One OAuth application per workspace for third-party apps

Shareable post previews start on **Team**. See Pricing for the full compare rows.

## Self-hosted plans

Self-hosting does not require a Cloud subscription. Leave Stripe unset and the hosted paywall stays off — [Stripe billing](/docs/configuration-backend/stripe). Operators who turn Stripe on for their own instance enforce the same catalog.

## Related

<CardGrid>
<LinkCard title="Trial" description="Start a 7-day Cloud trial without a credit card" href="/docs/cloud/trial" />
<LinkCard title="Limits" description="What the app blocks when a cap is reached" href="/docs/cloud/limits" />
<LinkCard title="Subscription" description="Upgrade, downgrade, and manage Stripe billing" href="/docs/cloud/subscription" />
<LinkCard title="Pricing" description="Live plan names, prices, and included limits" href="/pricing" />
</CardGrid>
