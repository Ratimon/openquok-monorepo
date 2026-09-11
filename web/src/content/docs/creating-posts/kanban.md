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

![Kanban Board](/docs/_assets/getting-started/5-kanban-board.webp)

It sits in the **On-going Tasks** section below your profile and connected channels.

Each card represents one **post group**. See <a href="/docs/getting-started/glossary#post-group">Glossary → Post group</a>.

The calendar answers <em>when</em> posts ship; the kanban answers <em>what stage</em> they are in. Both views read the same data. See <a href="/docs/getting-started/glossary#calendar-vs-kanban">Calendar vs kanban</a>.

## Three columns

| Column | What it shows |
| --- | --- |
| **Drafted posts** | Saved with <Badge text="Save as draft" variant="default" />. Nothing publishes until you move or schedule the card. |
| **Scheduled posts** | Queued for a future time (<Badge text="Add to calendar" variant="new" />). Drag a draft here when you are ready to publish. |
| **Published posts** | Already sent to the network. Open the card menu for the live URL. |

Column headers show a count. When filters hide some rows, the badge can read <strong>visible / total</strong> (for example <code>2 / 5</code>).

<Callout type="tip">
<p>Drag between <strong>Drafted posts</strong> and <strong>Scheduled posts</strong> to flip status without editing each post from editor.</p>

<p>Drop a draft or scheduled post on <strong>Published posts</strong> to <strong>publish now</strong>: OpenQuok asks you to confirm, queues the post immediately, and the card stays in <strong>Scheduled posts</strong> until the network confirms. Published cards do not allow to move backward.</p>
</Callout>

## Filters

Below filters apply across all three columns unless noted.

![Kanban filters](/docs/_assets/creating-posts/kanban-filter.webp)

### Channel Group, platform, and tags

| Control | Effect |
| --- | --- |
| **Channel groups** | Limit cards to channels in the groups you pick. See <a href="/docs/channels/channel-groups">Channel groups</a>. |
| **Platforms** | Show only posts tied to selected social platforms (when you have more than one platform connected). |
| **Tags** | Match <a href="/docs/creating-posts/tags">tags</a> on the post group. |

### Review and source

These controls sit on the **left**, under the channel filters.

| Control | Options | Effect |
| --- | --- | --- |
| **Review** | <Badge text="All" variant="param" /> · <Badge text="To do" variant="param" /> · <Badge text="Reviewed" variant="param" /> | <strong>To do</strong> hides cards you already marked reviewed. |
| **Source** | <Badge text="All" variant="param" /> · <Badge text="Agent" variant="param" /> · <Badge text="Human" variant="param" /> | <strong>Agent</strong> shows drafts created by an agent, MCP, CLI, or public API (<Badge text="isAgentEdited" variant="param" />). <strong>Human</strong> shows posts composed or approved in the dashboard. |

Agent workflows often pair **Agent** + **To do** so humans only see drafts that still need a sign-off. See <a href="/docs/creating-posts/ai-generation">AI generation</a> and <a href="/docs/cli-usages/managing-posts">Managing posts (CLI)</a>.

### Time filters


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
| **Edit content** | Double-click the card ( then opens the post editor for that post group). |
| **More actions** | Open the card menu — preview link, copy JSON, delete group, and related actions. |
| **Review note** | Double-click the note area, or use the checkbox to mark <strong>Reviewed</strong>. Agent drafts can ship with a suggested note from the API. |
| **Schedule from draft** | Drag the card to **Scheduled posts**, or open the composer and use <Badge text="Add to calendar" variant="new" />. |
| **Publish now** | Drag a normal draft or scheduled card to **Published posts**, confirm in the dialog, and OpenQuok start scheduling it. The card remains in <strong>Scheduled posts</strong> until publish completes. |

## Manage your own to-do(s)

TikTok **inbox upload** (<Badge text="content_posting_method=UPLOAD" variant="param" />) is the usual pattern when you want to **schedule content at scale** (CLI, agents, or API) but **pick trending audio, cover, and the final publish step yourself** in the TikTok app.

OpenQuok sends the video to your creator inbox on schedule, while the kanban is where humans track what still needs a finish-in-app pass. Dropping these cards on <strong>Published posts</strong> does <strong>not</strong> publish now — it only marks the review checklist when the card is already <strong>Reviewed</strong> and the scheduled time has passed.

| Stage | Column | Card label |
| --- | --- | --- |
| Scheduled time still upcoming | **Scheduled posts** | **In TikTok inbox** |
| Scheduled time has passed | **Published posts** | **In TikTok inbox** (until you mark **Reviewed**) |

Double-click the **note** on the card to edit the checklist, or use the **Reviewed** checkbox when the post is live.

If you scripted the batch, the note is the same field you set with <Badge text="--note" variant="param" /> on <Badge text="posts:create" variant="default" /> and update with <Badge text="posts:review-todo" variant="default" />:

```bash
openquok posts:create \
  -c "Coding meme clip" \
  -m "$VIDEO" \
  -s "2026-09-15T12:00:00Z" \
  -i "$TIKTOK_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_ID" \
    '{ ($id): { content_posting_method: "UPLOAD" } }')" \
  --note "Finish in TikTok app: open inbox, add trending audio, pick cover, then publish."

# After you publish from the phone, refresh the checklist:
openquok posts:review-todo "$POST_ID" --note "Posted from warmed phone — confirm live URL."
```

<Callout type="tip">
<p>Pair <strong>Agent</strong> + <strong>To do</strong> to see only scripted inbox uploads waiting on a human. Use <strong>Past Week</strong> on <strong>Published posts</strong> when scheduled times have already passed but cards still show <strong>In TikTok inbox</strong>.</p>
</Callout>

See <a href="/docs/cli-examples/tiktok#upload-send-to-user-inbox">CLI Examples → TikTok → UPLOAD</a>, <a href="/docs/cli-usages/managing-posts#agent-draft-with-a-human-review-todo">Managing posts → review todo on create</a>, and <a href="/docs/apis-posts/review-todo">Update Review Todo</a>.

## When the board is hidden

The kanban appears only when your workspace has at least one **connected social channel**. Connect a channel first — see <a href="/docs/channels/connect">Connect a channel</a>.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Composer layout, save options, and typical flow" href="/docs/creating-posts" />
<LinkCard title="Scheduling" description="Save as draft, add to calendar, and publish now" href="/docs/creating-posts/scheduling" />
<LinkCard title="AI generation" description="Agent and API drafts in the same review queue" href="/docs/creating-posts/ai-generation" />
<LinkCard title="Tags" description="Campaign labels and kanban tag filter" href="/docs/creating-posts/tags" />
<LinkCard title="TikTok CLI examples" description="Inbox upload, review notes, and posts:review-todo at scale" href="/docs/cli-examples/tiktok" />
<LinkCard title="Moving posts" description="Drag on the calendar and reschedule" href="/docs/calendar-and-posts/moving-posts" />
<LinkCard title="Calendar vs kanban" description="Glossary — when to use each surface" href="/docs/getting-started/glossary#calendar-vs-kanban" />
<LinkCard title="Tour the app" description="Sidebar, Home, and where the composer opens" href="/docs/getting-started/tour-the-app" />
</CardGrid>
