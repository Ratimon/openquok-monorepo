---
title: Overview - OpenQuok Cloud
description: Comparison between Cloud hosted Paid Plan vs self-host free plan.
order: 0
lastUpdated: 2026-09-23
sidebar:
  label: Overview
---

<script>
import { Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## OpenQuok Cloud

> What the hosted product gives you, and how it differs from running OpenQuok yourself.

OpenQuok Cloud is the same application you can run on your own servers. You use it at <a href="https://www.openquok.com">openquok.com</a>. The features match self-hosting: calendar, composer, agents, CLI, MCP, and the public API.

The difference is who does the work. On Cloud, OpenQuok runs the hosted stack, registers the social developer apps, and enforces limits from your <a href="/docs/cloud/plans">plan</a>.

You connect channels and schedule posts. You do not manage database(including Redis and supabase), workers, CLI Auth/MCP servers or maintain OAuth keys/ API integration with different social platforms.

## There is no free plan

On Cloud, a workspace without a paid subscription cannot use the scheduler. New accounts see the plan  until they subscribe or start a free trial.

Most new workspaces can use a <a href="/docs/cloud/trial">7-day trial</a> instead. You can explore without a credit card. When the trial ends, you need an active subscription to keep scheduling.

**Self-hosting** does not use this gate. If you run OpenQuok yourself and leave Stripe unset, there is no hosted paywall. You operate the server, backups, and social apps.

<Callout type="tip">
<p>Read <a href="/self-hosting">Self-host OpenQuok</a> for paths and cost, or <a href="/docs/installation">Installation</a> for step-by-step docs. Operators who enable Stripe on their own instance can bill workspaces the same way Cloud does — <a href="/docs/configuration-backend/stripe">Stripe billing</a>.</p>
</Callout>

## Cloud vs self-hosted

| | OpenQuok Cloud | Self-hosted |
| --- | --- | --- |
| **Plans and limits** | Enforced per <a href="/docs/cloud/plans">plan</a> through Stripe | Stripe unset: billing UI off; guards do not run |
| **Channel connect** | Pre-registered OAuth — click Connect and authorize | You register each provider app and supply keys |
| **Trial** | 7 days for eligible accounts | Not applicable |
| **Billing** | Stripe at <a href="/account/billing">/account/billing</a> | Not applicable unless you configure Stripe |
| **Support** | Email, Discord, and <a href="/docs/billing/refunds-and-support">refund policy</a> | Community Discord; you operate the stack |
| **Updates** | Applied on the hosted service | You upgrade when you choose |
| **Source code** | OpenQuok runs the hosted build and ships updates. We maintain the product; you do not patch the hosted servers. | <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">open source on GitHub</DocsExternalLink> (AGPL-3.0-or-later). You may change the code for your instance. You apply upgrades at your own risk. |
| **Data location** | Hosted by OpenQuok | Your infrastructure |

<Callout type="warning">
<p>You may run OpenQuok as a service for your customers/others. The license is AGPL-3.0-or-later. If you offer OpenQuok (or a modified version), you must release your source under the same license. You cannot ship a closed proprietary fork. See the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">repository</DocsExternalLink> and the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/LICENSE">LICENSE</DocsExternalLink> file for the full terms.</p>
</Callout>

<Callout type="tip">
<p>Calendar, composer, CLI, MCP, and the public API behave the same on Cloud and self-host. How to <em>use</em> the product is in the <a href="/docs/getting-started">Guide</a>.</p>
</Callout>

## In this section

<CardGrid>
<LinkCard title="Plans and limits" description="Tier prices, workspaces, channels, and caps" href="/docs/cloud/plans" />
<LinkCard title="Trial" description="7-day Cloud trial with no credit card required to start" href="/docs/cloud/trial" />
</CardGrid>

## Billing

<CardGrid>
<LinkCard title="Subscription" description="Stripe checkout, upgrades, cancellation, and portal" href="/docs/billing/subscription" />
<LinkCard title="Limits" description="Channels, posts, seats, storage, and API caps" href="/docs/billing/limits" />
<LinkCard title="Downgrades and cancellation" description="What changes when a plan shrinks or ends" href="/docs/billing/downgrades" />
<LinkCard title="Codes and offers" description="Promotion codes and retention discounts" href="/docs/billing/codes-and-offers" />
<LinkCard title="Refunds and support" description="Refund window and how to reach the team" href="/docs/billing/refunds-and-support" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Guide" description="Connect channels, compose, and review on the calendar" href="/docs/getting-started" />
<LinkCard title="Self-hosting overview" description="Hosted cloud vs Docker Compose vs your own cloud stack" href="/self-hosting" />
<LinkCard title="Installation" description="Docker Compose and operator docs" href="/docs/installation" />
<LinkCard title="Pricing" description="Current plan prices and included limits" href="/pricing" />
<LinkCard title="Help" description="Support channels and troubleshooting links" href="/docs/help" />
</CardGrid>
