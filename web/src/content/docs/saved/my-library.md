---
title: Manage Your library
description: Manage your building blocks and playbooks under Libs → Your library — stats, new listings, edit, unpublish, and delete drafts.
order: 2
lastUpdated: 2026-10-03
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Libs → Your library

> Everything you created lives here — drafts, submissions awaiting approval, and listings live on the hub.

On <a href="/account/saved">Account → Saved</a>, open the **Libs** tab and choose **Your library**.

![Account -> Saved - > Choose Tab](/docs/_assets/saved/overview-tabs.webp)

**Browse** and **Your library** share one **Libs** tab. A segmented control at the top switches between them. **New building block** and **New playbook** appear only on **Your library**.

## Catalog overview

At the top, **Catalog overview** summarizes:

![Your own library (Building Blocks and Playbooks)](/docs/_assets/saved/your-library.webp)

| Stat | Meaning |
| --- | --- |
| **Building blocks** | How many blocks you created and how many are published on the hub |
| **Playbooks** | Same for playbook |
| **Views** | Total views on your published hub libraries |
| **Clicks** | Total clicks on install or setup links on those listings |

## Create a new buidling block or playbook

| Button | Opens |
| --- | --- |
| **New building block** | Building block editor for a single skill or MCP listing |
| **New playbook** | <a href="/tools/skill-builder">Skill Builder</a> with a fresh stack (or the playbook editor when you already have a draft) |

Step-by-step publish and approval rules are in <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

## Your grids

Two sections as:

- **Building blocks** — skills, MCP servers, or **Both** entries you own
- **Playbooks** — stacks that reference one or more building blocks


<Callout type="tip">
<p>Cards show publish status (draft, awaiting approval, or live). Turn on <strong>Add</strong> on building blocks here when you want to bundle them into a new playbook. See <a href="/docs/saved/compose-a-playbook">Compose a playbook</a>.</p>
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
<LinkCard title="Browse and bookmarks" description="Sidebar filters and catalog bookmarks" href="/docs/saved/explore-and-bookmarks" />
<LinkCard title="Compose a playbook" description="Stack blocks and export from Skill Builder" href="/docs/saved/compose-a-playbook" />
<LinkCard title="Listing types explained" description="Skills, MCP, Both, and stacks" href="/docs/publish-listings/listing-types" />
<LinkCard title="Saved overview" description="Libs, Backlinks, and OpenQuok Core links" href="/docs/saved" />
<LinkCard title="Profile and username" description="Creator URL and public identity" href="/docs/settings/profile" />
</CardGrid>
