---
title: Glossary
description: OpenQuok terms in one place — workspace, channel, templates, tags, building blocks, playbooks, plugs, and how agents fit the review flow.
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

The first registrant owns the workspace. Teammates join through <Badge text="Settings" variant="default" /> → <Badge text="Workspace" variant="default" />.

![Invite Team Member in Setting](/docs/_assets/glossary/workspace-invite.webp)

The public API calls the same object an **organization**. Cloud billing is one subscription per workspace. Plan limits are on <a href="/pricing">Pricing</a> and <a href="/docs/cloud/limits">Cloud limits</a>.

## Channel

A **channel** is one connected social account — one X profile, one LinkedIn Page, one Threads account. Connecting the same network twice creates two channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and the CLI say <strong>integration</strong>. They are the same object. Anywhere the API asks for an integration id, it wants the UUID of a channel.</p>
</Callout>

<strong>Disable</strong> pauses new posts but keeps the channel in the workspace — on Cloud it still uses a connected slot. <strong>Delete</strong> removes the channel and frees a slot once its posts are gone. See <a href="/docs/channels/manage">Manage a channel</a> and <a href="/docs/cloud/limits">Cloud limits</a>.

## Channel groups

A **channel group** bundles channels — usually one client or brand. Groups filter Home and the calendar, and let you pick that bundle in the post editor.

![Add channel to a channel group](/docs/_assets/glossary/add-to-group.webp)


The public API names the same concept **customers**. See <a href="/docs/apis-integrations/groups">Channel groups API</a>.

## Post and post group

Scheduling one caption to five channels creates five **posts** tied to one **post group**. Home kanban cards usually represent the group; opening a card shows each channel row.

A single post can hold multiple parts — a thread on X or Threads, or timed follow-up replies where the network allows.

## Global vs per-channel

**Global** mode  keeps one caption synced across every channel you selected. Click a channel avatar to focus it — the composer shows **Editing a Specific Network**.

The editor stays locked until you click **Edit content**. That exits global mode for that channel so you can change its caption and provider settings without touching the others. **← Back to global** returns to the shared draft. Mentions and network-only fields belong on a customized channel.

![Exit global mode to customize one channel](/docs/_assets/glossary/exit-global-mode.webp)

The API mirrors this: one shared body with optional per-integration caption and setting overrides.

## Provider settings

Each network expects extra fields beyond the caption — a YouTube title, a Reddit subreddit, Dev.to tags, an Instagram post type. These **provider settings** sit in the composer beside the preview. Some are required; the post will not save without them.

See <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> for per-network shapes.

## Tag

A **tag** is a colored workspace label you attach to a post. The color tints the card on Home and the calendar so campaigns, clients, or content types stand out at a glance.

![Add new tag](/docs/_assets/glossary/add-new-tag.webp)

## Template

A **template** is a saved preset of selected channels, caption (global or per-channel), media, and provider settings, and tags. **Select a template** when you start a post instead of rebuilding the same setup.

![Select a Template](/docs/_assets/glossary/select-a-template.webp)

It is note that this modal will appears only if the templated is already created at <a href="/account/templates">/account/templates</a>.

Templates are workspace-scoped. They speed up repeat workflows; they do not auto-publish on their own.

## Signature

A **signature** is reusable trailing text — a CTA, hashtag block, or link line. You can append in the composer toolbar in post editor.

![Insert a Signature](/docs/_assets/glossary/insert-a-signature.webp)

You can Mamnage them under <Badge text="Settings" variant="default" /> → <Badge text="Signatures" variant="default" />.

Mark one signature as default and OpenQuok inserts it into new posts automatically. You can still edit or remove it per post.

## Time slot

Each channel keeps **time slots**: the times of day you normally post. They drive the next-slot suggestion when you schedule in the editor and the <a href="/docs/apis-posts/find-slot">Find slot</a> public API (<Badge text="GET /public/posts/find-slot" variant="path" /> for workspace-wide, or with a channel UUID in the path for one channel).

Slots are a convenience, not a lock — you can always pick another time. See <a href="/docs/channels/time-slots">Posting time slots</a> to edit them.

## Calendar vs kanban

| Surface | Best for |
| --- | --- |
| **Calendar** (<a href="/account/calendar">/account/calendar</a>) | What ships **by date** — busy weeks, empty days, opening the composer for a slot |
| **Kanban** (<a href="/account">/account</a> Home) | **Status** — drafts waiting for review, scheduled items, recently published posts |

Both views read the same posts. Changing a time in the composer updates both.

## Post states

| State | Meaning |
| --- | --- |
| **Draft** | <Badge text="Save as draft" variant="default" />. On Home under **Drafted posts**. Never publishes until you schedule it. |
| **Scheduled** | Queued for its date (<Badge text="Add to calendar" variant="new" />). The normal state for upcoming posts. |
| **Published** | Sent to the network. The card can link to the live post when the provider returns a URL. |
| **Failed** | The network rejected it or the channel was disconnected. The calendar card shows <Badge text="Failed" variant="default" />. Open it for the error, then edit and schedule again. |

Nothing publishes until a scheduled time arrives and the row is publishable — except <Badge text="Publish now" variant="new" /> in the composer, which queues for the current time.

## Preview link

Every post can expose a **preview link**. You can open the link from the post action modal on Kanban or the calendar.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

Share it so someone without an OpenQuok account can read the post and leave comments.

On Cloud, shareable previews require Team plan or above — see <a href="/docs/cloud/limits">Cloud limits</a>.

## Internal plug

An **internal plug** is a one-time follow-up tied to a single post group — a delayed reply or a cross-channel comment after publish.Set it in the composer. You can click at <Badge text="Plug Settings" variant="default" />:

![Click Plug Setting](/docs/_assets/glossary/internal-plug-setting.webp)

It is noted that this feature is only enabled for some social plarform (eg. **Thread** and **X**)

![Configure Engagement](/docs/_assets/glossary/internal-plug-configure.webp)

Plus, the post editor requires at least 2 connected channel for **repost** feature to be configurable.

It runs once, right after that group publishes, and does not edit the original post.

## Global plug

A **global plug** is a saved channel rule at <a href="/account/plugs">/account/plugs</a> that fires on future publishes when engagement crosses your threshold — for example an auto-repost or auto-reply when likes hit a target.

![Set up global plug](/docs/_assets/glossary/global-plug.webp)

Then the worker/orchestrator re-checks on a schedule, up to three times per post.

## Building block

A **building block** is one catalog you can install into an agent setup — a skill, an MCP server, or both. It ships a single capability: install steps, and docs on the <a href="/building-blocks">Building Blocks</a> hub.

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
<LinkCard title="Tour the app" description="Sidebar, header, composer, settings, and the public site" href="/docs/getting-started/tour-the-app" />
<LinkCard title="CLI introduction" description="Terminal access for scripts and agents" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP introduction" description="Natural-language scheduling from your editor" href="/docs/getting-started-for-mcp" />
<LinkCard title="Supported social channels" description="Provider identifiers and API terminology" href="/docs/getting-started-for-public-api/supported-social-channels" />
</CardGrid>
