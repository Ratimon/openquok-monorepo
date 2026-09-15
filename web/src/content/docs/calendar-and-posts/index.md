---
title: Overview
description: Home kanban, the OpenQuok calendar, post chips, filters, and how to open the composer from a slot.
order: 0
lastUpdated: 2026-09-14
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok keeps your content pipeline in two places on <a href="/account">Home</a>: the **kanban board** shows **stage** (draft, scheduled, published), and the <a href="/account/calendar">calendar</a> shows **when** each post ships. Both views read the same post groups — change one and the other updates.

This section covers the calendar surface, moving posts between slots, post actions (duplicate, delete, statistics), and <a href="/docs/calendar-and-posts/approvals">client approvals</a>. For composing copy and picking save buttons, start with <a href="/docs/creating-posts/scheduling">Scheduling</a> and <a href="/docs/creating-posts/kanban">Kanban board</a>.

## In this section

<CardGrid>
<LinkCard title="Moving posts" description="Drag on the calendar, published reschedule dialog, and programmatic reschedule" href="/docs/calendar-and-posts/moving-posts" />
<LinkCard title="Actions and stats" description="Duplicate, delete, export, statistics, and connect" href="/docs/calendar-and-posts/actions-and-stats" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/calendar-and-posts/approvals" />
</CardGrid>

## Calendar views

Open <a href="/account/calendar">/account/calendar</a> from the sidebar or the **Calendar** button on the Home kanban filters.

| Control | Options |
| --- | --- |
| **Day** · **Week** · **Month** | How much of the timeline you see at once |
| Calendar-clock icon · List icon | **Calendar view** (time grid) or **List view** (upcoming rows) |
| **Previous** · **Next** · **Today** | Move the visible range |

**Day** and **Week** show a **24-hour time grid** with half-hour rows. Posts sit in the row that matches their scheduled time. **Month** collapses each day into a compact cell — you still see chips, but without the per-slot body text.

**List view** is a scrollable queue sorted by date. It is useful for a quick read of what is coming up, but you cannot drag posts there — use the grid views to reschedule. See <a href="/docs/calendar-and-posts/moving-posts">Moving posts</a>.

Past hours in day and week views get a striped **Date passed** background. You cannot create or drop posts into those cells.

## Filters

The filter row under the calendar navigation uses the same <a href="/docs/getting-started/glossary#smart-filter">smart filter</a> pattern as Home:

| Filter | What it limits |
| --- | --- |
| **Channel groups** | Posts tied to channels in the groups you pick — see <a href="/docs/channels/channel-groups">Channel groups</a> |
| **Platforms** | Only posts for selected social platforms (shown when you have more than one) |
| **Post types** | Draft, scheduled, published, failed, or repeating rows |
| **Tags** | Posts tagged with specific <a href="/docs/getting-started/glossary#tag">tags</a> |

**Post types** includes a synthetic **Repeating** option for recurring series (posts with a repeat interval). That is separate from the database state — a repeating draft and a repeating scheduled post both match when **Repeating** is on.

Below the filters, **targeted channels** shows avatar chips for connected channels that match your current group and platform selection. They are a quick visual check, not an extra filter.

## Post chips

Each chip on the grid is one **post group** scheduled for that slot.

| Signal | Meaning |
| --- | --- |
| Header **Draft** · body prefix **Draft:** | Saved as draft — will not publish until you schedule |
| Header **Scheduled** | Queued for the shown time |
| Header **Published** | Already sent to the network |
| Header **Failed** | Publish error — open the post to read the platform message |
| **+N** badge · stacked avatars | Multiple channels in one slot — click opens **Posts in this slot** |
| Refresh icon on header | Recurring post — see <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a> |

Day and week chips show the caption snippet, channel name, and time. Month chips are header-only for space.

Tag colors from the composer tint the chip when a tag is set on the group.

## Open a post or create in a slot

Interactions are **click-based** — there is no hover menu on chips.

| You click… | What happens |
| --- | --- |
| A **single-channel** chip | **Post actions** modal — edit, duplicate, preview, statistics, delete. See <a href="/docs/calendar-and-posts/actions-and-stats">Actions and stats</a> |
| A **multi-channel** chip | **Posts in this slot** — pick **Open** on the row you need |
| An **empty** time cell | Opens the composer with that slot's time prefilled (at least five minutes in the future) |
| The **+** strip on the left edge of the grid | Same as an empty cell — **Schedule a new post** |
| **Shift+click** a chip (day/week) | Create a new post at the hovered hour while keeping the original |

Use **Create Post** in the page header when you do not care about a specific slot yet.

On phones and coarse pointers, tapping an empty slot may show **Schedule slot** first, then **Create post**.

<Callout type="tip">
<p>Double-click a card on the Home kanban to open the editor directly. On the calendar, click once for <strong>Post actions</strong>, then <Badge text="Edit" variant="default" />.</p>
</Callout>

## Kanban vs calendar

| Question | Use |
| --- | --- |
| What stage is this post in? | Home kanban — <a href="/docs/creating-posts/kanban">Kanban board</a> |
| When does it go out? | Calendar |
| Move between draft and scheduled without a new time? | Drag on the kanban |
| Move to a different day or hour? | Drag on the calendar — <a href="/docs/calendar-and-posts/moving-posts">Moving posts</a> |

See <a href="/docs/getting-started/glossary#calendar-vs-kanban">Glossary → Calendar vs kanban</a> for the full comparison.

## Related Section(s)

<CardGrid>
<LinkCard title="Scheduling" description="Save as draft, add to calendar, repeat, and tags in the composer" href="/docs/creating-posts/scheduling" />
<LinkCard title="Kanban board" description="Draft, scheduled, and published columns on Home" href="/docs/creating-posts/kanban" />
<LinkCard title="Posting time slots" description="Per-channel hours that feed suggested times" href="/docs/channels/time-slots" />
<LinkCard title="Timezone" description="How calendar labels follow your browser setting" href="/docs/settings/timezone" />
</CardGrid>
