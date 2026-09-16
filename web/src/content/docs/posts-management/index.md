---
title: Overview - Posts management
description: Kanban board, calendar views, filters, and how to move, review, and act on posts across Home and the calendar.
order: 0
lastUpdated: 2026-09-16
sidebar:
  label: Overview
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Kanban for stage, calendar for time — same post groups, two ways to work.

<Callout type="tip">
OpenQuok keeps your content in two places. Both views read the same post groups — change one and the other updates:
</Callout>


1) The **kanban board** on <a href="/account">Home</a> shows posts in different **stage** (draft, scheduled, published):

![Kanban View](/docs/_assets/posts-management/posts-unfiltered-kanban.webp)


2) The <a href="/account/calendar">calendar</a> is your schedule and your history — drafts, scheduled posts, and published posts share one grid.

![Calendar View](/docs/_assets/posts-management/posts-unfiltered-calendar.webp)


This section covers the Home kanban board, calendar views, moving posts between slots and stages, post actions (duplicate, delete, statistics), and <a href="/docs/posts-management/approvals">client approvals</a>. For composing copy and picking save buttons, start with <a href="/docs/creating-posts/scheduling">Scheduling</a> and <a href="/docs/creating-posts/kanban">Kanban board</a>.

## In this section

<CardGrid>
<LinkCard title="Kanban board" description="Draft, scheduled, and published columns on Home" href="/docs/posts-management/kanban" />
<LinkCard title="Calendar" description="Day, week, month, and list views on the date grid" href="/docs/posts-management/calendar" />
<LinkCard title="Moving posts" description="Drag on the calendar, published reschedule dialog, and programmatic reschedule" href="/docs/posts-management/moving-posts" />
<LinkCard title="Actions and stats" description="Duplicate, delete, export, statistics, and connect" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/posts-management/approvals" />
</CardGrid>

## Kanban vs calendar

| Question | Use |
| --- | --- |
| What stage is this post in? | Home kanban — <a href="/docs/posts-management/kanban">Kanban board</a> |
| When does it go out? | <a href="/docs/posts-management/calendar">Calendar</a> |
| Move between draft and scheduled without a new time? | Drag on the kanban |
| Move to a different day or hour? | Drag on the calendar — <a href="/docs/posts-management/moving-posts">Moving posts</a> |

See <a href="/docs/getting-started/glossary#calendar-vs-kanban">Glossary → Calendar vs kanban</a> for the full comparison.

## Related Section(s)

<CardGrid>
<LinkCard title="Scheduling" description="Save as draft, add to calendar, repeat, and tags in the composer" href="/docs/creating-posts/scheduling" />
<LinkCard title="Kanban board (creating posts)" description="Save buttons, review queues, and agent draft workflows" href="/docs/creating-posts/kanban" />
<LinkCard title="Posting time slots" description="Per-channel hours that feed suggested times" href="/docs/channels/time-slots" />
<LinkCard title="Timezone" description="How calendar labels follow your browser setting" href="/docs/settings/timezone" />
</CardGrid>
