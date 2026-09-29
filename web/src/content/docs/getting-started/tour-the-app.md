---
title: Tour the app
description: Find your way around the OpenQuok — sidebar pages, header, composer, settings, billing, and the public site.
order: 3
lastUpdated: 2026-09-29
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Where every sidebar page lives and what you do there — <strong>My Dashboard</strong>, calendar, plugs, analytics, and settings.

Most of our features are put behind the left sidebar.

![Protected left sidebar](/docs/_assets/tour-the-app/left-sidebar.webp)

<Callout type="tip">
<p>The sidebar footer has <Badge text="Reset product tours" variant="default" /> if you want those guides again.</p>
</Callout>

You can switch workspaces from the header switcher or from the workspace cards on <strong>My Dashboard</strong>.

![Switch to Other Workspaces](/docs/_assets/tour-the-app/top-header-workspaces.webp)

<Callout type="tip">
<p>Switch workspace from the header on <a href="/account"><Badge text="My Dashboard" variant="default" /></a>, <a href="/account/calendar"><Badge text="Calendar" variant="default" /></a>, <a href="/account/templates"><Badge text="Templates" variant="default" /></a>, <a href="/account/playbooks"><Badge text="Playbooks" variant="default" /></a>, <a href="/account/plugs"><Badge text="Auto Plugs" variant="default" /></a>, <a href="/account/analytics"><Badge text="Analytics" variant="default" /></a>, and <a href="/account/media"><Badge text="Media" variant="default" /></a>. Calendar, templates, plugs, and the other sidebar pages use the full width to maximize UX, so the header switcher is often easier than the workspace cards in the <a href="/account"><strong>My Dashboard</strong></a>.</p>
</Callout>


Settings and Billing sit under the account menu.

![Navigate to Settings or Billing](/docs/_assets/tour-the-app/top-header-account.webp)

## Left sidebar


| Label | Path | What you do there |
| --- | --- | --- |
| <Badge text="My Dashboard" variant="default" /> | <Badge text="/account" variant="path" /> | Plan overview, workspace cards, **Channels** / **Posts** / **Feed** tabs (connected channels, kanban, notifications), Getting started card with <Badge text="See checklist" variant="default" />, <Badge text="Create Post" variant="new" /> |
| <Badge text="Calendar" variant="default" /> | <Badge text="/account/calendar" variant="path" /> | Month or week of scheduled and published posts |
| <Badge text="Templates" variant="default" /> | <Badge text="/account/templates" variant="path" /> | Saved composer presets — see <a href="/docs/posts-management/templates">Templates</a> |
| <Badge text="Playbooks" variant="default" /> | <Badge text="/account/playbooks" variant="path" /> | Browse, bookmark, and edit playbooks and building blocks — see <a href="/docs/playbooks">Playbooks</a> |
| <Badge text="Auto Plugs" variant="default" /> | <Badge text="/account/plugs" variant="path" /> | Global channel rules after publish — see <a href="/docs/automations/global-plugs">Global plugs</a> |
| <Badge text="Analytics" variant="default" /> | <Badge text="/account/analytics" variant="path" /> | Reach and engagement after publish — see <a href="/docs/insights/workspace-analytics">Insights → Workspace analytics</a> |
| <Badge text="Media" variant="default" /> | <Badge text="/account/media" variant="path" /> | Image and video library — see <a href="/docs/media">Media library</a>. Cloud caps are on <a href="/docs/billing/limits">Cloud limits</a> |


## Header

The header is independent of the sidebar.

| Control | Role |
| --- | --- |
| Workspace switcher | Loads another workspace you belong to |
| Docs | This documentation |
| Notifications | Publish failures and review notes — same preview as <strong>My Dashboard</strong> <Badge text="Feed" variant="default" /> |
| Theme | Light or dark |
| Feedback | Send a note to the team |
| Account menu | <Badge text="Settings" variant="default" />, <Badge text="Billing" variant="default" />, sign out |

## My Dashboard, calendar, and the composer

<strong>My Dashboard</strong> is your workspace dashboard. It shows:

1)  **Plan overview**: (workspace, channel, and storage usage). Below that, desktop layout splits into a **left rail** and a **main panel**.

2) **left rail**: It inculds **Workspace cards** — switch workspace, create one, accept invites, and open **OAuth Secrets**, **API key**, or **Add channel** from the active card.

The main panel uses pill tabs:

| Tab | What you do there |
| --- | --- |
| **Channels** | Connected channel grid or table, <Badge text="Add Channel" variant="new" />, channel menus, and smart filters on the table view |
| **Posts** | Kanban columns for draft, scheduled, and published post groups (when the workspace has at least one social channel) |
| **Feed** | In-app notifications — publish results, failures, and review notes (same data as the header bell) |

![The Main Dashboard 's components](/docs/_assets/getting-started/1-workspace-dashboard.webp)

A **Feed** button beside the tab bar on wider layouts also switches to the Feed tab and shows an unread badge.

The calendar is the same posts laid out by date at <a href="/account/calendar">/account/calendar</a>.

The post editor is a modal, not a sidebar page. Open it with <Badge text="Create Post" variant="new" /> from the **Channels** or **Posts** tab on <strong>My Dashboard</strong>, or from a calendar — when the workspace has saved templates, the **Select a template** picker appears first. See <a href="/docs/creating-posts">Creating posts</a> and <a href="/docs/posts-management/templates">Templates</a> for layout, flow, and preset workflows.

| Action | Where it lives |
| --- | --- |
| <Badge text="Add Channel" variant="new" /> | <strong>My Dashboard</strong> **Channels** tab, **Add channel** on the current workspace card, or the channel picker in the composer |
| Reconnect or disconnect a channel | Channel card menu on the **Channels** tab |
| Channel groups | Group controls on the **Channels** tab and kanban filters on the **Posts** tab — see <a href="/docs/channels/channel-groups">Channel groups</a> |
| Smart filters | **Channels** tab table <Badge text="Add filters" variant="default" />; kanban and calendar dropdowns; Templates and Auto Plugs tables — see <a href="/docs/getting-started/glossary#smart-filter">Smart filter</a> |
| Per-network fields | Composer, beside the preview |
| Tags | Composer footer — see <a href="/docs/getting-started/glossary#tag">Tag</a> in the glossary |
| Signatures | Composer toolbar — see <a href="/docs/settings/signatures">Signatures</a> |
| Internal (per-post) plugs | Composer <Badge text="Settings" variant="default" /> accordion — see <a href="/docs/automations/internal-plugs">Internal plugs</a> |
| Cross-account (per-post) plugs | Composer <Badge text="Plug settings" variant="default" /> — see <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> |
| Shareable preview | Post card actions — see <a href="/docs/posts-management/approvals">Approvals</a>. Public URL under <Badge text="/p/" variant="path" /> plus the post id |

## Settings


| Tab | Purpose |
| --- | --- |
| **Timezone** | Workspace posting timezone — see <a href="/docs/settings/timezone">Timezone</a> |
| **Workspace** | Name, team invites, roles — see <a href="/docs/settings/team">Team</a> |
| **Profile** | Display name and account preferences — see <a href="/docs/settings/profile">Profile</a> |
| **Developers** | <Badge text="opo_" variant="default" /> programmatic tokens, MCP connection snippets, OAuth apps — see <a href="/docs/settings/developers">Developers</a> |
| **Approved Apps** | Third-party apps you granted access — see <a href="/docs/settings/approved-apps">Approved apps</a> |
| **Signatures** | Reusable sign-offs you can append in the composer — see <a href="/docs/settings/signatures">Signatures</a> |

<Callout type="warning">
<p>Programmatic tokens are shown <strong>once</strong> when generated. Store them in a password manager or CI secret. Rotating a token invalidates the previous value immediately.</p>
</Callout>

CLI device login does not require pasting a token — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

### Payload Wizard

<p><Badge text="Payload Wizard" variant="default" /> at <a href="/account/payload-wizard">/account/payload-wizard</a> is the same editor on a full page, then copy JSON for the public API. It is a page, not a sidebar item. Developers → <strong>Access</strong> links here. See <a href="/docs/creating-posts">Creating posts</a> → Payload Wizard.</p>

## Billing

<a href="/account/billing"><Badge text="/account/billing" variant="path" /></a> is also under the account menu. It is limited to workspace owners.

<Callout type="note" title="Self-hosted installs">
<p>If Stripe is unset, <Badge text="Billing" variant="default" /> is hidden or shown as not configured. There is no Cloud subscription to manage. See <a href="/docs/installation">Self-hosting</a>.</p>
</Callout>

## Public site

These routes exist without signing in. On a self-hosted origin they may point at the hosted marketing site.

| Surface | Path | Purpose |
| --- | --- | --- |
| Channel catalog | <a href="/channels"><Badge text="/channels" variant="path" /></a> | Per-network landing pages and connect overview |
| Playbooks hub | <a href="/playbooks"><Badge text="/playbooks" variant="path" /></a> | Public playbook catalog |
| Building blocks | <a href="/building-blocks"><Badge text="/building-blocks" variant="path" /></a> | Skills and MCP listings |
| Agents | <a href="/agents"><Badge text="/agents" variant="path" /></a> | How to wire Cursor, Claude, and other harnesses |
| Pricing | <a href="/pricing"><Badge text="/pricing" variant="path" /></a> | Plan tiers and numeric limits |
| Documentation | <a href="/docs"><Badge text="/docs" variant="path" /></a> | This Guide, Cloud, self-hosting, CLI, MCP, and API reference |

## Related

<CardGrid>
<LinkCard title="Overview" description="What OpenQuok is and how to pick Cloud, self-hosting, or APIs" href="/docs/getting-started" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Glossary" description="Workspace, channel, smart filters, and calendar vs kanban terminology" href="/docs/getting-started/glossary" />
<LinkCard title="Cloud" description="Trial, plans, billing, and limits" href="/docs/cloud" />
</CardGrid>
