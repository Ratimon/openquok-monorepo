---
title: Concepts
description: OpenQuok vocabulary defined once — workspace, channel, post group, calendar vs kanban, plugs, and how agents still go through review.
order: 2
lastUpdated: 2026-08-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok has a small vocabulary that the rest of these docs, the API, and the CLI all assume. This page defines it once.

## Workspace

Everything you own lives inside a **workspace**: channels, posts, media, templates, team members, and settings. You can belong to more than one; when you do, a workspace switcher appears in the header. Switching reloads the app into that workspace’s data.

The first person to register creates the workspace and becomes its owner. Others join by invitation from <Badge text="Settings" variant="default" /> → <Badge text="Workspace" variant="default" />.

The public API calls the same object an **organization**. Billing on Cloud is one subscription per workspace. Limits depend on your plan — see <a href="/pricing">Pricing</a> and <a href="/docs/cloud/limits">Cloud limits</a>.

## Channel

A **channel** is one connected social account: one X profile, one LinkedIn Page, one Threads account. Connecting the same network twice gives you two channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and the CLI say <strong>integration</strong>. They are the same object. Anywhere the API asks for an integration id, it wants the UUID of a channel.</p>
</Callout>

Channels can be disconnected rather than deleted. A disconnected channel keeps history and is not available for new posts. On Cloud, disconnecting is how you free a slot when you hit the plan’s channel cap.

## Channel groups

A **channel group** is a set of channels, typically one client or brand. Assigning channels to a group lets you filter Home and the calendar, and select those channels together in the composer.

The public API exposes the same concept as **customers** — list groups and filter integrations by group id. See <a href="/docs/apis-integrations/groups">Channel groups API</a>.

## Post and post group

When you schedule one piece of content to several channels, OpenQuok stores one **post** per channel that share a **post group**. Kanban cards on Home usually represent the group; opening a card shows each channel’s row.

Inside a single post you can have multiple parts: a thread on X or Threads, or follow-up replies. Part one is the post; the rest are thread items the network supports.

## Global vs per-channel copy

By default you write once in **Global** (the globe control). Every selected channel gets the same text. Clicking a channel avatar detaches that channel so you can rewrite its caption and provider settings without touching the others. Mentions and some network-only fields are only meaningful on a detached channel.

The API mirrors this with a shared body plus optional per-integration overrides.

## Calendar vs kanban

| Surface | Best for |
| --- | --- |
| **Calendar** (<a href="/account/calendar">/account/calendar</a>) | What ships **by date** — busy weeks, empty days, opening the composer for a slot |
| **Kanban** (<a href="/account">/account</a> Home) | **Status** — drafts waiting for review, scheduled items, recently published posts |

Both views are the same posts. Changing a time in the composer updates both.

## Post states

| State | Meaning |
| --- | --- |
| **Draft** | <Badge text="Save as draft" variant="default" />. On Home under **Drafted posts**. Never publishes until you schedule it. |
| **Scheduled** | Queued for its date (<Badge text="Add to calendar" variant="new" />). The normal state for upcoming posts. |
| **Published** | Sent to the network. The card can link to the live post when the provider returns a URL. |
| **Failed** | The network rejected it or the channel was disconnected. The calendar card shows <Badge text="Failed" variant="default" />. Open it for the error, then edit and schedule again. |

Nothing publishes until a scheduled time arrives and the row is in a publishable state.

## Plug / Auto Plugs

A **plug** is a follow-up that runs **after** a post publishes — a delayed reply, a comment from another channel, or a cross-post.

| Type | Where | When |
| --- | --- | --- |
| **Global Auto Plugs** | <a href="/account/plugs">/account/plugs</a> | On future publishes for that channel when an engagement threshold is met |
| **Per-post plugs** | Composer (and post details after scheduling) | Once, for that post group |

Global rules do not edit the original post; they add a new action when the threshold qualifies. Supported global rules today focus on a subset of networks (for example Threads, X, and LinkedIn Page).

## Agents

**Agents** are external assistants — Cursor, Claude Code, CI scripts, chat hosts — that call OpenQuok through the **CLI**, **MCP**, or **public API**. They do not bypass review: drafts and scheduled rows land in your workspace like human-created posts. Humans still drag cards on the kanban or edit on the calendar before content represents the brand.

Agent-created drafts can include a **review note** on the kanban card. Clear or edit it before you approve.

<Callout type="note">
<p>Install the <strong>openquok-core</strong> skill or connect MCP so agents know workspace tokens and integration UUIDs. Humans still move drafts to <Badge text="Scheduled" variant="default" /> when you want explicit approval.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Where things live" description="Sidebar, composer, settings, and marketing surfaces" href="/docs/getting-started/where-things-live" />
<LinkCard title="CLI introduction" description="Terminal access for scripts and agents" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP introduction" description="Natural-language scheduling from your editor" href="/docs/getting-started-for-mcp" />
<LinkCard title="Supported social channels" description="Provider identifiers and API terminology" href="/docs/getting-started-for-public-api/supported-social-channels" />
</CardGrid>
