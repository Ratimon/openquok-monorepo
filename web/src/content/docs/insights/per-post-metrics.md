---
title: Per-post metrics
description: Post-level statistics from Home and the calendar — date ranges, linking a post to network content, and API access.
order: 2
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Per-post metrics

> Stats for one published post — not whole-channel totals on **Analytics**.

**Where:** Open a post from <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a>, then choose **Statistics** in **Post actions**.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

For the full step-by-step, see <a href="/docs/posts-management/actions-and-stats#statistics">Actions and stats</a>.

Channel-wide charts live under **Analytics** in the sidebar. See <a href="/docs/insights/workspace-analytics">Workspace analytics</a> for those totals and **Trends**.

<Callout type="warning">
<p>Not every channel reports per-post stats. See which ones do in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.</p>
</Callout>

## Statistics dialog

| Control | What it does |
| --- | --- |
| **7 days** · **30 days** · **90 days** | How far back the numbers go (same choices as workspace **Analytics**). |
| Rows in the dialog | Views, engagement, and anything else the network sends for that post. |

![Statistics for each post](/docs/_assets/insights/per-post-statistics.webp)


<Callout type="warning">
OpenQuok needs the network’s id for that published post. If stats never appear, or they stopped updating, you may need to <strong>Connect</strong> the post first (next section).
</Callout>

## Connect a missing post

Sometimes OpenQuok cannot match your post to content on the network. **Statistics** then asks you to pick the right item:

> Select the content that matches this post:

Choose the matching thumbnail and click **Connect post**. When it works, you see **Post connected.**


<Callout type="note">
If the network does not let OpenQuok search your posts, you may see <strong>No content found from this provider. The provider may not support this feature.</strong>
</Callout>


## Per-post analytics over the API

Programmatic access uses the same date windows as the **Statistics** dialog:

- <a href="/docs/apis-analytics">Analytics APIs</a> — per-post endpoint with the same <Badge text="date" variant="param" /> window
- <a href="/docs/cli-usages/analytics">CLI</a> — <Badge text="analytics:post" variant="default" /> for a **published** post row
- MCP — <Badge text="analyticsPost" variant="default" />

To link a post without the UI, the CLI equivalent of **Connect post** is <Badge text="posts:connect" variant="default" />. List candidates with <Badge text="posts:missing" variant="default" />, then pass the post row id and provider release id. See <a href="/docs/cli-usages/managing-posts#connect-a-post">Managing posts → Connect a post</a> and <a href="/docs/apis-posts/release-id">Update Release ID</a>.

<Callout type="tip">
<p>The same <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and <Badge text="90" variant="param" /> day windows apply in the Statistics dialog, workspace **Analytics**, MCP, and CLI.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, Trends, and metric cards" href="/docs/insights/workspace-analytics" />
<LinkCard title="Platforms → Analytics" description="Which networks support per-post stats" href="/docs/platforms/analytics" />
<LinkCard title="Actions and stats" description="Full post actions menu including Statistics" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Managing posts (CLI)" description="posts:connect and analytics:post" href="/docs/cli-usages/managing-posts" />
</CardGrid>
