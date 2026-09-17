---
title: Calendar
description: Day, week, month, and list views, smart filters, and how to open or create posts from the grid.
order: 1
lastUpdated: 2026-09-17
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## The calendar

> Day, week, month, and list views — and how to find and filter your posts.

**Where:** <a href="/account/calendar">Calendar</a> in the sidebar, or the **Calendar** button on the Home kanban toolbar.

The calendar is both the plan and the record. Drafts, scheduled posts, and published posts sit on one grid. While the <a href="/docs/posts-management/kanban">kanban</a> tracks **stage**, the 
calendar shows **time**. Both views read the same 
post groups.

![Calendar Week View](/docs/_assets/posts-management/calendar-unfiltered-posts.webp)

### Views

The default view is **Week**.

| View | What it shows |
| --- | --- |
| **Day** | One day on a full 24-hour timeline with half-hour rows |
| **Week** | Seven day columns on the same timeline |
| **Month** | A six-by-seven grid; each day is a compact cell |
| **List** | Scrollable table for **this week** by default — 100 rows per page; change the toolbar date range or use **Post types** to narrow rows |

<Callout type="tip">
<p>Switch to <strong>Month</strong> when you need the whole month on one screen — spot busy days, open gaps, and how repeating posts spread across dates without scrolling hour rows.</p>
</Callout>

![Calendar Month View](/docs/_assets/posts-management/calendar-month-view.webp)

<Callout type="note">
You cannot create or drop posts in past time slots. This keeps published history accurate.
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

#### Filtering by channel group

When you run social for more than one client or brand, put each account in a <a href="/docs/channels/channel-groups">channel group</a>. The **Channel groups** control limits the grid to those channels — pick one group, several, or **Ungrouped channels** only.

![Calendar's Filter by (un)grouped channel](/docs/_assets/posts-management/calendar-group-filter.webp)

#### Filtering by platform

When your workspace connects more than one social platform, **Platforms** appears in the filter row. Pick one network or several to limit the grid to those channels.

![Calendar's Filter by platform](/docs/_assets/posts-management/calendar-platform-filter.webp)

#### Filtering by tag

Use **Tags** to show posts that carry specific <a href="/docs/getting-started/glossary#tag">tags</a>. Pick one tag, several, or **Untagged** for posts with no tag.

![Calendar's Filter by tag, focusing on Repeating post](/docs/_assets/posts-management/calendar-tag-filter.webp)

#### Filtering by post type

Use **Post types** to narrow the post by its status, including draft, scheduled, published, failed, or repeating.

![Calendar's Filter by tag](/docs/_assets/posts-management/calendar-type-filter.webp)

In above screenshot, **Repeating** matches any post with a repeat interval. It is separate from draft or scheduled state.


### List view

List mode hides the Day / Week / Month switcher and shows a scrollable table instead.

It is the fastest way to answer “what is still a draft?”. Use **Post types** in the filter row to focus on **Draft**, **Scheduled**, **Published**, or everything at once. Rows group by date (undated drafts under **No date**), 100 per page.

The toolbar opens on **this week**; click the **date range** to pick another period (presets include **Last 7 days**, **This month**, and **90 back, 180 ahead**). **Previous** and **Next** step the window; **Today** returns to **this week**. Open a row for **Post actions** — you cannot drag in list view. See <a href="/docs/posts-management/moving-posts">Moving posts</a>.

### Post chips

Each chip is one **post group** in that time slot. The header bar uses the **first tag** on the group. Posts with no tag use the default indigo/purple color.

| Signal | Meaning |
| --- | --- |
| **Header colour** | First tag on the post group |
| **`Draft:` prefix** + dashed outline | Draft — will not publish until you schedule |
| **Solid outline** | Scheduled for the shown time |
| **Published** pill | Already live on the network |
| **Red ring** + tooltip | Failed — error text in the tooltip; not draggable until fixed |
| **+N** badge | Multiple post groups in one slot — one combined chip; click for **Posts in this slot** (no separate **Show more** row) |
| **Grayscale chip** | Publish time is in the past — hover for **Date passed** |
| Refresh icon | Recurring post — see <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a> |

Day and week chips show caption, channel name, and time in the body. Month chips show the header only.

### Recurring posts

Repeating draft and scheduled groups show **multiple chips** across the visible range — one projection per occurrence from the anchor time. OpenQuok loads the full pattern when you change the date range.

![Recurring posts on the calendar](/docs/_assets/posts-management/calendar-recurring-post.webp)

The <a href="/docs/posts-management/kanban">Home kanban</a> shows **one card** per group instead — see <a href="/docs/posts-management/kanban#recurring-posts">Recurring posts on the kanban</a>.

Published recurring rows appear **once** at their actual publish time. After each publish, OpenQuok creates the **next scheduled group** on the same cadence.

Rescheduling a chip moves the **anchor** for that group. Every projected chip shifts together. See <a href="/docs/posts-management/moving-posts#recurring-posts">Moving posts</a>.

#### Stop the rest of a series

After the first occurrence publishes, use the **upcoming** scheduled or draft group to delete what is left:

| Action | Where | Effect |
| --- | --- | --- |
| <Badge text="Delete" variant="deprecated" /> | Post actions on the upcoming group | Removes that post group immediately. Nothing else in the series publishes. Already published rows stay live. |
| <Badge text="No repeat" variant="param" /> | Composer <Badge text="Repeat" variant="default" /> dropdown on the upcoming group | After **that** group publishes once, OpenQuok does not create the next scheduled copy. |

<Callout type="tip">
You can combine them: set <Badge text="No repeat" variant="param" /> if you want one more send, or <Badge text="Delete" variant="deprecated" /> if you want to cancel the upcoming group now. See <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a>.
</Callout>

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
