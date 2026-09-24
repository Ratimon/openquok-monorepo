---
title: Explore and bookmarks
description: Use the Explore tab on Account Playbooks to search the catalog, filter listings, bookmark favorites, and open public hub pages.
order: 1
lastUpdated: 2026-09-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Explore tab

> Search community playbooks and building blocks, narrow results, and save the ones you want to install later.

On <a href="/account/playbooks">Account → Playbooks</a>, stay on **Explore** (the default tab). The catalog loads building blocks and playbooks from the public hubs.

## Search and kind filters

| Control | Effect |
| --- | --- |
| **Search** | Matches titles and descriptions for both listing types |
| **All** | Shows building blocks and playbooks together |
| **Building blocks** | Only single skills or MCP listings |
| **Playbooks** | Only curated stacks |

![Explore Playbooks](/docs/_assets/playbooks/explore-playbooks.webp)

## Category and tags

Use the **Category** dropdown to filter results to one hub category (for example social publishing or productivity).

Below that, **tag groups** work like the public hubs:

1. Pick a tag group (when available).
2. Toggle one or more tags to narrow the grid.
3. Use **Clear** to reset tag filters without changing search or category.

## Bookmarked filter

Click the **Bookmarked** chip to show only listings you saved. The chip can include a count when you have bookmarks.

<Callout type="note" title="Paid plan">
<p>Saving bookmarks and filtering by <strong>Bookmarked</strong> need a paid Cloud plan. On a free plan you see an upgrade banner when you try to bookmark or turn the filter on. See <a href="/docs/billing/limits">Cloud limits</a> and <a href="/account/billing">Billing</a>.</p>
</Callout>

## Card actions

Open the **⋯** menu on a card:

![Bookmark or View OpenQuok Playbook](/docs/_assets/playbooks/card-actions.webp)

| Action | When to use it |
| --- | --- |
| **Bookmark** / **Remove bookmark** | Save a listing for later (paid plans) |
| **View on hub** | Open the public detail page on <a href="/building-blocks">Building Blocks</a> or <a href="/playbooks">Playbooks</a> |

## Compose from Explore

Building block cards include an **Add** checkbox. Select one or more blocks, then use **Create playbook** in the bar above the grid. That flow continues in <a href="/docs/playbooks/compose-a-playbook">Compose a playbook</a>.

![Select Building Blocks to Create New Playbooks](/docs/_assets/playbooks/compose-building-blocks.webp)

<Callout type="tip">
<p>You can run the same steps from <strong>My Playbooks</strong> when you want to stack your own drafts with catalog entries.</p>
</Callout>

## Empty results

If filters are too tight, the grid shows a short empty message. Clear tags, switch **All**, or turn off **Bookmarked** to widen the list.

## Related

<CardGrid>
<LinkCard title="Compose a playbook" description="Selection bar and Skill Builder handoff" href="/docs/playbooks/compose-a-playbook" />
<LinkCard title="Playbooks overview" description="Tabs, hubs, and OpenQuok Core" href="/docs/playbooks" />
<LinkCard title="Building Blocks hub" description="Public catalog visitors see" href="/building-blocks" />
<LinkCard title="Playbooks hub" description="Public playbook catalog" href="/playbooks" />
</CardGrid>
