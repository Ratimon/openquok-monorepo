---
title: Business profiles
description: 'How to link social accounts to business profile and filter posts for social Channel, and How to use reuse busimess profile to repeat directory launches across directory channels.'
order: 3
lastUpdated: 2026-10-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What they are

> One label per client or brand. Social scheduling and directory launch can use the same business profile name when they belong to one brand.

A **business profile** groups work for one client, brand, or product. It is not a social network login and it is not a directory site account.

| Phase | Where | What the profile does |
| --- | --- | --- |
| **Social channels** | <a href="/account">My Dashboard</a> → <Badge text="Channels" variant="default" /> | Links connected social accounts; filters posts and calendar; bulk-select in the composer |
| **Directory channels** | <a href="/account/products">My Products</a> | Stores product copy and directory fields for extension autofill and launches |

You can use either phase alone or both for the same brand.

---

## Social channels

Business profiles only affect **connected social accounts** on My Dashboard and scheduled posts.

### Link a social channel to a profile

On <a href="/account">My Dashboard</a> or the <a href="/account/calendar">calendar</a>, open a social channel menu and click <Badge text="Move / add to business profile" variant="default" />.

![Link a channel to a business profile](/docs/_assets/glossary/add-to-group.webp)

<p>Pick an existing profile or type a new name, then click <Badge text="Save" variant="new" />. OpenQuok creates the profile when the name is new.</p>

![Business profiles and unlinked channels](/docs/_assets/channel-groups/grouped-channel-dialog.webp)

<p>To unlink, open the channel menu and choose <strong>Remove from business profile</strong> (or clear the profile in the same dialog).</p>

Each social channel joins at most one profile.

<Callout type="note">
<p>Channels with no profile appear under <strong>Not linked to a business profile</strong> on the Channels tab.</p>
</Callout>

### Channels tab layout

On <Badge text="My Dashboard" variant="default" /> → <Badge text="Channels" variant="default" />, linked channels appear in collapsible **business profile** sections with shortcuts to compose or open the calendar.

![Linked business profiles and unlinked channels](/docs/_assets/channel-groups/grouped-ungrouped-channel.webp)

### Filter posts and calendar

When you have at least one profile, a **Business profiles** filter appears on the <Badge text="Posts" variant="default" /> tab and on the calendar toolbar. (Some screens still show <strong>Channel groups</strong>.)

Select one profile, several profiles, or **Ungrouped channels** only. This filter does not apply to directory rows on My Products.

### Select every channel in a profile (composer)

In the post editor, open <Badge text="Select grouped channels" variant="default" />. OpenQuok selects every ready social channel in that profile in one click. You can still add or remove individual channels afterward.

### Connect a client’s channel (invite link)

You do not need their OpenQuok login. Send an **invite link** so they authorize the social account themselves.

![Send Invitation Links](/docs/_assets/channel-groups/send-invite.webp)

When the channel appears in your workspace, link it to their business profile. See <a href="/docs/channels/connect">Connect a channel</a>.

### Approvals

Put a client’s social channels in one profile, draft their week, then use <a href="/docs/posts-management/approvals">Approvals</a> for preview links and sign-off before anything publishes.

### API and CLI (social)

The dashboard says **business profile**. The public API and CLI use **customers** for the same concept when you list or filter social integrations and posts.

<CardGrid>
<LinkCard title="List business profiles (API)" description="Customer ids for filtering integrations and posts" href="/docs/apis-integrations/groups" />
<LinkCard title="CLI integrations" description="List channels and filter by customer group" href="/docs/cli-usages/integrations" />
</CardGrid>

---

## Directory channels

Directory business profiles only affect **product and launch data** on My Products. They do not use <Badge text="Move / add to business profile" variant="default" /> on the Channels tab.

### Create or open a profile on My Products

On <a href="/account/products">My Products</a>, create or open a business profile for your product. Fill the fields the directory composer shows — name, tagline, description, website, logo, and site-specific discovery fields.

| Task | Where |
| --- | --- |
| Check **readiness** before a launch | Destination cards on the profile |
| Launch with the extension | <Badge text="Launch to directory" variant="new" /> on a destination card |
| Tailor copy per directory | <a href="/docs/directory-submission/profile-variants">Profile variants</a> |
| Track listing URLs | <a href="/docs/directory-submission/track-submissions">Track submissions</a> |

See <a href="/docs/directory-submission">Directory submission</a> for the full launch workflow.

### Use the same profile name as social (optional)

When one brand needs both scheduling and directory listings, link the client’s **social** channels to a profile on My Dashboard and use the **same profile name** on My Products for directory copy. The two surfaces stay separate; the shared name keeps the brand aligned in your workspace.

### API (directory)

Directory launch uses product and directory APIs, not <Badge text="GET /public/integrations/groups" variant="path" />. See <a href="/docs/apis-directory-launch">Directory launch API</a> (including <a href="/docs/apis-directory-launch/business-profiles">business profiles</a> for directory).

---

## Related

<CardGrid>
<LinkCard title="Connect a channel" description="Add social accounts — OAuth, API keys, and invite links" href="/docs/channels/connect" />
<LinkCard title="Manage social and directory channels" description="Social actions on My Dashboard and directory launches on My Products" href="/docs/channels/manage" />
<LinkCard title="Directory submission" description="Launch workflow from My Products" href="/docs/directory-submission" />
<LinkCard title="Profile variants" description="Per-directory copy before you launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Posting time slots" description="Usual posting hours per social channel" href="/docs/channels/time-slots" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/posts-management/approvals" />
<LinkCard title="Glossary" description="Business profiles, directory launch, and calendar vs kanban" href="/docs/getting-started/glossary" />
</CardGrid>
