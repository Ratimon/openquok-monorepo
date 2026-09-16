---
title: Kanban board
description: Draft, scheduled, and published columns on Home, filters, post cards, and how to move and review posts.
order: 2
lastUpdated: 2026-09-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## The kanban board

> Three columns for draft, scheduled, and published posts — and how to filter them.

**Where:** <a href="/account">Home</a>, in the **On-going Tasks** section below your profile and connected channels.

![Kanban View](/docs/_assets/posts-management/kanban-unfiltered-posts.webp)

The kanban tracks **stage**. Each card is one **post group**. The calendar tracks **time** on the same data. See <a href="/docs/posts-management/calendar">Calendar</a> when you need a date grid.

### Columns

| Column | What it shows |
| --- | --- |
| **Drafted posts** | Saved with <Badge text="Save as draft" variant="default" />. Nothing publishes until you move or schedule the card. |
| **Scheduled posts** | Queued for a future time (<Badge text="Add to calendar" variant="new" />). |
| **Published posts** | Already sent to the network. Open the card menu for the live URL. |

Column headers show a count. When filters hide rows, the badge can read **visible / total** (for example <code>2 / 5</code>).

The board appears only when your workspace has at least one connected channel. See <a href="/docs/channels/connect">Connect a channel</a>.

### Filters

The filter row uses the same <a href="/docs/getting-started/glossary#smart-filter">smart filter</a> pattern as the calendar.

| Filter | What it limits |
| --- | --- |
| **Channel groups** | Cards for channels in the groups you pick — see <a href="/docs/channels/channel-groups">Channel groups</a> |
| **Platforms** | Posts for selected social platforms (shown when you have more than one) |
| **Tags** | Posts with specific <a href="/docs/getting-started/glossary#tag">tags</a> |

![Kanban 's All Filters](/docs/_assets/posts-management/kanban-filters.webp)

**Review** and **Source** sit on the left. The controls are:
- **To do** hides cards you already marked reviewed.
- **Agent** shows drafts from an agent, MCP, CLI, or public API. Pair **Agent** + **To do** when humans must sign off scripted batches.

<Callout type="tip">
<p>Pair **Agent** + **To do** when humans must sign off scripted batches.</p>
</Callout>

**Time** filters split by zone: **All Upcoming**, **Next Week**, and **Next 30 Days** for draft and scheduled columns; **All Past**, **Past Week**, and **Past 30 Days** for published. Use the **Calendar** button beside them to open the date grid for the same posts.

### Post cards


| Signal | Meaning |
| --- | --- |
| **Header colour** | The first post's tag on or default indigo color if not set |
| <Badge text="Draft" variant="deprecated" />` prefix | never publish unless you schedule |
| **Solid outline** | Scheduled for a future time |
| **Published** column | Already live on the network |
| **Reviewed** checkbox | Marks human review complete on the card note |

### Recurring posts

Repeating posts still show as **one card per post group** in **Drafted posts** or **Scheduled posts** — only the next (or current) group at its anchor time.

On the <a href="/account/calendar">calendar</a>, the same groups expand into multiple chips across the visible range — see <a href="/docs/posts-management/calendar#recurring-posts">Recurring posts on the calendar</a>.

After a recurrence publishes, the card moves to **Published posts** and OpenQuok schedules the **next** group as a new card.

To stop what is left in the series, work on the **upcoming** card or open it in the editor:

| Action | Effect |
| --- | --- |
| <Badge text="Delete" variant="deprecated" /> (card menu or post actions) | Removes the upcoming group now. Published cards already in **Published posts** stay. |
| <Badge text="No repeat" variant="param" /> in the composer | After that group publishes once, no further copies are scheduled. |

See <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a> for repeat cadence in the composer.

### How to manage on a post card

Double-click a card to open the editor. Open the card menu for preview, export, delete, and related actions — see <a href="/docs/posts-management/actions-and-stats">Actions and stats</a>.

| You drag… | What happens |
| --- | --- |
| Draft → **Scheduled posts** | Queues the post without opening the composer |
| Draft or scheduled → **Published posts** | **Publish now** after you confirm |
| Between draft and scheduled | Flips status at the same time |

You cannot drag published cards back to draft or scheduled. To change the ship time, use the <a href="/account/calendar">calendar</a> — see <a href="/docs/posts-management/moving-posts">Moving posts</a>.

Double-click the **note** on a card to edit the review checklist, or use the **Reviewed** checkbox when the post is live.

<Callout type="tip">
This checkbox workflow is an alternative way to work with agent drafts, TikTok inbox uploads, and CLI review notes, see <a href="/docs/creating-posts/kanban">Kanban board (creating posts)</a>.
</Callout>

<Callout type="tip">
<p>Drag between <strong>Drafted posts</strong> and <strong>Scheduled posts</strong> to flip status without opening the editor. Drop on <strong>Published posts</strong> to publish now — OpenQuok asks you to confirm first.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Calendar" description="Day, week, month, and list views on the date grid" href="/docs/posts-management/calendar" />
<LinkCard title="Moving posts" description="Drag on the calendar, kanban status moves, and posts:reschedule" href="/docs/posts-management/moving-posts" />
<LinkCard title="Actions and stats" description="Post actions modal — preview, statistics, and delete" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Approvals" description="Preview links before you move a card to Scheduled" href="/docs/posts-management/approvals" />
<LinkCard title="Kanban board (creating posts)" description="Save buttons, review queues, and TikTok inbox workflows" href="/docs/creating-posts/kanban" />
<LinkCard title="Calendar vs kanban" description="Glossary — when to use each surface" href="/docs/getting-started/glossary#calendar-vs-kanban" />
</CardGrid>
