---
title: Business profiles
description: Link OpenQuok channels to a business profile (client or brand), filter the dashboard by profile, and select every channel in a profile at once in the post editor.
order: 3
lastUpdated: 2026-10-14
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What they are

> Bundle channels by client or brand — and pick every channel in a business profile at once in the composer.

A **business profile** is a workspace label for one or more channels — usually one client, one brand, or one project. Each channel links to at most one business profile.

<Callout type="note">
<p>Channels with no profile are shown under <strong>Not linked to a business profile</strong> section.</p>
</Callout>

If you manage social for more than one client, business profiles keep <strong>My Dashboard</strong> readable and let you focus on one account at a time. The same profile can also hold **product** details for directory launches on the **Products** tab.

## Link a channel to a business profile

On <a href="/account">My Dashboard</a> or the <a href="/account/calendar">calendar</a>, open a channel’s menu and click <Badge text="Move / add to business profile" variant="default" />.

![Link a channel to a business profile](/docs/_assets/glossary/add-to-group.webp)

<p>Then, in the dialog, pick an existing business profile or type a new name and click <Badge text="Save" variant="new" />. A new profile is created when the name is new.</p>

![Business profiles and unlinked channels](/docs/_assets/channel-groups/grouped-channel-dialog.webp)

<p>To unlink a channel, open the channel menu again and choose <strong>Remove from business profile</strong> (or clear the profile in the same dialog).</p>

## What you get on the Channels tab

On <Badge text="My Dashboard" variant="default" /> → <Badge text="Channels" variant="default" />, linked channels appear in collapsible **business profile** sections. Each section lists that profile’s channels and offers shortcuts to compose or open the calendar for that profile.

![Linked business profiles and unlinked channels](/docs/_assets/channel-groups/grouped-ungrouped-channel.webp)

Channels not linked to any profile are listed separately (**Not linked to a business profile**).

## Filtering posts and calendar

When you have at least one business profile, a **Business profiles** filter appears on the <Badge text="Posts" variant="default" /> tab toolbar on <Badge text="My Dashboard" variant="default" /> and on the calendar toolbar. (Some screens may still show the legacy label <strong>Channel groups</strong> until UI copy is fully updated.)

Use it to hide every other client’s posts. Select one profile, several profiles, or **Ungrouped channels** / unlinked channels only.

## Pick a whole profile in the composer

In the post editor, open <Badge text="Select grouped channels" variant="default" />. OpenQuok selects every ready channel in that business profile in one click — handy when the same caption should go to all of a client’s networks.

You can still add or remove individual channels after that.

## Connect a client’s channel first

You do not need their OpenQuok login. Send an **invite link**, so they authorize on the social account themselves.

![Send Invitation Links](/docs/_assets/channel-groups/send-invite.webp)

When the channel appears in your workspace, link it to their business profile.

See <a href="/docs/channels/connect">Connect a channel</a> for invite links and which networks support them.

## Approval workflow

Business profiles pair with <a href="/docs/posts-management/approvals">Approvals</a>: put a client’s channels in one profile, draft their week, then send preview links for sign-off before anything publishes.

## API and automations

The dashboard uses <strong>business profile</strong>. The public API and CLI call the same concept <strong>customers</strong> (see <Badge text="GET /public/integrations/groups" variant="path" />).

<CardGrid>
<LinkCard title="List business profiles (API)" description="Public API — customer ids for filtering integrations and posts" href="/docs/apis-integrations/groups" />
<LinkCard title="CLI integrations" description="Agentic CLI workflows" href="/docs/cli-usages/integrations" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Connect a channel" description="Add Channel, OAuth, API keys, and invite links for clients" href="/docs/channels/connect" />
<LinkCard title="Manage a channel" description="Reconnect, disable, or remove a connected account" href="/docs/channels/manage" />
<LinkCard title="Posting time slots" description="Usual posting hours per channel" href="/docs/channels/time-slots" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/posts-management/approvals" />
<LinkCard title="Glossary" description="Business profiles, preview links, and calendar vs kanban" href="/docs/getting-started/glossary" />
</CardGrid>
