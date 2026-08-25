---
title: Posting time slots
description: Per-channel usual posting times in OpenQuok — a convenience for scheduling suggestions, not a hard limit on when you can publish.
order: 3
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What they are

Each channel has its own **time slots** — the hours you usually post on that network. LinkedIn might be 9:00, Instagram 18:00, and so on.

Slots are a convenience, not a lock. You can still pick any date and time in the post editor.

## Open the editor

On <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a>, open a channel’s menu and click <Badge text="Edit time slots" variant="default" />. The modal title is <Badge text="Time table slots" variant="default" />.

## Add, remove, and save

<p>Choose an hour and minutes, click <Badge text="Add" variant="new" />, and repeat until <strong>Scheduled times</strong> lists every slot you want. Click <Badge text="Save changes" variant="new" /> when you are done.</p>

OpenQuok requires at least one slot per channel. Removing the last one is blocked. When you remove a slot from the list, a confirm dialog appears first.

## What changes when you save

Saved slots feed the **next suggested schedule time** when you compose a new post. The editor asks for a workspace-wide suggestion before you pick channels — it merges slots from every channel and returns the earliest free time.

Automations and the public API use the same logic. See <a href="/docs/apis-posts/find-slot">Find slot</a>: call <Badge text="GET /public/posts/find-slot" variant="path" /> for a workspace-wide suggestion, or add a channel UUID in the path when you already know the target channel and want only that channel’s slots.

<Callout type="note">
<p>Time slots do not change how the calendar grid is drawn. The calendar stays a full 24-hour view; slots only influence schedule-time suggestions.</p>
</Callout>

## New channels

When you connect a channel, OpenQuok starts with three default times — roughly morning, afternoon, and evening in your workspace timezone. Adjust them per channel anytime.

## Timezone

Slot labels follow <Badge text="Timezone" variant="default" /> under <Badge text="Settings" variant="default" /> — the workspace posting timezone described in <a href="/docs/getting-started/tour-the-app">Tour the app</a>. That setting can differ from your laptop clock. Teammates who use a different Settings timezone may see different labels for the same stored slots.

## Related

<CardGrid>
<LinkCard title="Manage a channel" description="Reconnect, disable, or remove a connected account" href="/docs/channels/manage" />
<LinkCard title="Connect a channel" description="Add Channel, sign-in flows, API keys, and invite links" href="/docs/channels/connect" />
<LinkCard title="Find slot" description="Public API endpoint for the next free posting time" href="/docs/apis-posts/find-slot" />
<LinkCard title="Glossary" description="Time slots, channels, and calendar vs kanban" href="/docs/getting-started/glossary" />
</CardGrid>
