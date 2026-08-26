---
title: Glossary
description: OpenQuok terms in one place — workspace, channel, smart filters, templates, tags, building blocks, playbooks, plugs, and how agents fit the review flow.
order: 2
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

These are the words the Guide, app, public API, and CLI use for the same things. Read this once; later pages assume you know them.

## Workspace

A **workspace** is the top-level boundary you own for your data: channels, posts, media, tags, templates, teammates, and settings. You can belong to several; the header switcher loads another workspace’s data when you change.

![Workspace in Dashboard](/docs/_assets/glossary/workspace-dashboard.webp)

<p>The first registrant owns the workspace. Teammates join through <Badge text="Settings" variant="default" /> → <Badge text="Workspace" variant="default" />. See <a href="/docs/settings/team">Team</a>.</p>

![Invite Team Member in Setting](/docs/_assets/glossary/workspace-invite.webp)

The public API calls the same object an **organization**. Cloud billing is one subscription per workspace. Plan limits are on <a href="/pricing">Pricing</a> and <a href="/docs/cloud/limits">Cloud limits</a>.

## Channel

A **channel** is one connected social account — one X profile, one LinkedIn Page, one Threads account. Connecting the same network twice creates two channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and the CLI say <strong>integration</strong>. They are the same object. Anywhere the API asks for an integration id, it wants the UUID of a channel.</p>
</Callout>

<strong>Disable</strong> pauses new posts but keeps the channel in the workspace — on Cloud it still uses a connected slot. <strong>Delete</strong> removes the channel and frees a slot once its posts are gone. See <a href="/docs/channels/manage">Manage a channel</a> and <a href="/docs/cloud/limits">Cloud limits</a>.

## Channel groups

A **channel group** bundles channels — usually one client or brand. Groups filter Home and the calendar, and let you pick that bundle in the post editor. The <strong>Channel groups</strong> dropdown on those boards is part of the <a href="#smart-filter">smart filter</a>. See <a href="/docs/channels/channel-groups">Channel groups</a> for how to create groups, filter the board, and select a whole client in the composer.

![Add channel to a channel group](/docs/_assets/glossary/add-to-group.webp)

The public API names the same concept **customers**. See <a href="/docs/apis-integrations/groups">Channel groups API</a>.

## Post and post group

Scheduling one caption to five channels creates five **posts** tied to one **post group**. Home kanban cards usually represent the group; opening a card shows each channel row.

<p>A single post can hold multiple parts — a thread on X or Threads, or timed follow-up replies where the network allows. See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.</p>

## Global vs per-channel

**Global** mode keeps one caption synced across every channel you selected. Click a channel avatar to focus it — the composer shows **Editing a Specific Network**.

<p>The editor stays locked until you click <strong>Edit content</strong>. That exits global mode for that channel so you can change its caption and provider settings without touching the others. <strong>← Back to global</strong> returns to the shared draft. Mentions and network-only fields belong on a customized channel. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>

![Exit global mode to customize one channel](/docs/_assets/glossary/exit-global-mode.webp)

The API mirrors this: one shared body with optional per-integration caption and setting overrides.

## Provider settings

Each network expects extra fields beyond the caption — a YouTube title, Dev.to tags, an Instagram post type. These **provider settings** sit in the composer beside the preview. Some are required; the post will not save without them.

<p>See <a href="/docs/platforms">Posting rules by platform</a> and <a href="/docs/creating-posts/links-and-validation">Links and validation</a> for limits and save-time errors. API shapes are in <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a>.</p>

## Tag

A **tag** is a colored workspace label you attach to a post. The color tints the card on Home and the calendar so campaigns, clients, or content types stand out at a glance.

![Add new tag](/docs/_assets/glossary/add-new-tag.webp)

<p>See <a href="/docs/creating-posts/tags">Tags</a>.</p>

## Template

A **template** is a saved preset of selected channels, caption (global or per-channel), media, provider settings, and tags. **Select a template** when you start a post instead of rebuilding the same setup.

![Select a Template](/docs/_assets/glossary/select-a-template.webp)

<p>Templates are created at <a href="/account/templates">/account/templates</a>. See <a href="/docs/creating-posts/templates">Templates</a>.</p>

Templates are workspace-scoped. They speed up repeat workflows; they do not auto-publish on their own.

## Signature

A **signature** is reusable trailing text — a CTA, hashtag block, or link line. You can append it from the composer toolbar.

![Insert a Signature](/docs/_assets/glossary/insert-a-signature.webp)

<p>Manage them under <Badge text="Settings" variant="default" /> → <Badge text="Signatures" variant="default" />. See <a href="/docs/settings/signatures">Signatures</a>.</p>

Mark one signature as default and OpenQuok inserts it into new posts automatically. You can still edit or remove it per post.

## Time slot

Each channel keeps **time slots**: the times of day you normally post. They drive the next-slot suggestion when you schedule in the editor. Check out <a href="/docs/apis-posts/find-slot">Find slot</a>.

Slots are a convenience, not a lock — you can always pick another time. See <a href="/docs/channels/time-slots">Posting time slots</a> to edit them. Labels follow <a href="/docs/settings/timezone">Timezone</a> in Settings.

## Calendar vs kanban

| Surface | Best for |
| --- | --- |
| **Calendar** (<a href="/account/calendar">/account/calendar</a>) | What ships **by date** — busy weeks, empty days, opening the composer for a slot |
| **Kanban** (<a href="/account">/account</a> Home) | **Status** — drafts waiting for review, scheduled items, recently published posts |

Both views read the same posts. Changing a time in the composer updates both. See <a href="/docs/getting-started/tour-the-app">Tour the app</a>.

<h2 id="smart-filter">Smart filter</h2>

A **smart filter** is how you narrow a table or board to the channels, posts, templates, or plugs you are working on. Plans list this as **Smart filters**.

<p>On <a href="/account">Home</a>, switch <strong>Connected channels</strong> to table view (the table icon), then click <Badge text="Add filters" variant="default" />. You can match social platform, connected account, group name, or status.</p>

![Group Connected Channels Using Smart Filter](/docs/_assets/channel-groups/smart-filter-connected-channel.webp)

<p>The same <Badge text="Add filters" variant="default" /> control sits on the tables at <a href="/account/templates">Templates</a> and <a href="/account/plugs">Auto Plugs</a> — for example social channel and tags on templates, or rule and active on plugs.</p>

<p>On the calendar and the kanban, smart filters are the dropdowns: <strong>Channel groups</strong>, platforms, and tags. The calendar also has post types. Kanban also has a date range, review status, and source (Agent or Human).</p>

<p>See <a href="/docs/channels/manage">Manage a channel</a>, <a href="/docs/channels/channel-groups">Channel groups</a>, <a href="/docs/creating-posts/templates">Templates</a>, and <a href="/docs/automations/plugs">Plugs</a>.</p>

## Post states

| State | Meaning |
| --- | --- |
| **Draft** | <Badge text="Save as draft" variant="default" />. On Home under **Drafted posts**. Never publishes until you schedule it. |
| **Scheduled** | Queued for its date (<Badge text="Add to calendar" variant="new" />). The normal state for upcoming posts. |
| **Published** | Sent to the network. The card can link to the live post when the provider returns a URL. |
| **Failed** | The network rejected it or the channel was disconnected. The calendar card shows <Badge text="Failed" variant="default" />. Open it for the error, then edit and schedule again. |

Nothing publishes until a scheduled time arrives and the row is publishable — except <Badge text="Publish now" variant="new" /> in the composer, which queues for the current time.

## Preview link

Every post can expose a **preview link**. You can open the link from the post action modal on Kanban or the calendar. See <a href="/docs/calendar-and-posts/approvals">Approvals</a> for sending links to clients and collecting comments.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

Share it so someone without an OpenQuok account can read the post and leave comments.

On Cloud, shareable previews require Team plan or above — see <a href="/docs/cloud/limits">Cloud limits</a>.

## Internal plug

An **internal plug** is a one-time follow-up tied to a single post group — a delayed reply or a cross-channel comment after publish. Set it in the composer at <Badge text="Plug settings" variant="default" />.

![Click Plug Setting](/docs/_assets/glossary/internal-plug-setting.webp)

<p>Today this is enabled for some networks only (for example <strong>Threads</strong> and <strong>X</strong>). The repost option needs at least two connected channels. See <a href="/docs/automations/plugs">Plugs</a>.</p>

![Configure Engagement](/docs/_assets/glossary/internal-plug-configure.webp)

It runs once, right after that group publishes, and does not edit the original post.

## Global plug

A **global plug** is a saved channel rule at <a href="/account/plugs">/account/plugs</a> that fires on future publishes when engagement crosses your threshold — for example an auto-repost or auto-reply when likes hit a target.

![Set up global plug](/docs/_assets/glossary/global-plug.webp)

<p>See <a href="/docs/automations/plugs">Plugs</a>. The worker re-checks on a schedule, up to three times per post.</p>

## Building block

A **building block** is one catalog entry you can install into an agent setup — a skill, an MCP server, or both. It ships a single capability: install steps, and docs on the <a href="/building-blocks">Building Blocks</a> hub.

Create and edit yours from <a href="/account/playbooks">/account/playbooks</a>. A block is one piece of the stack; add it when you need a specific tool or instruction set, not a full workflow.

## Playbook

A **playbook** is a curated stack of building blocks with a shared workflow. Playbooks appear on the <a href="/playbooks">Playbooks</a> hub and under **My Playbooks** in your account.

Browse **Explore** to bookmark community playbooks, or publish your own when you want readers to adopt a whole routine. You can also draft one in <a href="/tools/skill-builder">Skill Builder</a>.

## Agents

**Agents** are your own external assistants — Cursor, Claude Code, CI scripts, chat hosts — that call OpenQuok through the **CLI**, **MCP**, or **public API**. Browse the <a href="/agents">Agents</a> hub to tailor your harness to your use cases.

Agent-created drafts can include a **review note** on the kanban card. Clear or edit it before you approve.

<Callout type="note">
<p>Install the <strong>openquok-core</strong> skill or connect MCP so agents know workspace tokens and integration UUIDs. Humans still move drafts to <Badge text="Scheduled" variant="default" /> when you want explicit approval.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Creating posts" description="Post editor layout, flow, and Payload Wizard" href="/docs/creating-posts" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Tour the app" description="Sidebar, header, composer, settings, and the public site" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Team" description="Workspace invites and roles" href="/docs/settings/team" />
<LinkCard title="Channel groups" description="Bundle channels by client or brand" href="/docs/channels/channel-groups" />
<LinkCard title="CLI introduction" description="Terminal access for scripts and agents" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP introduction" description="Natural-language scheduling from your editor" href="/docs/getting-started-for-mcp" />
</CardGrid>
