---
title: Calendar
description: Day, week, month, and list views, filters, post chips, and how to open or create posts from the grid.
order: 2
lastUpdated: 2026-09-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## The calendar

> Day, week, month, and list views — and how to filter them.

**Where:** <a href="/account/calendar">Calendar</a> in the sidebar, or the **Calendar** button on the Home kanban toolbar.

The calendar is the plan and the record. Drafts, scheduled posts, and published posts sit on the same grid. The Home kanban shows **stage**; the calendar shows **time**. Both views read the same post groups.

![Calendar View](/docs/_assets/posts-management/posts-unfiltered-calendar.webp)

### Views

The default view is **Week**.

| View | What it shows |
| --- | --- |
| **Day** | One day on a 24-hour grid with half-hour rows |
| **Week** | Seven day columns on the same time grid |
| **Month** | A six-by-seven grid; each day is a compact cell |
| **List** | Upcoming posts in date order |

Posts sit in the row or cell that matches their scheduled time. In **Month** view, chips appear without caption text.

**List view** keeps the same filters as the grid. Each row shows a left accent in the first tag color. Use it to scan what is next. You cannot drag posts in list view — use the grid to reschedule. See <a href="/docs/posts-management/moving-posts">Moving posts</a>.

Use **Previous**, **Next**, and **Today** to move the visible range. Switch between grid and list with the calendar-clock icon and list icon. OpenQuok remembers your view between sessions.

Past hours in day and week views show a striped **Date passed** background. You cannot create or drop posts in those cells.

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

Suggested publish hours come from <a href="/docs/channels/time-slots">Posting time slots</a> in the composer. The day grid uses a 24-hour timeline, not per-channel slot rows.

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
