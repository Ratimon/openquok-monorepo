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

The kanban tracks **stage**, while the <a href="/docs/posts-management/calendar">calendar</a> tracks **time** on the same data. Each card is one **post group**.

![Kanban View](/docs/_assets/getting-started/5-kanban-board.webp)

Drag from <Badge text="draft" variant="experimental" /> to <Badge text="scheduled" variant="new" /> or drop on <Badge text="published" variant="default" />to publish now. Published cards do not drag backward. To change the publish time, use the calendar — see <a href="/docs/posts-management/moving-posts">Moving posts</a>. Double-click a card to edit, or the **note** for complete to-do or review text.

<Callout type="tip">
<p>This checkbox workflow is an alternative way to work with agent drafts, TikTok inbox uploads, and CLI review notes — see <a href="/docs/creating-posts/kanban">Kanban board (creating posts)</a>.</p>
</Callout>

<Callout type="tip">
<p>Drag between <strong>Drafted posts</strong> and <strong>Scheduled posts</strong> to flip status without opening the editor. Drop on <strong>Published posts</strong> to publish now — OpenQuok asks you to confirm first.</p>
</Callout>

### Columns

| Column | What it shows |
| --- | --- |
| **Drafted posts** | Saved with <Badge text="Save as draft" variant="default" />. Nothing publishes until you move or schedule the card. |
| **Scheduled posts** | Queued for a future time (<Badge text="Add to calendar" variant="new" />). |
| **Published posts** | Already sent to the network. Open the card menu for the live URL. |


The board appears only when your workspace has at least one connected channel. See <a href="/docs/channels/connect">Connect a channel</a>.

### Filters

The filter row uses the same <a href="/docs/getting-started/glossary#smart-filter">smart filter</a> pattern as the calendar.

| Filter | What it limits |
| --- | --- |
| **Channel groups** | Cards for channels in the groups you pick — see <a href="/docs/channels/channel-groups">Channel groups</a> |
| **Platforms** | Posts for selected social platforms (shown when you have more than one) |
| **Tags** | Posts with specific <a href="/docs/getting-started/glossary#tag">tags</a> |
| **Review** and **Source** | **To do** hides reviewed cards; **Agent** shows drafts from agents, MCP, CLI, or the public API |
| **Time** | Upcoming window for draft and scheduled columns; past window for published |

#### Filtering by channel group

When you run social for more than one client or brand, put each account/channel in a <a href="/docs/channels/channel-groups">channel group</a>. The **Channel groups** control in the filter row limits the board to those channels — pick one group, several, or **Ungrouped channels** only.

![Kanban's Filter by (un)grouped channels](/docs/_assets/posts-management/kanban-group-platform-type-filters.webp)

#### Filtering by platform

When your workspace connects more than one social platform, **Platforms** appears in the filter row. Pick one network or several to limit cards to those channels.

#### Filtering by tag

Use **Tags** to show cards that carry specific <a href="/docs/getting-started/glossary#tag">tags</a>. Pick one tag, several, or **Untagged** for posts with no tag.

#### Filters (Review and source)

**Review** and **Source** sit on the left of the filter row:

- **To do** hides cards you already marked reviewed.
- **Agent** shows drafts from an agent, MCP, CLI, or public API.

![Kanban 's Filter with Source and Review Controls](/docs/_assets/posts-management/kanban-source-review-filter.webp)

<Callout type="tip">
<p>Pair <strong>Agent</strong> + <strong>To do</strong> when humans must sign off scripted batches.</p>
</Callout>

#### Filtering by time

**Time** filters split by zone:

1) **All Upcoming**, **Next Week**, and **Next 30 Days** for draft and scheduled columns

![Kanban 's Filter for Draft & Scheduled Posts](/docs/_assets/posts-management/kanban-future-filter.webp)

2) **All Past**, **Past Week**, and **Past 30 Days** for published. Use the **Calendar** button beside them to open the date grid for the same posts.

![Kanban 's Filter for Published Posts](/docs/_assets/posts-management/kanban-past-filter.webp)

### Post cards

| Signal | Meaning |
| --- | --- |
| **Header colour** | First tag on the post group, or default indigo when none is set |
| <Badge text="Draft" variant="experimental" /> prefix | Never publish unless you schedule |
| <Badge text="Red" variant="deprecated" /> **ring** + tooltip | Failed — platform error in the tooltip; fix in the editor before you drag again |
| **+N** badge | Multiple channels in one post group — extra avatars collapse into **+N** on the header |
| Refresh icon | Recurring post — cadence in the tooltip |
| **Reviewed** checkbox | Marks human review complete on the card note |

Same status rings and **`Draft:`** prefix as <a href="/docs/posts-management/calendar#post-chips">calendar chips</a>. Past-time styling and **Posts in this slot** apply on the calendar only.

### Recurring posts

The kanban shows **one card per post group** in **Drafted posts** or **Scheduled posts** — the next (or current) group at its anchor time, not every future occurrence.

![Kanban 's draft card with is scheduled for every 2 days](/docs/_assets/posts-management/kanban-recurring-post.webp)

| Signal | Where | Meaning |
| --- | --- | --- |
| Refresh icon + **Every day** (etc.) | Card header | Repeat cadence for this group |
| **Every day** (primary) | Schedule line after the relative time | Same cadence — for example `· Every week` after `(in 17 hrs)` |
| **Every day** (primary) | <a href="/docs/posts-management/actions-and-stats">Post actions</a> summary | Same series as the card labels |

On the <a href="/account/calendar">calendar</a>, the same groups expand into **multiple chips** across the visible range. See <a href="/docs/posts-management/calendar#recurring-posts">Recurring posts on the calendar</a> for projections, rescheduling the anchor, and <a href="/docs/posts-management/calendar#stop-the-rest-of-a-series">stopping the rest of a series</a>.

After a recurrence publishes, the card moves to **Published posts**. OpenQuok schedules the **next** group as a new card in **Drafted posts** or **Scheduled posts**.

See <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a> for repeat cadence in the composer.

### How to manage on a post card

Open the card menu for preview, export, delete, and related actions — see <a href="/docs/posts-management/actions-and-stats">Actions and stats</a>.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

## Related

<CardGrid>
<LinkCard title="Calendar" description="Day, week, month, and list views on the date grid" href="/docs/posts-management/calendar" />
<LinkCard title="Moving posts" description="Drag on the calendar, kanban status moves, and posts:reschedule" href="/docs/posts-management/moving-posts" />
<LinkCard title="Actions and stats" description="Post actions modal — preview, statistics, and delete" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Approvals" description="Preview links before you move a card to Scheduled" href="/docs/posts-management/approvals" />
<LinkCard title="Kanban board (creating posts)" description="Save buttons, review queues, and TikTok inbox workflows" href="/docs/creating-posts/kanban" />
<LinkCard title="Calendar vs kanban" description="Glossary — when to use each surface" href="/docs/getting-started/glossary#calendar-vs-kanban" />
</CardGrid>
