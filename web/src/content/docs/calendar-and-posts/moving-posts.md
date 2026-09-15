---
title: Moving posts
description: Drag posts on the OpenQuok calendar to reschedule, or use the kanban, API, and CLI for bulk moves.
order: 1
lastUpdated: 2026-09-14
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

You can change when a post publishes without reopening the composer. **Drag** a chip on the calendar for draft and scheduled posts, use the Home **kanban** to flip status at the same time, or call the **reschedule** API when you automate at scale.

## Drag on the calendar

**Where:** <a href="/account/calendar">/account/calendar</a> in **Day**, **Week**, or **Month** view (not **List view**).

1. Click and hold a single-post chip — the grip icon appears on draggable rows.
2. Drop on a future day or time slot.
3. OpenQuok saves the new time and shows **Post rescheduled.**

### What you can drag

| Post state | Draggable? |
| --- | --- |
| **Draft** | Yes — stays a draft at the new time |
| **Scheduled** | Yes — moves the queue time |
| **Published** | Yes — but see the dialog below |
| **Failed** | No — fix the error in the editor first |
| **Multi-channel (+N)** chip | No — open **Posts in this slot** and work on one row at a time |
| **List view** row | No — switch to the calendar grid |

### Where you can drop

| Target | Time applied |
| --- | --- |
| **Day** or **Week** grid cell | Snaps to **30-minute** increments; must be at least **five minutes** from now |
| **Month** day cell | Keeps the **same clock time** as the source post on the new day |
| **Date passed** striped cells | Blocked — same rule as creating in the past |
| **List view** | No drop targets |

Valid drop zones highlight with a ring while you drag.

## Published and past-scheduled posts

When you drop a **Published** chip, or a **Scheduled** chip whose time is already in the past, OpenQuok asks before saving:

**Title:** **Reschedule published post?**

| Button | Effect |
| --- | --- |
| **Just update the post details** | Updates the stored publish time only — rows keep their current state |
| **Reschedule the post** | Re-queues publishing at the new time and clears provider release ids so OpenQuok can publish again |

Draft and future scheduled moves skip this dialog — the new time applies immediately with `schedule` semantics.

<Callout type="warning">
<p>Programmatic clients must pass <Badge text="action" variant="param" /> and <Badge text="republish" variant="param" /> explicitly for published groups — the API returns <code>400</code> if you try to re-queue without <Badge text="republish" variant="param" />. See <a href="/docs/apis-posts/reschedule">Reschedule post</a>.</p>
</Callout>

## Recurring posts

Chips with the repeat icon are part of a series. You can drag them like any other single-post row.

After you move a recurring post, OpenQuok may need to refetch the calendar before every future copy appears in the grid. The reschedule dialog adds a note when the post repeats:

<p><em>This post repeats on a schedule. After you move it, refresh the calendar to see every future occurrence.</em></p>

Editing the repeat cadence itself still happens in the composer — see <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a>.

## Kanban moves (same time)

The Home kanban answers a different question: **status**, not **slot**.

| Drag | Result |
| --- | --- |
| **Drafted posts** → **Scheduled posts** | Promotes to scheduled at the **existing** publish time |
| **Scheduled posts** → **Drafted posts** | Pauses publishing — time is preserved |
| **Draft** or **Scheduled** → **Published posts** | **Publish now** after you confirm |

Published cards do not drag backward. For a new hour or day, use the calendar or the reschedule API.

See <a href="/docs/creating-posts/kanban">Kanban board</a> for filters, review notes, and TikTok inbox workflows.

## Programmatic reschedule

Use reschedule when agents, scripts, or integrations move many posts at once. Pass any **post row** id from <Badge text="posts:list" variant="default" /> — the whole **post group** moves together.

**Reschedule a draft or scheduled post to a new time:**

```bash
openquok posts:reschedule <post-id> -s "2026-06-15T14:30:00.000Z"
```

**Re-publish a published group at a new future time:**

```bash
openquok posts:reschedule <post-id> -s "2026-06-20T10:00:00.000Z" --action schedule --republish
```

| Flag | Role |
| --- | --- |
| <Badge text="-s" variant="param" /> <Badge text="--scheduledAt" variant="param" /> | New publish time (ISO-8601, required) |
| <Badge text="--action" variant="param" /> | <code>update</code> (default) — time only, preserve state · <code>schedule</code> — re-queue and clear release ids |
| <Badge text="--republish" variant="param" /> | Required with <code>schedule</code> when any row is already published |

The public API mirrors the CLI: <Badge text="PUT /public/posts/postId/reschedule" variant="path" />. SDK method: <code>reschedulePost()</code>. MCP tool: <code>postsReschedule</code>.

<Callout type="note">
<p><Badge text="posts:status" variant="default" /> flips draft ↔ scheduled <strong>without</strong> changing the stored time. Use reschedule when the slot itself should move.</p>
</Callout>

Full flag tables and HTTP examples live in <a href="/docs/cli-usages/managing-posts#rescheduling-posts">Managing posts → Rescheduling posts</a> and <a href="/docs/apis-posts/reschedule">Reschedule post</a>.

## Related

<CardGrid>
<LinkCard title="Calendar overview" description="Views, filters, chips, and how to open a slot" href="/docs/calendar-and-posts" />
<LinkCard title="Actions and stats" description="Post actions modal after you click a chip" href="/docs/calendar-and-posts/actions-and-stats" />
<LinkCard title="Scheduling" description="Composer save buttons and repeat cadence" href="/docs/creating-posts/scheduling" />
<LinkCard title="Kanban board" description="Drag between draft, scheduled, and published columns" href="/docs/creating-posts/kanban" />
<LinkCard title="Managing posts (CLI)" description="posts:reschedule, posts:status, and delete" href="/docs/cli-usages/managing-posts" />
</CardGrid>
