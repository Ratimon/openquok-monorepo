---
title: Tour the app
description: OpenQuok layout — sidebar pages, header, composer, settings, billing, and the public site.
order: 3
lastUpdated: 2026-08-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok puts a things behind a left sidebar, and several of the most-used features are modals rather than pages. This is the map. Paths are relative to the app origin (for example <a href="/account"><Badge text="/account" variant="path" /></a> on Cloud).

![Signed-in left sidebar](/docs/_assets/tour-the-app/left-sidebar.webp)

Most of our features are put behind the left sidebar, and the sidebar footer has <Badge text="Reset product tours" variant="default" /> if you want those guides again.

You can switch between your workspaces on the header.

![Work Space and Account](/docs/_assets/tour-the-app/top-header.webp)

Settings and Billing sit under the account menu.

## Left sidebar


| Label | Path | What you do there |
| --- | --- | --- |
| <Badge text="Home" variant="default" /> | <Badge text="/account" variant="path" /> | Connected channels, Getting started checklist, kanban, <Badge text="Create Post" variant="new" /> |
| <Badge text="Calendar" variant="default" /> | <Badge text="/account/calendar" variant="path" /> | Month or week of scheduled and published posts |
| <Badge text="Templates" variant="default" /> | <Badge text="/account/templates" variant="path" /> | Saved composer presets — caption, media, channels, provider settings |
| <Badge text="Playbooks" variant="default" /> | <Badge text="/account/playbooks" variant="path" /> | Browse, bookmark, and edit playbooks and building blocks |
| <Badge text="Auto Plugs" variant="default" /> | <Badge text="/account/plugs" variant="path" /> | Global Channel-level rules that run after a post publishes |
| <Badge text="Analytics" variant="default" /> | <Badge text="/account/analytics" variant="path" /> | Reach and engagement after publish (fields vary by network) |
| <Badge text="Media" variant="default" /> | <Badge text="/account/media" variant="path" /> | Image and video library for the composer. Cloud caps are on <a href="/docs/cloud/limits">Cloud limits</a> |


## Header

The header is independent of the sidebar.

| Control | Role |
| --- | --- |
| Workspace switcher | Loads another workspace you belong to |
| Docs | This documentation |
| Notifications | Publish failures and review notes |
| Theme | Light or dark |
| Feedback | Send a note to the team |
| Account menu | <Badge text="Settings" variant="default" />, <Badge text="Billing" variant="default" />, sign out |

## Home, calendar, and the composer

Home is where to manage channel cards, the Getting started checklist, and kanban columns for post status.

The calendar is the same posts laid out by date.

The post editor ( aka composer) is a modal, not a sidebar page. Open it with <Badge text="Create Post" variant="new" />, or <Badge text="Select a template" variant="default" />.

| Action | Where it lives |
| --- | --- |
| <Badge text="Add Channel" variant="new" /> | Home, or the channel picker in the composer |
| Reconnect or disconnect a channel | Channel card menu on Home |
| Channel groups | Group controls on Home |
| Per-network fields | Composer, beside the preview |
| Tags | Composer toolbar |
| Signatures | Composer toolbar; manage the list in Settings |
| Internal (per-post) plugs | Composer <Badge text="Plug settings" variant="default" /> — see <a href="/docs/getting-started/glossary">Glossary</a> |
| Shareable preview | Post card actions. Public URL under <Badge text="/p/" variant="path" /> plus the post id |

## Settings


| Tab | Purpose |
| --- | --- |
| **Timezone** | Workspace posting timezone — calendar slots and scheduled times use this, not the browser clock |
| **Workspace** | Name, team invites, roles |
| **Profile** | Display name and account preferences |
| **Developers** | <Badge text="opo_" variant="default" /> programmatic tokens, MCP connection snippets, OAuth apps |
| **Approved Apps** | Third-party apps you granted access, and revoking them |
| **Signatures** | Reusable sign-offs you can append in the composer |

<Callout type="warning">
<p>Programmatic tokens are shown <strong>once</strong> when generated. Store them in a password manager or CI secret. Rotating a token invalidates the previous value immediately.</p>
</Callout>

CLI device login does not require pasting a token — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

### Payload Wizard

<p><Badge text="Payload Wizard" variant="default" /> at <a href="/account/payload-wizard">/account/payload-wizard</a> is the same composer fields, then copy JSON for the public API. It is a page, not a sidebar item. Developers → <strong>Access</strong> links here.</p>

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
<LinkCard title="Glossary" description="Workspace, channel, and calendar vs kanban terminology" href="/docs/getting-started/glossary" />
<LinkCard title="Cloud" description="Trial, plans, billing, and limits" href="/docs/cloud" />
</CardGrid>
