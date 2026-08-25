---
title: Channel groups
description: Group OpenQuok channels by client or brand, and pick every channel in a group at once in the composer.
order: 4
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What they are

A **channel group** is a label you put on one or more channels — usually one client, one brand, or one project. Each channel belongs to at most one group. Channels with no group stay in the **Ungrouped** list.

If you manage social for more than one client, groups keep Home readable and let you focus on one account at a time.

## Put a channel in a group

On <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a>, open a channel’s menu and click <Badge text="Move / add to group" variant="default" />.

![Add channel to a channel group](/docs/_assets/glossary/add-to-group.webp)

<p>Then, in the dialog, pick an existing group or type a new name and click <Badge text="Save" variant="new" />.This will create the group when the name is new.</p>

![Grouped and Ungrouped cahnnels](/docs/_assets/channel-groups/grouped-channel-dialog.webp)

<p>To move the channel back to the ungrouped list, open a channel’s menu again and click <Badge text="Remove from group" variant="default" />.</p>

## What you get on Home

Once at least one channel is grouped, it shows **Grouped accounts/channels** — collapsible sections, one per group.

![Grouped and Ungrouped cahnnels](/docs/_assets/channel-groups/grouped-ungrouped-channel.webp)

Each section lists that group’s channels and offers shortcuts to compose or open the calendar for that group.

Channels not in any group appear under **Ungrouped accounts/channels**.

## Filter Home and the calendar

When you have groups, a **Channel groups** filter appears above the kanban on Home and on the calendar toolbar.

Use it to hide every other client’s posts.

Or, You can select one group, several groups, or **Ungrouped channels** only as required.

## Pick a whole group in the composer

In the post editor, open <Badge text="Select grouped channels" variant="default" />. OpenQuok selects every ready channel in that group in one click — handy when the same caption should go to all of a client’s networks.

You can still add or remove individual channel after that.

## Connect a client’s channel first

You do not need their OpenQuok login. Send an **invite link**, so they authorize on the social account themselves.

![Send Invitation Links](/docs/_assets/channel-groups/send-invite.webp)

When the channel appears in your workspace, assign it to their group.

See <a href="/docs/channels/connect">Connect a channel</a> for invite links and which networks support them.

## Approval workflow

Grouping pairs with <a href="/docs/calendar-and-posts/approvals">Approvals</a>: put a client’s channels in one group, draft their week, then send preview links for sign-off before anything publishes.

## API and automations

The dashboard says <strong>channel group</strong>. The public API and CLI call the same thing <strong>customers</strong>.

<CardGrid>
<LinkCard title="List Channel Groups" description="Publig APIs to get ids for filtering integrations and posts" href="/docs/apis-integrations/groups" />
<LinkCard title="CLI integrations" description="Agentic CLI workflows" href="/docs/cli-usages/integrations" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Connect a channel" description="Add Channel, OAuth, API keys, and invite links for clients" href="/docs/channels/connect" />
<LinkCard title="Manage a channel" description="Reconnect, disable, or remove a connected account" href="/docs/channels/manage" />
<LinkCard title="Posting time slots" description="Usual posting hours per channel" href="/docs/channels/time-slots" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/calendar-and-posts/approvals" />
<LinkCard title="Glossary" description="Channel groups, preview links, and calendar vs kanban" href="/docs/getting-started/glossary" />
</CardGrid>
