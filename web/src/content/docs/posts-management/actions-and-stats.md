---
title: Actions and stats
description: Duplicate, delete, export, preview, per-post statistics, and connect missing releases from the OpenQuok post actions modal.
order: 4
lastUpdated: 2026-09-15
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Post actions

> Duplicate, delete, preview, statistics, and connect — from one modal on the calendar or Home.

**Where:** Click a single-post chip on the <a href="/account/calendar">calendar</a> or open the card menu on <a href="/account">Home</a> to open action modal.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

On a phone, tapping an empty calendar slot may show **Schedule slot** first with **Create post** when you want a new row at that time.

## Post actions menu

When a post is loaded, the modal title is **Post actions**. The header shows channel avatars, the scheduled date (or **Draft**), a status badge, and a content preview.

| Action | What it does |
| --- | --- |
| <Badge text="Edit" variant="default" /> | Opens the composer for this post group |
| <Badge text="Duplicate" variant="default" /> | Copies the group so you can tweak and schedule separately |
| <Badge text="Export & debug as JSON" variant="default" /> | Copies the full post group payload to the clipboard for support or API debugging |
| <Badge text="Preview" variant="default" /> | Opens the public preview page in a new tab — see <a href="/docs/posts-management/approvals">Approvals</a> |
| <Badge text="Statistics" variant="default" /> | Opens performance metrics for the published release |
| <Badge text="Delete" variant="deprecated" /> | Removes the entire post group after confirmation |

Preview may show **Preview (upgrade required)** on plans without shareable links — see <a href="/docs/cloud/limits">Cloud limits</a>.

Export succeeds with toast **Debug JSON copied to clipboard.**

## Delete scope

**Delete** always targets the **whole post group** — every channel row in that composition — not just the channel you clicked.

1. Click **Delete**.
2. Confirm **Are you sure?** — **Yes, delete it!** or **No, cancel!**
3. Toast: **Post deleted.**

To remove one channel from a multi-channel post, open **Edit** and deselect that channel before you save.

## Failed posts

When publish fails, the calendar chip keeps shows a **red ring** . Hover the chip to read the platform error in a tooltip. The row is not draggable until you fix the underlying issue.

Open the post (**Edit** from **Post actions**) for the full error. To edit content, reconnect the channel if auth expired, adjust copy to match <a href="/docs/platforms">posting rules</a>, then schedule again.

<Callout type="note">
See <a href="/docs/posts-management/calendar#post-chips">Calendar → Post chips</a> for how failed chips differ from draft and scheduled rows.
</Callout>

<Callout type="tip">
<p>After a failure, <Badge text="posts:status" variant="default" /> and <Badge text="posts:reschedule" variant="default" /> can help agents recover once the content is valid — see <a href="/docs/cli-usages/managing-posts">Managing posts (CLI)</a>.</p>
</Callout>

## Statistics

Choose **Statistics** on a published post (or one with a connected release).

| Control | Purpose |
| --- | --- |
| **7 days** · **30 days** · **90 days** | Analytics window from the connected platform |
| Metric rows | Views, engagement, and other fields the provider returns |

While data loads you see **Loading analytics…**. When the platform has nothing for that post yet, the dialog shows **No statistics available for this post.**

Statistics need a published release id from the network. If OpenQuok never stored one — or the provider changed ids — you may need **Connect** first.

<Callout type="note">
Workspace-wide charts and per-post detail are in <a href="/docs/insights">Insights</a> — see <a href="/docs/insights/workspace-analytics">Workspace analytics</a> and <a href="/docs/insights/per-post-metrics">Per-post metrics</a>.
</Callout>

## Connect a missing release

Inside **Statistics**, when analytics cannot match the post to provider content, OpenQuok shows:

<p><em>Select the content that matches this post:</em></p>

Pick the correct thumbnail from the grid and click **Connect post**. Success toast: **Post connected.**

<Callout type="note">
If the provider does not expose searchable content, you may see <strong>No content found from this provider. The provider may not support this feature.</strong>
</Callout>



The CLI equivalent is <Badge text="posts:connect" variant="default" /> — list candidates with <Badge text="posts:missing" variant="default" />, then pass the post row id and provider release id. See <a href="/docs/cli-usages/managing-posts#connect-a-post">Managing posts → Connect a post</a> and <a href="/docs/apis-posts/release-id">Update Release ID</a>.

Platform-level aggregates (not tied to one post) live under <Badge text="analytics:platform" variant="default" /> and <Badge text="analytics:post" variant="default" /> in the CLI.

## Multi-post slots

When several groups share one calendar cell, click the **+N** chip to open **Posts in this slot**. Each row lists channel, status, and an **Open** button that loads **Post actions** for that group.

Status lines use plain language: **draft**, **scheduled at** the slot time, **published at** the publish time, or **publish failed**.

## Related

<CardGrid>
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/posts-management/approvals" />
<LinkCard title="Moving posts" description="Drag to reschedule and posts:reschedule for bulk moves" href="/docs/posts-management/moving-posts" />
<LinkCard title="Calendar" description="Views, filters, chip states, and opening the composer from a slot" href="/docs/posts-management/calendar" />
<LinkCard title="Kanban board" description="Columns, filters, and card signals on Home" href="/docs/posts-management/kanban" />
<LinkCard title="Glossary → Post states" description="Draft, scheduled, published, and failed" href="/docs/getting-started/glossary#post-states" />
<LinkCard title="Managing posts (CLI)" description="posts:connect, posts:delete, and analytics commands" href="/docs/cli-usages/managing-posts" />
</CardGrid>
