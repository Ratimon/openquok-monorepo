---
title: Per-post metrics
description: Post-level statistics from Home and the calendar — date windows, connect missing releases, and API access.
order: 2
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Per-post metrics

> Performance for one published release — not workspace-wide totals.

**Where:** Open a post from <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a>, then choose **Statistics** in **Post actions**.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

Step-by-step for the modal menu is in <a href="/docs/posts-management/actions-and-stats#statistics">Actions and stats</a>.

Account-level charts on the **Analytics** sidebar page do not list individual posts. Use <a href="/docs/insights/workspace-analytics">Workspace analytics</a> for channel-wide trends.

<Callout type="warning">
<p>Which channels support per-post insights depends on the channel key and the platform API. See the per-post table in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.</p>
</Callout>

## Statistics controls

| Control | Purpose |
| --- | --- |
| **7 days** · **30 days** · **90 days** | Same lookback windows as workspace **Analytics** and the public API |
| Metric rows | Views, engagement, and other fields the provider returns for that release |

![Statistics for each post](/docs/_assets/insights/per-post-statistics.webp)

Statistics need a published release id from the network. If OpenQuok never stored one — or the provider changed ids — you may need **Connect** first.

## Connect a missing release

Inside **Statistics**, when analytics cannot match the post to provider content, OpenQuok shows:

<p><em>Select the content that matches this post:</em></p>

Pick the correct thumbnail from the grid and click **Connect post**. Success toast: **Post connected.**

If the provider does not expose searchable content, you may see *No content found from this provider. The provider may not support this feature.*

The CLI equivalent is <Badge text="posts:connect" variant="default" /> — list candidates with <Badge text="posts:missing" variant="default" />, then pass the post row id and provider release id. See <a href="/docs/cli-usages/managing-posts#connect-a-post">Managing posts → Connect a post</a> and <a href="/docs/apis-posts/release-id">Update Release ID</a>.

## Per-post analytics over the API

- <a href="/docs/apis-analytics">Analytics APIs</a> — per-post endpoint with the same <Badge text="date" variant="param" /> window
- <a href="/docs/cli-usages/analytics">CLI</a> — <Badge text="analytics:post" variant="default" /> for a **published** post row
- MCP — <Badge text="analyticsPost" variant="default" />

<Callout type="tip">
<p>The same <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and <Badge text="90" variant="param" /> day windows apply in the Statistics modal, workspace **Analytics**, MCP, and CLI.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, Trends, and metric cards" href="/docs/insights/workspace-analytics" />
<LinkCard title="Platforms → Analytics" description="Per-post coverage by network and channel key" href="/docs/platforms/analytics" />
<LinkCard title="Actions and stats" description="Full post actions menu including Statistics" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Managing posts (CLI)" description="posts:connect and analytics:post" href="/docs/cli-usages/managing-posts" />
</CardGrid>
