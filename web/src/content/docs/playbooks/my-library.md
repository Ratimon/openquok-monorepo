---
title: My Playbooks library
description: Manage your building blocks and playbooks — catalog stats, new listings, edit, unpublish, and delete drafts.
order: 2
lastUpdated: 2026-09-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## My Playbooks tab

> Everything you created lives here — drafts, submissions awaiting approval, and listings live on the hub.

Open <a href="/account/playbooks">Account → Playbooks</a> and switch to **My Playbooks**.

## Catalog overview

At the top, **Catalog overview** summarizes:

![My Playbooks](/docs/_assets/playbooks/my-playbooks.webp)

| Stat | Meaning |
| --- | --- |
| **Building blocks** | How many blocks you created and how many are published on the hub |
| **Playbooks** | Same for playbook stacks |
| **Views** | Total views on your published hub listings |
| **Clicks** | Total clicks on install or setup links on those listings |

Links in that section open the public <a href="/playbooks">Playbooks</a> and <a href="/building-blocks">Building Blocks</a> hubs.

## Create new listings

| Button | Opens |
| --- | --- |
| **New building block** | Building block editor for a single skill or MCP listing |
| **New playbook** | Playbook editor, or <a href="/tools/skill-builder">Skill Builder</a> when you start from a blank stack |

Step-by-step publish and approval rules are in <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

## Your grids

Two sections list your work:

- **Building blocks** — skills, MCP servers, or **Both** entries you own
- **Playbooks** — stacks that reference one or more building blocks

<Callout type="tip">
<p>Cards show publish status (draft, awaiting approval, or live). Select <strong>Add</strong> on building blocks here when you want to bundle them into a new playbook — same bar as on <strong>Explore</strong>. See <a href="/docs/playbooks/compose-a-playbook">Compose a playbook</a>.</p>
</Callout>

## Card menu

Open **⋯** on your listing:

| Action | Applies to |
| --- | --- |
| **Edit** | All your listings — opens the building block or playbook editor |
| **Delete** | **Drafts only** — permanent; you must type <Badge text="YES" variant="default" /> to confirm |
| **Unpublish** | **Published** listings — removes the entry from the public catalog |

<Callout type="note">
<p><strong>Unpublish</strong> keeps your work and stack members. Bookmarks others saved also stay. You can turn <strong>Publish</strong> on again from the editor. <strong>Delete</strong> is only for drafts you no longer need.</p>
</Callout>

## Public username reminder

If you have not chosen a creator username, a blue banner explains that listings publish under <code>/creators/your-username/…</code>. Use **Choose username** or open <a href="/docs/settings/profile">Profile</a> before you expect a public URL.

## After approval

Approved building blocks appear on <a href="/building-blocks">Building Blocks</a>. Approved playbooks appear on <a href="/playbooks">Playbooks</a> and on your row in <a href="/creators">Creators</a>.


<Callout type="warning">
<p>Community submissions need <strong>platform admin approval</strong> before they show on those hubs. Status stays visible on your cards until then.</p>
</Callout>



## Related

<CardGrid>
<LinkCard title="Compose a playbook" description="Stack blocks and export from Skill Builder" href="/docs/playbooks/compose-a-playbook" />
<LinkCard title="Listing types explained" description="Skills, MCP, Both, and stacks" href="/docs/publish-listings/listing-types" />
<LinkCard title="Playbooks overview" description="Explore tab and OpenQuok Core links" href="/docs/playbooks" />
<LinkCard title="Profile and username" description="Creator URL and public identity" href="/docs/settings/profile" />
</CardGrid>
