---
title: Team
description: Invite teammates, assign roles, switch workspaces, and manage your OpenQuok workspace.
order: 1
lastUpdated: 2026-09-17
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Team and workspace

> Invite teammates, set roles, and manage the workspaces you belong to.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Workspace" variant="default" /> (<a href="/account/settings?section=workspace">/account/settings?section=workspace</a>).

A **workspace** is the boundary for channels, posts, media, and teammates. You can belong to more than one. The header switcher loads another workspace’s data when you change workspace.

The first person who creates a workspace is the **owner**. Everything in that workspace — channels, posts, templates — stays with the workspace when someone leaves.

![OpenQuok Workspace Tab in Setting](/docs/_assets/glossary/workspace-setting.webp)

## Roles

| Role | Can do |
| --- | --- |
| **Member** | Work with channels and posts |
| **Admin** | The above, plus invite members and edit workspace details |
| **Owner** | The above, plus delete the workspace and manage billing on Cloud |

You can only manage people below your own level. An admin cannot remove the owner.

Invites offer **Member** or **Admin** only. The owner role is assigned when the workspace is created.

## Invite a teammate

<Steps howToName="Invite a teammate" howToDescription="Add a colleague to your OpenQuok workspace by email.">

### Open the invite dialog

On <Badge text="Workspace" variant="default" />, find **Team Members** for the current workspace. Click <Badge text="Add another member" variant="new" />.

![Invite a team member](/docs/_assets/settings/workspace-invite-dialog.webp)

<Callout type="note">
Only **admins** and the **owner** see this button.
</Callout>

### Enter email and role

Type the person’s email. Pick **Member** or **Admin**.

### Choose email delivery

Leave <Badge text="Send invitation email" variant="default" /> checked to mail them the link. Clear it when you want to copy the link yourself — useful when email is unreliable.

### The invitees accept

The invite link expires after a set time. they can accept from the join page when they open the link. Send a new invite if it lapses.

<Callout type="tip">
They can also accept from **Workspace Invites** at the bottom of the same Settings page.
</Callout>

</Steps>

## Pending and incoming invites

**Pending invitations** (visible to the **owner** only) lists invites you sent that are not yet accepted. Click <Badge text="Cancel" variant="default" /> to free a seat before someone joins.

**Workspace Invites** lists invitations sent <strong>to you</strong>. Click <Badge text="Accept" variant="new" /> to join that workspace with the role shown on the row.

<Callout type="note">
<p>Each pending invite counts toward your team seat cap until it is accepted or cancelled. At the limit, upgrade on <a href="/account/billing">Billing</a> or cancel a pending invite. See <a href="/docs/cloud/limits">Cloud limits</a>.</p>
</Callout>

## Multiple workspaces

The **All Workspaces** lists every workspace you belong to.

| Action | Who |
| --- | --- |
| **Switch** | Any member — loads that workspace in the app |
| **Edit workspace** | Admin or owner — name and description |
| **Copy Workspace ID** | Any member — for API and support |
| **Leave workspace** | Any member who is not the owner |
| **Delete workspace** | Owner only — removes the workspace and its data |

![Open workspace's actions modal as Owner](/docs/_assets/settings/workspace-actions.webp)

Click <Badge text="Create New Workspace" variant="new" /> to start a separate workspace with its own channels and member list. Cloud plans cap how many workspaces you can own. See <a href="/pricing">Pricing</a>.

## Working with clients

<Callout type="tip">
Team seats are for people who work <strong>inside</strong> your OpenQuok workspace. For clients, lighter options usually work better:
</Callout>

- **Channel invite links** let a client connect their own social account without an OpenQuok login. See <a href="/docs/channels/connect#let-clients-connect-their-own-account">Let clients connect their own account</a>.
- **Preview links** let a client review and comment on specific posts without seeing the rest of the workspace. See <a href="/docs/posts-management/approvals">Approvals</a>.
- **Channel groups** keep each client’s channels together on Home and the calendar. See <a href="/docs/channels/channel-groups">Channel groups</a>.

None of these consume a team seat.

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="Connect a channel" description="OAuth, credentials, and client invite links" href="/docs/channels/connect" />
<LinkCard title="Approvals" description="Preview links for client sign-off" href="/docs/posts-management/approvals" />
<LinkCard title="Cloud limits" description="Team seats, workspaces, and upgrade paths" href="/docs/cloud/limits" />
</CardGrid>
