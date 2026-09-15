---
title: Actions and stats
description: Duplicate, delete, export, preview, per-post statistics, and connect missing releases from the OpenQuok post actions modal.
order: 2
lastUpdated: 2026-09-14
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

Click a single-post chip on the <a href="/account/calendar">calendar</a> or open the card menu on <a href="/account">Home</a> to reach **Post actions**. The same modal appears in both places — no hover menu, just one click on the chip or the card's action control.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

On a phone, tapping an empty calendar slot may show **Schedule slot** first with **Create post** when you want a new row at that time.

## Post actions menu

When a post is loaded, the modal title is **Post actions**. The header shows channel avatars, the scheduled date (or **Draft**), a status badge, and a content preview.

| Action | What it does |
| --- | --- |
| <Badge text="Edit" variant="default" /> | Opens the composer for this post group |
| <Badge text="Duplicate" variant="default" /> | Copies the group so you can tweak and schedule separately |
| <Badge text="Export & debug as JSON" variant="default" /> | Copies the full post group payload to the clipboard for support or API debugging |
| <Badge text="Preview" variant="default" /> | Opens the public preview page in a new tab — see <a href="/docs/calendar-and-posts/approvals">Approvals</a> |
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

When publish fails, the calendar chip header shows **Failed**. The row is not draggable until you fix the underlying issue.

Open the post (**Edit** from **Post actions**) to read the platform error, reconnect the channel if auth expired, adjust content to match <a href="/docs/platforms">posting rules</a>, then schedule again.

Failed rows also appear when **Post types → Failed** is selected on the calendar filter. In **Posts in this slot**, the status line reads **publish failed** for that row.

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

## Connect a missing release

Inside **Statistics**, when analytics cannot match the post to provider content, OpenQuok shows:

<p><em>Select the content that matches this post:</em></p>

Pick the correct thumbnail from the grid and click **Connect post**. Success toast: **Post connected.**

If the provider does not expose searchable content, you may see *No content found from this provider. The provider may not support this feature.*

The CLI equivalent is <Badge text="posts:connect" variant="default" /> — list candidates with <Badge text="posts:missing" variant="default" />, then pass the post row id and provider release id. See <a href="/docs/cli-usages/managing-posts#connect-a-post">Managing posts → Connect a post</a> and <a href="/docs/apis-posts/release-id">Update Release ID</a>.

Platform-level aggregates (not tied to one post) live under <Badge text="analytics:platform" variant="default" /> and <Badge text="analytics:post" variant="default" /> in the CLI.

## Multi-post slots

When several groups share one calendar cell, click the **+N** chip to open **Posts in this slot**. Each row lists channel, status, and an **Open** button that loads **Post actions** for that group.

Status lines use plain language: **draft**, **scheduled at** the slot time, **published at** the publish time, or **publish failed**.

## Related

<CardGrid>
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/calendar-and-posts/approvals" />
<LinkCard title="Moving posts" description="Drag to reschedule and posts:reschedule for bulk moves" href="/docs/calendar-and-posts/moving-posts" />
<LinkCard title="Calendar overview" description="Filters, chip states, and opening the composer from a slot" href="/docs/calendar-and-posts" />
<LinkCard title="Glossary → Post states" description="Draft, scheduled, published, and failed" href="/docs/getting-started/glossary#post-states" />
<LinkCard title="Managing posts (CLI)" description="posts:connect, posts:delete, and analytics commands" href="/docs/cli-usages/managing-posts" />
</CardGrid>
