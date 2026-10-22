---
title: Glossary
description: OpenQuok terms for social scheduling and directory launch — workspace, channels, posts, product profiles, plugs, agents, and catalog concepts.
order: 2
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Shared terms for the app, API, and CLI — read once, then navigate the rest of the docs.

OpenQuok covers two product lines in one workspace:

| Product line | What you do |
| --- | --- |
| **Social scheduler** | Connect social accounts, write posts, schedule, publish, and use plugs and analytics. |
| **Directory launch** | Store your product pitch on **My Products**, prepare listings on sites like PeerPush or Uneed, and autofill with the browser extension. |

## Workspace

A **workspace** is the top-level boundary you own. You own channels, posts, media, tags, templates, product profiles, teammates, and settings.

![Workspace in Dashboard](/docs/_assets/getting-started/1-workspace-dashboard.webp)

<p>On <strong>My Dashboard</strong>, each workspace appears as a card in the left column on desktop. The actions on that card include switching workspace, inviting teammates, and shortcuts to developers settings.</p>

<p>The first registrant owns the workspace. Teammates join through <Badge text="Settings" variant="default" /> → <Badge text="Workspace" variant="default" />. See <a href="/docs/settings/team">Team</a>.</p>

![Invite Team Member in Setting](/docs/_assets/glossary/workspace-setting.webp)

The public API calls the same object an **organization**. Cloud billing is one subscription per workspace. Plan limits are on <a href="/pricing">Pricing</a> and <a href="/docs/billing/limits">Cloud limits</a>.

<h2 id="social-scheduler">Social scheduler</h2>

The **social scheduler** is connect channels → compose → schedule or publish → review on the calendar and kanban. It does not submit directory listings; see <a href="#directory-launch">Directory launch</a>.

<h3 id="channel">Channel</h3>

A **channel** is one connected social account — one X profile, one LinkedIn Page, one Threads account. Connecting the same network twice creates two channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and the CLI say <strong>integration</strong>. They are the same object. Anywhere the API asks for an integration id, it wants the UUID of a channel.</p>
</Callout>

<strong>Disable</strong> pauses new posts but keeps the channel in the workspace — on Cloud it still uses a connected slot. <strong>Delete</strong> removes the channel and frees a slot once its posts are gone. See <a href="/docs/channels/manage">Manage a channel</a> and <a href="/docs/billing/limits">Cloud limits</a>.

<h3 id="business-profiles">Business profiles</h3>

A **business profile** bundles **social channels** — usually one client or brand. Profiles filter the <strong>My Dashboard</strong> <strong>Posts</strong> kanban and the calendar, and let you pick that bundle in the post editor.

<Callout type="tip">
<p>The <strong>Business profiles</strong> dropdown on those boards is part of the <a href="#smart-filter">smart filter</a>. See <a href="/docs/channels/channel-groups">Business profiles</a> for how to create profiles, filter the board, and select a whole client in the composer.</p>
</Callout>

![Link a channel to a business profile](/docs/_assets/glossary/add-to-group.webp)

The public API names the same concept **customers**. See <a href="/docs/apis-integrations/groups">List business profiles (API)</a>.

<p>This is not the same as a <a href="#product-profile-main">main product profile</a> on My Products — see <a href="#directory-launch">Directory launch</a>.</p>

<h3 id="post-group">Post and post group</h3>

Scheduling one caption to five channels creates five **posts** tied to one **post group**. Cards on the <strong>My Dashboard</strong> <strong>Posts</strong> tab usually represent the group; opening a card shows each channel row.

<p>A single post can hold multiple parts — a thread on X or Threads, or timed <Badge text="Follow-up comments" variant="default" /> (thread replies or comments) where the network allows. See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.</p>

<h3 id="global-vs-per-channel">Global vs per-channel</h3>

**Global** mode keeps one caption synced across every channel you selected. Click a channel avatar to focus it — the composer shows **Editing a Specific Network**.

<p>The editor stays locked until you click <strong>Edit content</strong>. That exits global mode for that channel so you can change its caption and provider settings without touching the others. <strong>← Back to global</strong> returns to the shared draft. Mentions and network-only fields belong on a customized channel. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>

![Exit global mode to customize one channel](/docs/_assets/glossary/exit-global-mode.webp)

The API mirrors this: one shared body with optional per-integration caption and setting overrides.

<h3 id="provider-settings">Provider settings</h3>

Each network expects extra fields beyond the caption — a YouTube title, Dev.to tags, an Instagram post type. These **provider settings** sit in the composer beside the preview. Some are required; the post will not save without them.

<p>See <a href="/docs/platforms">Posting rules by platform</a> and <a href="/docs/creating-posts/links-and-validation">Links and validation</a> for limits and save-time errors. API shapes are in <a href="/docs/public-api-providers">Provider settings</a>.</p>

<h3 id="tag">Tag</h3>

A **tag** is a colored workspace label you attach to a post. The color tints the card on <strong>My Dashboard</strong> and the calendar so campaigns, clients, or content types stand out at a glance.

![Add new tag](/docs/_assets/glossary/add-new-tag.webp)

<h3 id="template">Template</h3>

A **template** is a saved preset of selected channels, caption (global or per-channel), media, provider settings, and tags. **Select a template** when you start a post instead of rebuilding the same setup.

![Select a Template](/docs/_assets/glossary/select-a-template.webp)

<p>Templates are created at <a href="/account/templates">/account/templates</a>. See <a href="/docs/posts-management/templates">Templates</a> for the full guide and <a href="/docs/creating-posts#starting-from-a-template">Starting from a template</a> on the creating-posts overview for the composer flow.</p>

Templates are workspace-scoped. They speed up repeat workflows; they do not auto-publish on their own.

<h3 id="signature">Signature</h3>

A **signature** is reusable trailing text — a CTA, hashtag block, or link line. You can append it from the composer toolbar.

![Insert a Signature](/docs/_assets/glossary/insert-a-signature.webp)

<p>Manage them under <Badge text="Settings" variant="default" /> → <Badge text="Signatures" variant="default" />. See <a href="/docs/settings/signatures">Signatures</a>.</p>

Mark one signature as default and OpenQuok inserts it into new posts automatically. You can still edit or remove it per post.

<h3 id="time-slot">Time slot</h3>

Each channel keeps **time slots**: the times of day you normally post. They drive the next-slot suggestion when you schedule in the editor. Check out <a href="/docs/apis-posts/find-slot">Find slot</a>.

Slots are a convenience, not a lock — you can always pick another time. See <a href="/docs/channels/time-slots">Posting time slots</a> to edit them. Labels follow <a href="/docs/settings/timezone">Timezone</a> in Settings.

<h3 id="calendar-vs-kanban">Calendar vs kanban</h3>

The **calendar** answers **when** posts ship; the **kanban** answers **what stage** they are in. Both views read the same <a href="#post-group">post groups</a> — save or reschedule in the composer, drag on either surface, and the other view updates.

| Surface | Where | Best for |
| --- | --- | --- |
| **Calendar** | <a href="/account/calendar">/account/calendar</a> | Dates and times — busy weeks, empty slots, half-hour reschedules, and list mode across a date range |
| **Kanban** | <a href="/account">/account</a> <strong>My Dashboard</strong> → <strong>Posts</strong> tab | **Status** — drafts waiting for review, the scheduled queue, and recently published history |

| Question | Use |
| --- | --- |
| What ships this week? | **Calendar** — day, week, month, or list view |
| What still needs a human sign-off? | **Kanban** — filter **Review → To do**; pair with **Source → Agent** for agent or API drafts |
| Move draft → scheduled without picking a new time? | **Kanban** — drag between **Drafted posts** and **Scheduled posts** |
| Move to another day or hour? | **Calendar** — drag the chip — see <a href="/docs/posts-management/moving-posts">Moving posts</a> |
| Publish immediately? | **Kanban** — drop on **Published posts** and confirm in the dialog |

#### Recurring posts

Repeating series look different on each surface:

| Surface | What you see |
| --- | --- |
| **Calendar** | **Multiple chips** across the visible range — one projection per future occurrence from the anchor time |
| **Kanban** | **One card** per series — the next group at its anchor time, not every future occurrence |

After a recurrence publishes, OpenQuok creates the **next** group on the same cadence. The calendar adds another projected chip; the kanban card moves to **Published posts** and the next occurrence appears in **Drafted posts** or **Scheduled posts**. Set or change repeat cadence in the composer — see <a href="/docs/creating-posts/scheduling#repeating-a-post">Repeating a post</a>.

See <a href="/docs/posts-management/calendar#recurring-posts">Recurring posts on the calendar</a>, <a href="/docs/posts-management/kanban#recurring-posts">Recurring posts on the kanban</a>, <a href="/docs/posts-management/calendar">Calendar</a>, <a href="/docs/posts-management/kanban">Kanban board</a>, and <a href="/docs/getting-started/tour-the-app">Tour the app</a>.

<h3 id="smart-filter">Smart filter</h3>

A **smart filter** is how you narrow a table or board to the channels, posts, templates, or plugs you are working on. Plans list this as **Smart filters**.

<p>On <a href="/account">My Dashboard</a>, open the <strong>Channels</strong> tab, switch to table view (<Badge text="the grid icon" variant="param" />), then click <Badge text="Add filters" variant="param" />. You can match social platform, connected account, business profile name, or status.</p>

![Group Connected Channels Using Smart Filter](/docs/_assets/channel-groups/smart-filter-connected-channel.webp)

<p>The same <Badge text="Add filters" variant="param" /> control sits on the tables at <a href="/account/templates">Templates</a> and <a href="/account/plugs">Auto Plugs</a> — for example social channel and tags on templates, or rule and active on plugs.</p>

<p>On the calendar and the <strong>My Dashboard</strong> <strong>Posts</strong> kanban, smart filters are the dropdowns: <strong>Business profiles</strong>, platforms, and tags. The calendar also has post types. On the kanban, separate <strong>upcoming</strong> time filters apply to drafted and scheduled posts, <strong>past</strong> filters apply to published posts, and you can narrow by review status and source (Agent or Human). See <a href="/docs/posts-management/kanban">Kanban board</a>.</p>

<p>See <a href="/docs/channels/manage">Manage a channel</a>, <a href="/docs/channels/channel-groups">Business profiles</a>, <a href="/account/templates">Templates</a>, and <a href="/docs/automations/plugs">Plugs</a>.</p>

<h3 id="post-states">Post states</h3>

| State | Meaning |
| --- | --- |
| **Draft** | <Badge text="Save as draft" variant="default" />. On <strong>My Dashboard</strong> <strong>Posts</strong> tab under **Drafted posts**. Never publishes until you schedule it. |
| **Scheduled** | Queued for its date (<Badge text="Add to calendar" variant="new" />). The normal state for upcoming posts. |
| **Published** | Sent to the network. The card can link to the live post when the provider returns a URL. |
| **Failed** | The network rejected it or the channel was disconnected. The calendar card shows <Badge text="Failed" variant="default" />. Open it for the error, then edit and schedule again. |

Nothing publishes until a scheduled time arrives and the row is publishable — except <Badge text="Publish now" variant="new" /> in the composer, which queues for the current time.

<h3 id="preview-link">Preview link</h3>

Every post can expose a **preview link**. You can open the link from the post action modal on Kanban or the calendar. See <a href="/docs/posts-management/approvals">Approvals</a> for sending links to clients and collecting comments.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

Share it so someone without an OpenQuok account can read the post and leave comments.

On Cloud, shareable previews require Team plan or above — see <a href="/docs/billing/limits">Cloud limits</a>.

<h3 id="follow-up-comments">Follow-up comments</h3>

<p><Badge text="Follow-up comments" variant="default" /> is the composer panel for parts that publish after the main post. On <strong>Threads</strong> and <strong>X</strong>, those parts are <strong>thread replies</strong>. On <strong>Instagram</strong>, <strong>LinkedIn</strong>, and <strong>Facebook</strong>, they are <strong>comments</strong> on your own post.</p>

<p>See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> for delays, media, and per-network rules.</p>

Follow-up comments are not plugs — they are separate from <a href="#internal-plug">internal plugs</a>, <a href="#cross-account-plug">cross-account plugs</a>, and <a href="#global-plug">global plugs</a>.

<h3 id="internal-plug">Internal plug</h3>

An **internal plug** is a same-account delayed engagement reply on one scheduled post — for example a delayed Threads engagement reply after publish. Enable it in the composer <Badge text="Settings" variant="default" /> accordion on the publishing channel.

![Click Plug Setting](/docs/_assets/glossary/internal-plug-setting.webp)

<p>Today this ships on <strong>Threads</strong> only. See <a href="/docs/automations/internal-plugs">Internal plugs</a>.</p>

It runs once per post, after the main post, <Badge text="Follow-up comments" variant="default" />, and the thread finisher, and does not edit the original post.

<h3 id="cross-account-plug">Cross-account plug</h3>

A **cross-account plug** lets another connected channel comment, repost, or reshare your post after publish. Set it in the composer at <Badge text="Plug settings" variant="default" />.

![Configure Engagement](/docs/_assets/glossary/internal-plug-configure.webp)

<p><strong>Threads</strong>, <strong>X</strong>, and <strong>LinkedIn</strong> support cross-account plugs. You need at least two connected channels on that network. See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.</p>

<h3 id="global-plug">Global plug</h3>

A **global plug** is a saved channel rule at <a href="/account/plugs">/account/plugs</a> that fires on future publishes when engagement crosses your threshold — for example an auto-repost or auto-reply when likes hit a target.

![Set up global plug](/docs/_assets/glossary/global-plug.webp)

<p>See <a href="/docs/automations/global-plugs">Global plugs</a>. The worker re-checks on a schedule, up to three times per post.</p>

<h2 id="directory-launch">Directory launch</h2>

**Directory launch** helps you list your product on launch directories such as PeerPush or Uneed. OpenQuok stores your pitch, checks what is still missing, and can autofill the form in your browser.

<Callout type="note">
<p>OpenQuok does <strong>not</strong> pay directory fees or click submit for you.</p>
</Callout>

<p>See <a href="/docs/directory-submission">Directory submission</a> for the full workflow and <a href="/channels">Channels</a> for social posting vs directory launch.</p>

<Callout type="note" title="Not the same as business profiles">
<p><a href="#business-profiles">Business profiles</a> group <strong>social channels</strong> for the calendar and kanban. <strong>Product profiles</strong> (below) live on <a href="/account/products">My Products</a>. You can link them, but the words mean different things.</p>
</Callout>

<h3 id="product-profile-main">Main product profile</h3>

A **main product profile** is your default product record on <a href="/account/products">My Products</a> — name, tagline, description, website, logo, and directory-specific fields. You edit it in the same composer as variants.

<p>In the CLI and MCP, list mains with <Badge text="directory:profiles:list --main-only" variant="default" /> or <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" />.</p>

<h3 id="directory-variant">Directory variant</h3>

A **directory variant** is a **copy** of the main product profile for **one** launch site (site key <Badge text="peerpush" variant="default" /> or <Badge text="uneed" variant="default" />). You can change the variant for that site without changing the main profile used elsewhere.

<p>Variants are optional. If you have no variant for a site, launch can still use the main profile. See <a href="/docs/directory-submission/profile-variants">Tailor profiles per directory</a>.</p>

<p><strong>Ensure variant</strong> means create the copy the first time or open the copy you already have. CLI: <Badge text="directory:variants:ensure" variant="default" />. MCP: <Badge text="directoryVariantsEnsure" variant="default" />.</p>

<h3 id="directory-site-key">Directory site key</h3>

A **directory site key** is a short slug for the launch site — for example <Badge text="peerpush" variant="default" /> or <Badge text="uneed" variant="default" />.

<Callout type="note">
<p>You pass the slug when you ensure a variant. It is not the same as a social channel id.</p>
</Callout>

<h3 id="directory-destination">Directory destination</h3>

A **directory destination** is one published launch path on a site — for example PeerPush Standard launch or Uneed Join the line. The catalog lists destinations; your product profile can show readiness per destination.

<h3 id="listing-readiness">Listing readiness</h3>

**Listing readiness** tells you which profile fields are still empty before you open the directory site. OpenQuok shows missing fields on the product card and in listing summary responses (CLI <Badge text="directory:listings" variant="default" />, MCP <Badge text="directoryListingSummary" variant="default" />).

<h3 id="directory-analytics">Directory analytics</h3>

**Directory analytics** tracks **cached** domain rating (DR) and competitor domains for your product **website** while you prepare directory launch. It is not social post analytics, and it is not the listing text you submit on PeerPush or Uneed.

<p>Open <a href="/account/analytics">Account → Analytics</a> and switch to the <strong>Directory</strong> tab. Metrics include <Badge text="checkedAt" variant="param" /> (when DR was last stored). Refresh only when your plan allows.</p>

<Callout type="note" title="API and plan names">
<p>Billing, CLI (<Badge text="directory:analytics:*" variant="default" />), and MCP (<Badge text="directorySeoOverview" variant="default" />, etc.) may still say <strong>directory SEO</strong>. That is the same feature as <strong>directory analytics</strong> in the app.</p>
</Callout>

<p>See <a href="/docs/directory-submission/directory-analytics">Directory analytics</a> and <a href="/docs/configuration-backend/directory-seo">Directory SEO & DataForSEO</a> (operator setup).</p>

<h2 id="agents-and-catalog">Agents and catalog</h2>

These terms apply across the workspace — social scheduling, directory launch, CLI, and MCP.

<h3 id="building-block">Building block</h3>

A **building block** is one catalog entry you can install into an agent setup — a skill, an MCP server, or both. It ships a single capability: install steps, and docs on the <a href="/building-blocks">Building Blocks</a> hub.

Create and edit yours from <a href="/account/saved">/account/saved</a> — see <a href="/docs/saved">Saved</a>. A block is one piece of the stack; add it when you need a specific tool or instruction set, not a full workflow.

<h3 id="playbook">Playbook</h3>

A **playbook** is a curated stack of building blocks with a shared workflow. Playbooks appear on the <a href="/playbooks">Playbooks</a> hub and under **Library** on <a href="/account/saved">Account → Saved</a>.

Browse **Explore** to bookmark community playbooks, or publish your own when you want readers to adopt a whole routine. You can also draft one in <a href="/tools/skill-builder">Skill Builder</a> — walkthrough in <a href="/docs/saved/compose-a-playbook">Compose a playbook</a>.

<h3 id="agents">Agents</h3>

**Agents** are your own external assistants — Cursor, Claude Code, CI scripts, chat hosts — that call OpenQuok through the **CLI**, **MCP**, or **public API**. Browse the <a href="/agents">Agents</a> hub to tailor your harness to your use cases.

Agent-created drafts can include a **review note** on the kanban card. Clear or edit it before you approve.

<Callout type="note">
<p>Install the <strong>openquok-core</strong> skill or connect MCP so agents know workspace tokens and integration UUIDs. For directory launch, add the <strong>openquok-directory-launch</strong> skill or use hosted <Badge text="directory*" variant="default" /> MCP tools. Humans still move social drafts to <Badge text="Scheduled" variant="default" /> when you want explicit approval.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Creating posts" description="Post editor layout, flow, and Payload Wizard" href="/docs/creating-posts" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Directory submission" description="My Products, extension autofill, and mark complete" href="/docs/directory-submission" />
<LinkCard title="Channels hub" description="Social platforms vs directory launch platforms" href="/channels" />
<LinkCard title="Saved" description="Explore, Library, backlinks, and your catalog listings" href="/docs/saved" />
<LinkCard title="Tour the app" description="Sidebar, header, My Dashboard tabs, composer, settings, and billing" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Business profiles" description="Bundle social channels by client or brand" href="/docs/channels/channel-groups" />
<LinkCard title="CLI introduction" description="Terminal access for scripts and agents" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP introduction" description="Natural-language scheduling from your editor" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples — PeerPush" description="Agent prompts for directory launch on PeerPush" href="/docs/mcp-examples/peerpush" />
</CardGrid>
