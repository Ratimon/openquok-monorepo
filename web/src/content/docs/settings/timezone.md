---
title: Timezone
description: Set the workspace posting timezone — calendar slots and scheduled times use this, not your laptop clock.
order: 2
lastUpdated: 2026-09-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Timezone

> Workspace posting timezone for calendar slots and scheduled times — not your laptop clock.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Timezone" variant="default" /> (<a href="/account/settings?section=timezone">/account/settings?section=timezone</a>).

This setting section controls how times appear when you schedule posts and read the calendar.

### Clock format

Switch between **AM or PM** and **24 hours**.

### Posting timezone

Pick the IANA zone used for schedule slots, the calendar, and the Time table editor. This is your working timezone for OpenQuok — not necessarily your laptop clock.

<Callout type="note" title="Stored the browser">
<p>Both clock format and timezone are saved in <strong>local storage</strong> on your device. They do not sync to your account. Open Settings on another machine if you need the same display there.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="Scheduling" description="Save buttons, repeat cadence, and how times are labeled" href="/docs/creating-posts/scheduling" />
<LinkCard title="Calendar" description="Day, week, month views — labels follow your timezone" href="/docs/posts-management/calendar" />
<LinkCard title="Posting time slots" description="Per-channel hours that feed suggested schedule times" href="/docs/channels/time-slots" />
<LinkCard title="Posts management" description="Kanban, calendar views, filters, and post actions" href="/docs/posts-management" />
<LinkCard title="Glossary" description="Time slots, calendar vs kanban, and workspace terms" href="/docs/getting-started/glossary" />
</CardGrid>
