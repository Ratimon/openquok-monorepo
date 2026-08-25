---
title: Manage a channel
description: Reconnect, disable, or remove a connected social account in OpenQuok.
order: 2
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Open the channel

After a channel is connected, day-to-day changes live on <a href="/account">Home</a>. Click the channel and the actions modal appear. If Home is in table layout, click <Badge text="Actions" variant="default" />.

![Add channel to a channel group](/docs/_assets/glossary/add-to-group.webp)

You can do the same from a channel chip on the <a href="/account/calendar">calendar</a>.

## What you can do

| Action | What it does |
| --- | --- |
| <Badge text="Create Post" variant="new" /> | Opens the editor with this channel already selected |
| <Badge text="Complete setup" variant="default" /> | Finish picking a Page, channel, or account — see <a href="/docs/channels/connect">Connect a channel</a> |
| <Badge text="Refresh connection" variant="default" /> | Sign in again, or paste a new API key. Shown when the login is stale |
| <Badge text="Copy channel ID" variant="default" /> | Copies this channel’s id. You only need it for the API, CLI, or an assistant |
| <Badge text="Move / add to group" variant="default" /> | Puts the channel in a <a href="/docs/channels/channel-groups">channel group</a> |
| <Badge text="Edit time slots" variant="default" /> | The times of day you usually post — see <a href="/docs/channels/time-slots">Posting time slots</a> |
| <Badge text="Disable channel" variant="default" /> | Stops posting without removing the connection. Use <Badge text="Enable channel" variant="default" /> to resume |
| <Badge text="Delete channel" variant="default" /> | Removes the connection from this workspace after all posts for the channel are gone |

## When the login expires

Social logins do not last forever. When one stops working, the channel shows <Badge text="Refresh needed" variant="param" /> and new posts start failing.

Click <Badge text="Refresh connection" variant="default" />. For most networks you approve access in the browser again.

A few things to keep in mind:

- Refreshing is not the same as adding a new channel. On Cloud it does not use another channel slot.
- Approve the **same** account. Signing in as someone else mixes that channel’s history with a different profile.
- Posts that already failed are not sent again on their own. Open the failed card, fix anything that needs it, and schedule it once more.

<Callout type="tip">
<p>If you connected with an invite link, send a fresh invite and have the same person approve access again.</p>
</Callout>

## Pause or remove

On Cloud, plan limits treat channels in two ways. A **connected** cap counts every non-deleted channel (including disabled ones). An **active** cap counts only channels that are not disabled. See <a href="/docs/cloud/limits">Cloud limits</a>.

<strong>Disable</strong> leaves the channel in the workspace but takes it out of service. You cannot schedule <strong>new</strong> posts to it until you click <Badge text="Enable channel" variant="default" />.

Posts that were already scheduled are <strong>not</strong> cancelled. They stay on the calendar until their time, then fail. Re-enable the channel before that time if you still want them to go out.

After a plan downgrade, OpenQuok may auto-disable the most recently connected channels until the workspace is within the new active limit. Connected channels stay in the workspace; only their active status changes.

<strong>Delete</strong> removes the connection. OpenQuok asks you to confirm, then <Badge text="Remove" variant="default" />. You can connect that account again later.

Delete is blocked while any post still references the channel (drafts, scheduled, published, or failed). Remove or delete those posts first, or disable the channel instead if you only want to pause posting.

<Callout type="note" title="Freeing a connected slot">
<p>To free a <strong>connected</strong> slot on Cloud, delete a channel you no longer need after its posts are gone, or upgrade. Disable does not free a connected slot. See <a href="/docs/cloud/limits">Cloud limits</a>.</p>
</Callout>

On self-hosted OpenQuok with billing unset, there is no channel cap. Disable and delete are only about whether you still want that account in the workspace.

## Related

<CardGrid>
<LinkCard title="Connect a channel" description="Add Channel, sign-in flows, API keys, and invite links" href="/docs/channels/connect" />
<LinkCard title="Posting time slots" description="Usual posting hours per channel and how suggestions use them" href="/docs/channels/time-slots" />
<LinkCard title="Channel groups" description="Bundle channels by client or brand" href="/docs/channels/channel-groups" />
<LinkCard title="Cloud limits" description="What happens when a workspace hits the channel cap" href="/docs/cloud/limits" />
<LinkCard title="Glossary" description="Channel vs integration, time slots, and calendar vs kanban" href="/docs/getting-started/glossary" />
</CardGrid>
