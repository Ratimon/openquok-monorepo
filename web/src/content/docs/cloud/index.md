---
title: Overview
description: OpenQuok Cloud vs self-hosting for the social scheduler — hosted plans, Stripe billing, pre-registered OAuth, and when to run your own stack.
order: 0
lastUpdated: 2026-08-22
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**OpenQuok Cloud** is the hosted social scheduler: sign up, connect channels, and schedule posts without operating databases, workers, or provider developer apps. The product is the same application you can [self-host](/docs/installation); Cloud is who runs the stack, who registers OAuth apps, and how plan limits are billed.

Cloud has **no free plan**. New workspaces start a [7-day trial](/docs/cloud/trial) (no credit card required to explore). After the trial, an active Stripe subscription is required to keep scheduling on the hosted product.

Self-hosted installs skip that gate when Stripe is unset — see [Stripe billing](/docs/configuration-backend/stripe).

## Cloud vs self-hosted

| | OpenQuok Cloud | Self-hosted |
| --- | --- | --- |
| **Plans and limits** | Enforced per [plan](/docs/cloud/plans) through Stripe | Stripe unset: billing UI disabled; subscription guards do not run |
| **Channel connect** | Pre-registered OAuth apps — click Connect and authorize | You register each provider app and supply keys |
| **Trial** | 7 days, no card to start | Not applicable |
| **Billing** | Stripe Checkout and Customer Portal at <a href="/account/billing">/account/billing</a> | Not applicable unless you configure Stripe yourself |
| **Support** | Discord plus the [refund policy](/docs/cloud/refunds-and-support) | Community Discord; you operate the stack |
| **Updates** | Applied on the hosted service | You upgrade when you choose |
| **Data location** | Hosted by OpenQuok | Your infrastructure |

<Callout type="tip" title="Same product, different operator">
<p>Calendar, composer, kanban, CLI, MCP, and the public API work the same on Cloud and self-host. How to <em>use</em> those surfaces lives in the <a href="/docs/getting-started">Guide</a>. This section is trial, plans, billing, and limits.</p>
</Callout>

## In this section

<CardGrid>
<LinkCard title="Plans" description="Solo, Team, Ultimate, and Max — see Pricing for current numbers" href="/docs/cloud/plans" />
<LinkCard title="Trial" description="7-day Cloud trial with no credit card required to start" href="/docs/cloud/trial" />
<LinkCard title="Subscription" description="Stripe checkout, upgrades, cancellations, and the billing portal" href="/docs/cloud/subscription" />
<LinkCard title="Limits" description="What happens when you hit a workspace, channel, post, or storage cap" href="/docs/cloud/limits" />
<LinkCard title="Refunds and support" description="Refund window, unused periods, and how to reach the team" href="/docs/cloud/refunds-and-support" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Guide" description="Connect channels, compose, and review on the calendar or kanban" href="/docs/getting-started" />
<LinkCard title="Self-hosting" description="Docker Compose, configuration, and operator guides" href="/docs/installation" />
<LinkCard title="Pricing" description="Current Cloud plan names, included limits, and billing period" href="/pricing" />
</CardGrid>
