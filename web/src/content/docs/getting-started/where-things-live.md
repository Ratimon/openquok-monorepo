---
title: Where things live
description: Map of the OpenQuok app — sidebar pages, composer and Add Channel (not in the rail), settings, billing, and marketing surfaces.
order: 3
lastUpdated: 2026-08-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok puts a lot behind a small left rail, and several of the most-used features are modals rather than pages. This is the map. Paths are relative to the app origin (for example <a href="/account">/account</a> on Cloud).

## The left rail

| Label | Path | Purpose |
| --- | --- | --- |
| <Badge text="Home" variant="default" /> | `/account` | Connected channels, **kanban board**, Getting started checklist, <Badge text="Create Post" variant="new" /> |
| <Badge text="Calendar" variant="default" /> | `/account/calendar` | Month/week view of scheduled and published posts |
| <Badge text="Templates" variant="default" /> | `/account/templates` | Saved composer presets (caption, media, channels) |
| <Badge text="Playbooks" variant="default" /> | `/account/playbooks` | Browse, bookmark, and edit playbooks and building blocks |
| <Badge text="Auto Plugs" variant="default" /> | `/account/plugs` | Global channel rules after publish |
| <Badge text="Analytics" variant="default" /> | `/account/analytics` | Reach and engagement after posts publish (fields depend on the network) |
| <Badge text="Media" variant="default" /> | `/account/media` | Image and video library for composer attachments. Cloud storage caps are on <a href="/docs/cloud/limits">Cloud limits</a> |

<Callout type="note" title="Billing on self-host">
<p>On a self-hosted install with Stripe unset, <Badge text="Billing" variant="default" /> does not appear (or is shown as not configured). There is nothing to bill. On Cloud, Billing is limited to workspace owners.</p>
</Callout>

## Things that are not pages

These are the features people most often cannot find, because they are modals or panels rather than entries in the rail.

| Looking for | Where it is |
| --- | --- |
| <Badge text="Add Channel" variant="new" /> | Home, or the channel picker in the composer |
| Channel reconnect / disconnect | Home, the menu on a channel card |
| Group channels by client | Channel group controls on Home; filter Home and calendar by group |
| The post composer | <Badge text="Create Post" variant="new" /> on Home, a day on the calendar, or **Use template** |
| Per-network post settings | Inside the composer, next to the preview |
| <Badge text="Payload Wizard" variant="default" /> | <a href="/account/payload-wizard">/account/payload-wizard</a> — same composer fields, copy JSON for the public API |
| Shareable post preview | Post card action (plan-gated on Cloud) — public URL under <Badge text="/p/" variant="path" /> plus the post id |
| Your API token | Settings → <Badge text="Developers" variant="default" /> → **Access** |
| MCP connection snippet | Same **Access** panel |
| Notifications | Header dock — publish failures and review notes |

## Settings and Billing

Open your avatar or account menu in the header.

| Destination | Path | Purpose |
| --- | --- | --- |
| <Badge text="Settings" variant="default" /> | `/account/settings` | Tabs via `?section=` |
| <Badge text="Billing" variant="default" /> | `/account/billing` | Plans, Stripe checkout, and subscription (Cloud) |

Settings tabs:

| Tab | What it holds |
| --- | --- |
| **Timezone** | Workspace posting timezone (calendar and schedule times) |
| **Workspace** | Name, team invites, roles (owner, admin, user) |
| **Profile** | Display name and account preferences |
| **Developers** | <Badge text="opo_" variant="default" /> programmatic tokens, MCP snippets, OAuth apps |
| **Approved Apps** | Third-party apps you granted access, and revoking them |
| **Signatures** | Reusable sign-offs you can append in the composer |

<Callout type="warning">
<p>Programmatic tokens are shown <strong>once</strong> when generated. Store them in a password manager or CI secret. Rotating a token invalidates the previous value immediately.</p>
</Callout>

CLI device login does not require pasting a token — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Marketing surfaces

These are outside the signed-in app:

| Surface | Path | Purpose |
| --- | --- | --- |
| Channel catalog | <a href="/channels">/channels</a> | Per-network landing pages and connect overview |
| Pricing | <a href="/pricing">/pricing</a> | Plan tiers and numeric limits |
| Documentation | <a href="/docs">/docs</a> | This Guide, Cloud, self-hosting, CLI, MCP, and API reference |

## Related

<CardGrid>
<LinkCard title="Overview" description="What OpenQuok is and how to pick Cloud, self-hosting, or APIs" href="/docs/getting-started" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Glossary" description="Workspace, channel, and calendar vs kanban terminology" href="/docs/getting-started/glossary" />
<LinkCard title="Cloud" description="Trial, plans, billing, and limits" href="/docs/cloud" />
</CardGrid>
