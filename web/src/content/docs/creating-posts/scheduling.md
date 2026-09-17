---
title: Scheduling and Publishing
description: Draft, schedule, and publish now — pick a time, repeat a post.
order: 6
lastUpdated: 2026-09-15
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Scheduling

> Save as draft, add to the calendar, or publish now — plus repeat and tags in the footer.

**Where:** Inside the composer, the footer bar — tags and repeat on the left; date, time, and save buttons on the right.

## The three ways to finish a post

| Button | What happens |
| --- | --- |
| <Badge text="Save as draft" variant="param" /> | The post stays in **Drafted posts** on Home. It never publishes until you schedule it. |
| <Badge text="Add to calendar" variant="default" /> | Scheduled for the date and time in the footer. |
| <Badge text="Publish now" variant="default" /> | Publish Now. Open the <Badge text="⋯" variant="default" /> menu on the schedule button to reveal it. |

![Pick a time and save from the composer footer](/docs/_assets/getting-started/4-schedule-or-publish.webp)

When you edit an existing post, the primary button depends on its current status: <Badge text="Schedule" variant="default" /> for a **draft** (moves it onto the calendar), or <Badge text="Update" variant="default" /> for an already **scheduled** post. A <Badge text="Delete Post" variant="deprecated" /> option appears on the left.

You can also move cards on the Home kanban — drag between **Drafted posts** and **Scheduled posts**, or drop on **Published posts** to publish now. See <a href="/docs/posts-management/kanban">Kanban board</a>.

## Picking a time

Click the date control in the footer. The popover sets the **day**, the **hour and minute** under **Pick time**.

If you opened the post editor from a calendar slot, that time is already filled in.

For a new post, OpenQuok suggests the next free time from your channels' <a href="/docs/channels/time-slots">time slots</a>.

<Callout type="tip">
Times you pick follow your **browser clock**. You can configure under Settings → <Badge text="Timezone" variant="default" />. See <a href="/docs/settings/timezone">Timezone</a>.
</Callout>

<Callout type="note">
<p>The timezone setting is stored in <strong>this browser</strong>. Teammates who use a different zone may see different labels for the same scheduled post until everyone aligns Settings.</p>
</Callout>

## Repeating a post

The <Badge text="Repeat" variant="default" /> dropdown turns one post into a recurring series:

<Badge text="Day" variant="param" />, <Badge text="Two Days" variant="param" />, <Badge text="Three Days" variant="param" />, <Badge text="Four Days" variant="param" />, <Badge text="Five Days" variant="param" />, <Badge text="Six Days" variant="param" />, <Badge text="Week" variant="param" />, <Badge text="Two Weeks" variant="param" />, or <Badge text="Month" variant="param" />.

![Control Repeat Options](/docs/_assets/creating-posts/editor-repeat.webp)

Choose <Badge text="No repeat" variant="param" /> to stop scheduling further copies after the current post publishes.

After each successful publish, OpenQuok creates the next scheduled copy on the same cadence. Edit the queued post before its time if you need to change copy or media for the next run.

## Tags

Tags sit in the footer beside repeat. Create one with a color — the **first tag** on a group sets the chip header colour on the <a href="/account/calendar">calendar</a> and on Home <a href="/docs/posts-management/kanban">kanban</a> cards. Draft vs scheduled is shown by a **`Draft:`** body prefix and dashed outline, not by different header theme colours. Use tags to spot a specific campaign, client, or content type in the calendar.

![Add new tag](/docs/_assets/glossary/add-new-tag.webp)

Tags can be edited and deleted later. The color change applies everywhere the tag is used.

## Drafts

Use a draft to hold a post in your workspace until you are ready to schedule it:

- Post's content still pending — send a <a href="/docs/posts-management/approvals">preview link</a> and keep the row as a draft until you schedule.
- You are mapping out next week’s slots but are not ready to commit publish times yet.
- You stepped away mid-compose — saving as draft beats losing changes when the close dialog appears.

Drafts list under **Drafted posts** on Home and on the calendar with a <Badge text="Draft:" variant="param" /> prefix and a dashed chip outline. They never leave that state until you schedule them (<Badge text="Add to calendar" variant="default" />) or drag the card into **Scheduled posts** on the kanban.


Agent, MCP, CLI, and public API drafts land in the same queue. Filter **Source → Agent** on the kanban when you only want machine-created rows. See <a href="/docs/creating-posts/ai-generation">AI generation</a>.

## What happens after you schedule

The post sits in its slot until its time, then OpenQuok publishes it to each selected channel.

On Home, the card moves to **Published posts** when the network confirms. You get a notification with the live link when the provider returns one. Check the bell icon in the header if you miss it.

On the <a href="/account/calendar">calendar</a>, the card shows in the slot you chose. After publish, open the card menu for the live URL.

If publish fails, the card shows <Badge text="Failed" variant="deprecated" />. Open it for the platform error. OpenQuok does not silently retry a rejected post — fix the cause, reconnect the channel if auth failed, and schedule again. See <a href="/docs/platforms">Posting rules by platform</a> and <a href="/docs/getting-started/glossary#post-states">Glossary → Post states</a>.

<Callout type="tip">
<p>Drop a draft or scheduled card on <strong>Published posts</strong> on the kanban to publish immediately. OpenQuok asks you to confirm. The card stays in <strong>Scheduled posts</strong> until publish completes.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and where the footer fits" href="/docs/creating-posts" />
<LinkCard title="Kanban board" description="Draft, scheduled, and published columns — drag to reschedule" href="/docs/posts-management/kanban" />
<LinkCard title="Glossary → Tag" description="What tags are and how they tint cards" href="/docs/getting-started/glossary#tag" />
<LinkCard title="Posting time slots" description="Per-channel hours that feed the next suggested time" href="/docs/channels/time-slots" />
<LinkCard title="Timezone" description="Date metrics timezone for calendar and slot labels" href="/docs/settings/timezone" />
<LinkCard title="Posts management" description="Kanban, calendar views, filters, chips, and post actions" href="/docs/posts-management" />
<LinkCard title="Calendar" description="Views, filters, post chips, and opening posts from the grid" href="/docs/posts-management/calendar" />
<LinkCard title="Moving posts" description="Drag on the calendar and reschedule from Home" href="/docs/posts-management/moving-posts" />
<LinkCard title="Actions and stats" description="Duplicate, delete, statistics, and connect from post actions" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/posts-management/approvals" />
<LinkCard title="Quickstart" description="First scheduled post in five steps" href="/docs/getting-started/quickstart" />
</CardGrid>
