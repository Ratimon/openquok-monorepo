---
title: Kanban board
description: Review drafts, scheduled posts, and published history with kanban style.
order: 7
lastUpdated: 2026-09-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

The **kanban board** on <a href="/account">Home</a> is the fastest way to see **post status** in your workspace:
- what still needs review
- what is queued to publish
- what already went out.

It sits in the **On-going Tasks** section below your profile and connected channels.

Each card represents one **post group**. See <a href="/docs/getting-started/glossary#post-group">Glossary → Post group</a>.

The calendar answers <em>when</em> posts ship; the kanban answers <em>what stage</em> they are in. Both views read the same data. See <a href="/docs/getting-started/glossary#calendar-vs-kanban">Calendar vs kanban</a>.

## Three columns

| Column | What it shows |
| --- | --- |
| **Drafted posts** | Saved with <Badge text="Save as draft" variant="default" />. Nothing publishes until you move or schedule the card. |
| **Scheduled posts** | Queued for a future time (<Badge text="Add to calendar" variant="new" />). Drag a draft here when you are ready to publish on schedule. |
| **Published posts** | Already sent to the network. Open the card menu for the live URL. |

Column headers show a count. When filters hide some rows, the badge can read <strong>visible / total</strong> (for example <code>2 / 5</code>).

<Callout type="tip">
<p>Drag a card from <strong>Drafted posts</strong> to <strong>Scheduled posts</strong> to queue it without opening the post editor. Drag back to draft if you need more edits. Published cards stay in the third colum, and they do not move backward.</p>
</Callout>

## Filters

Filters stack in rows above the board. They apply across all three columns unless noted.

### Channel, platform, and tags

| Control | Effect |
| --- | --- |
| **Channel groups** | Limit cards to channels in the groups you pick. See <a href="/docs/channels/channel-groups">Channel groups</a>. |
| **Platforms** | Show only posts tied to selected social platforms (when you have more than one platform connected). |
| **Tags** | Match <a href="/docs/creating-posts/tags">tags</a> on the post group. |

### Review and source

These controls sit on the **left**, under the channel filters.

| Control | Options | Effect |
| --- | --- | --- |
| **Review** | All · To do · Reviewed | <strong>To do</strong> hides cards you already marked reviewed. |
| **Source** | All · Agent · Human | <strong>Agent</strong> shows drafts created by an agent, MCP, CLI, or public API (<Badge text="isAgentEdited" variant="param" />). <strong>Human</strong> shows posts composed or approved in the dashboard. |

Agent workflows often pair **Agent** + **To do** so humans only see drafts that still need a sign-off. See <a href="/docs/creating-posts/ai-generation">AI generation</a> and <a href="/docs/cli-usages/managing-posts">Managing posts (CLI)</a>.

### Time filters (by column)

Time filters sit **directly above** the three columns so you can see which range applies where.

| Zone | Columns | Default | Options |
| --- | --- | --- | --- |
| **Drafted & scheduled** | Draft + Scheduled | All Upcoming | All Upcoming · Next Week · Next 30 Days |
| **Published posts** | Published | All Past | All Past · Past Week · Past 30 Days |

Upcoming filters never hide the published column, and past filters never hide drafts or scheduled items — so an empty published column usually means no posts match the past window, not a wrong default.

Use the **Calendar** button beside the upcoming filters to open <a href="/account/calendar">/account/calendar</a> for a date-based view of the same posts.

On narrow screens, each time zone collapses to a **dropdown** so the controls stay on one row and stay aligned with their columns.

## Work on a card

| Action | How |
| --- | --- |
| **Edit content** | Double-click the card (opens the composer for that post group). |
| **More actions** | Open the card menu — preview link, copy JSON, delete group, and related actions. |
| **Review note** | Double-click the note area, or use the checkbox to mark <strong>Reviewed</strong>. Agent drafts can ship with a suggested note from the API. |
| **Schedule from draft** | Drag the card to **Scheduled posts**, or open the composer and use <Badge text="Add to calendar" variant="new" />. |

TikTok and some other networks can leave a scheduled card in **In TikTok inbox** (or similar) until you finish in the mobile app. Those cards stay visible in **Scheduled posts** even when the publish time is in the past.

## When the board is hidden

The kanban appears only when your workspace has at least one **connected social channel**. Connect a channel first — see <a href="/docs/channels/connect">Connect a channel</a>.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Composer layout, save options, and typical flow" href="/docs/creating-posts" />
<LinkCard title="Scheduling" description="Save as draft, add to calendar, and publish now" href="/docs/creating-posts/scheduling" />
<LinkCard title="AI generation" description="Agent and API drafts in the same review queue" href="/docs/creating-posts/ai-generation" />
<LinkCard title="Tags" description="Campaign labels and kanban tag filter" href="/docs/creating-posts/tags" />
<LinkCard title="Moving posts" description="Drag on the calendar and reschedule" href="/docs/calendar-and-posts/moving-posts" />
<LinkCard title="Calendar vs kanban" description="Glossary — when to use each surface" href="/docs/getting-started/glossary#calendar-vs-kanban" />
<LinkCard title="Tour the app" description="Sidebar, Home, and where the composer opens" href="/docs/getting-started/tour-the-app" />
</CardGrid>
