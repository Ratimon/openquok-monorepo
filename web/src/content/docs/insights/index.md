---
title: Overview - Insights
description: Account-level analytics in the workspace and per-post statistics on published releases.
order: 0
lastUpdated: 2026-09-22
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Compare channel performance over time in **Analytics**, then drill into individual posts from the calendar or Home.

OpenQuok pulls metrics from each network’s APIs when the connected channel type supports them. Not every channel you can publish to appears under **Targeted channels** on the **Analytics** page.

<Callout type="note">
<p>Only providers that implement account-level insights show up there</p>
</Callout>

Per-post numbers live on the post itself. Open **Statistics** from **Post actions** after publish.

<Callout type="tip">
<p>The same <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and <Badge text="90" variant="param" /> day windows apply in workspace **Analytics**, the Statistics modal, the <a href="/docs/apis-analytics">public Analytics API</a>, MCP tools, and <a href="/docs/cli-usages/analytics">CLI analytics commands</a>.</p>
</Callout>

## In this section

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, date ranges, overview cards, and empty states" href="/docs/insights/workspace-analytics" />
<LinkCard title="Per-post metrics" description="Statistics from Home and the calendar, and connecting missing releases" href="/docs/insights/per-post-metrics" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Platforms → Analytics" description="Which networks report account vs per-post insights" href="/docs/platforms/analytics" />
<LinkCard title="Actions and stats" description="Post actions menu and Statistics entry point" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Tour the app" description="Where Analytics lives in the account sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Analytics (CLI)" description="openquok analytics:platform and analytics:post" href="/docs/cli-usages/analytics" />
</CardGrid>
