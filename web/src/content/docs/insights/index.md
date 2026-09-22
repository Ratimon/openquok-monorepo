---
title: Overview - Insights
description: OpenQuok social scheduler insights — account analytics in the workspace and per-post statistics on published releases.
order: 0
lastUpdated: 2026-09-22
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> See how channels perform over time in **Analytics**, then open one post for its own numbers.

OpenQuok reads metrics from each network when that channel type supports them. You can publish to many platforms. However, only some also send account-level data back.

Those channels appear under **Targeted channels** on the **Analytics** page. The full list is in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.

![Targeted Channels and Overview Analytics Panel](/docs/_assets/insights/targeted-chips-overview.webp)

Per-post figures are not on that page. Open a published post from <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a>, open **Post actions**, and choose **Statistics**. See <a href="/docs/posts-management/actions-and-stats#statistics">Actions and stats</a> for the menu path.

![Statistics for each post](/docs/_assets/insights/per-post-statistics.webp)

## Account analytics vs per-post statistics

| Question | Use this |
| --- | --- |
| How did my Facebook Page or X account do this month? | <a href="/docs/insights/workspace-analytics">Workspace analytics</a> — <Badge text="Analytics" variant="default" /> in the account sidebar |
| How did one published post do? | <a href="/docs/insights/per-post-metrics">Per-post metrics</a> — **Statistics** on the post |

<Callout type="note">
<p>Networks choose which metrics they expose. OpenQuok shows only what the API returns for your account type and connection.</p>
</Callout>

## Date ranges

Workspace **Analytics**, the **Statistics** dialog, the <a href="/docs/apis-analytics">public Analytics API</a>, MCP tools, and <a href="/docs/cli-usages/analytics">CLI analytics commands</a> use the same lookback choices: <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and sometimes <Badge text="90" variant="param" /> days.

Not every channel supports every window. When you target several channels at once, the menu shows only ranges that work for <strong>all</strong> of them. Details are in <a href="/docs/platforms/analytics#date-range-windows">Platforms → Analytics → Date range windows</a>.

## In this section

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, Overview (Trends and metric cards), and empty states" href="/docs/insights/workspace-analytics" />
<LinkCard title="Per-post metrics" description="Statistics from Home and the calendar, and connecting missing releases" href="/docs/insights/per-post-metrics" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Platforms → Analytics" description="Which networks report account vs per-post insights" href="/docs/platforms/analytics" />
<LinkCard title="Actions and stats" description="Post actions menu and the Statistics entry point" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Tour the app" description="Where Analytics lives in the account sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Analytics (CLI)" description="openquok analytics:platform and analytics:post" href="/docs/cli-usages/analytics" />
</CardGrid>
