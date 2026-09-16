---
title: Calendar
description: Day, week, month, and list views, smart filters, and how to open or create posts from the grid.
order: 1
lastUpdated: 2026-09-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## The calendar

> Day, week, month, and list views — and how to find and filter your posts.

**Where:** <a href="/account/calendar">Calendar</a> in the sidebar, or the **Calendar** button on the Home kanban toolbar.

The calendar is the plan and the record. Drafts, scheduled posts, and published posts sit on the same grid. The Home kanban shows **stage**; the calendar shows **time**. Both views read the same post groups.

![Calendar View](/docs/_assets/posts-management/calendar-unfiltered-posts.webp)

### Views

The default view is **Week**.

| View | What it shows |
| --- | --- |
| **Day** | One day on a full 24-hour timeline with half-hour rows |
| **Week** | Seven day columns on the same timeline |
| **Month** | A six-by-seven grid; each day is a compact cell |
| **List** | Posts in a rolling date window (90 days back, 180 days forward), grouped by date, 100 rows per page |

Posts sit in the row or cell that matches their scheduled time. In **Month** view, chips appear without caption text.

<Callout type="note">
You cannot create or drop posts in past hours in the calendar. This ensure integrity between our real records your past real published posts 
</Callout>

### Timeline and time slots

**Day** and **Week** show a real clock for the full day. Every future half-hour row is available. You can create a post or drag it to any half-hour time slot on the grid.

<a href="/docs/channels/time-slots">Posting time slots</a> are the usual hours for each channel. They suggest the next free time in the post editor.

Use **Previous**, **Next**, and **Today** to move the visible range on the grid. Switch to list mode with the list icon (details below). OpenQuok remembers your view between sessions.

### Filters

The filter row uses the same <a href="/docs/getting-started/glossary#smart-filter">smart filter</a> pattern as Home.

| Filter | What it limits |
| --- | --- |
| **Channel groups** | Posts for channels in the groups you pick — see <a href="/docs/channels/channel-groups">Channel groups</a> |
| **Platforms** | Posts for selected social platforms (shown when you have more than one) |
| **Post types** | Draft, scheduled, published, failed, or repeating rows |
| **Tags** | Posts with specific <a href="/docs/getting-started/glossary#tag">tags</a> |

**Repeating** matches any post with a repeat interval. It is separate from draft or scheduled state.

Below the filters, **targeted channels** shows avatar chips for channels that match your group and platform selection. They are a visual check, not an extra filter.

### List view

What is still a draft? List mode is the quickest way to find out — one scrollable table instead of hunting through grid cells. The same filters above apply; set **Post types** to narrow by state.

Rows use the rolling window from the **Views** table, grouped by date (for example, **Wed, Sep 16**). Undated drafts sit under **No date**. Each row shows the first-tag accent and a state badge (**DRAFT**, **QUEUE**, **PUBLISHED**, **ERROR**). Past published rows stay visible for history.

**Previous** and **Next** shift the list window by 30 days; **Today** re-centers on the current period. You cannot drag in list view — open a row for **Post actions** or reschedule from the grid. See <a href="/docs/posts-management/moving-posts">Moving posts</a>.

<Callout type="tip">
<a href="/docs/posts-management/kanban">Home kanban</a> tracks **stage**; list view tracks **time**. Use the kanban board for workflow columns and list for when posts fall on the calendar.
</Callout>

### Post chips

Each chip is one **post group** in that time slot. The header bar uses the **first tag** on the group. Posts with no tag use the default indigo accent.

| Signal | Meaning |
| --- | --- |
| **Header colour** | First tag on the post group |
| **`Draft:` prefix** + dashed outline | Draft — will not publish until you schedule |
| **Solid outline** | Scheduled for the shown time |
| **Published** pill | Already live on the network |
| **Red ring** + tooltip | Failed — error text in the tooltip |
| **+N** badge | Multiple channels in one slot — click to open **Posts in this slot** |
| Refresh icon | Recurring post — see <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a> |

Day and week chips show caption, channel name, and time in the body. Month chips show the header only. Past slots keep tag colour but render chips in grayscale.

### Recurring posts

Draft and scheduled posts with a repeat interval show **multiple chips** across the visible day, week, month, or list range — one per projected occurrence from the anchor time. Those chips are **projections** of a single post group; navigate the calendar without refreshing and OpenQuok loads the full pattern for the range you are viewing.

Published recurring rows appear **once** at their actual publish time (they are not expanded). After each successful publish, OpenQuok creates the **next physical scheduled group** on the same cadence; that new group expands on the grid like any other repeating draft or queue row. You may see one published chip plus multiple upcoming chips at the same time — they belong to **different post groups**.

Rescheduling a recurring chip moves the **anchor** for that post group. Every projected chip for **that group** shifts together — OpenQuok does not move one occurrence in isolation. See <a href="/docs/posts-management/moving-posts#recurring-posts">Recurring posts</a>.

#### Stop the rest of a series

After the first occurrence publishes, use the **upcoming** scheduled or draft group (not the published chip) to stop what is left:

| Action | Where | Effect |
| --- | --- | --- |
| <Badge text="Delete" variant="deprecated" /> | Post actions on the upcoming group | Removes that post group immediately. Nothing else in the series publishes. Already published rows stay live. |
| <Badge text="No repeat" variant="param" /> | Composer <Badge text="Repeat" variant="default" /> dropdown on the upcoming group | After **that** group publishes once, OpenQuok does not create the next scheduled copy. |

You can combine them: set <Badge text="No repeat" variant="param" /> if you want one more send, or <Badge text="Delete" variant="deprecated" /> if you want to cancel the upcoming group now. See <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a>.

### Create and open posts

Click a chip to act on it. There is no hover menu.

| You click… | What happens |
| --- | --- |
| A **single-channel** chip | **Post actions** — edit, duplicate, preview, statistics, delete. See <a href="/docs/posts-management/actions-and-stats">Actions and stats</a> |
| A **multi-channel** chip | **Posts in this slot** — pick **Open** on the row you need |
| An **empty** time cell | Composer opens with that time prefilled (at least five minutes in the future) |
| The **+** strip on the left edge | Same as an empty cell |
| **Shift+click** a chip (day/week) | New post at the hovered hour; the original stays in place |

Use **Create Post** in the page header when you do not need a specific slot.

On phones, tapping an empty slot may show **Schedule slot** first, then **Create post**.

<Callout type="tip">
<p>Click a chip once for <strong>Post actions</strong>, then <Badge text="Edit" variant="default" />. On Home, double-click a kanban card to open the editor directly.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Kanban board" description="Draft, scheduled, and published columns on Home" href="/docs/posts-management/kanban" />
<LinkCard title="Moving posts" description="Drag on the calendar and reschedule from Home" href="/docs/posts-management/moving-posts" />
<LinkCard title="Actions and stats" description="Post actions modal — preview, statistics, and delete" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Posting time slots" description="Per-channel hours that feed suggested times" href="/docs/channels/time-slots" />
<LinkCard title="Timezone" description="How calendar labels follow your browser setting" href="/docs/settings/timezone" />
<LinkCard title="Calendar vs kanban" description="Glossary — when to use each surface" href="/docs/getting-started/glossary#calendar-vs-kanban" />
</CardGrid>
