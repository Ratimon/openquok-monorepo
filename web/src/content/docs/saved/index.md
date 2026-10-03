---
title: Overview - Saved Playbooks & Backlinks
description: Bookmark, manage your playbooks and building blocks, and keep backlinks as shortlist.
order: 0
lastUpdated: 2026-10-03
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Saved Playbooks & Backlinks

> Bookmark catalog listings, manage your playbooks and building blocks, and keep a backlink shortlist for outreach.

Open <Badge text="Saved" variant="default" /> in the account sidebar at <Badge text="/account/saved" variant="path" />. The page has two tabs:

| Tab | What you do |
| --- | --- |
| **Libs**  | Browse the public catalog or open **Your library** for drafts, published skill (<Badge text="SKILLS" variant="default" /> and <Badge text="MCP" variant="default" />) |
| **Backlinks** | Review, reorder, and mark  done on sites's backlink opportunities you bookmarked on the Build Backlinks hub |

![Account -> Saved - > Choose Tab](/docs/_assets/saved/overview-tabs.webp)


<Callout type="note">
<p><strong>Building block</strong> = one installable skill markdown or MCP entry. <strong>Playbook</strong> = a curated stack of building blocks with a shared workflow. Full definitions are in the <a href="/docs/getting-started/glossary#building-block">Glossary</a> and <a href="/docs/publish-listings/listing-types">Listing types explained</a>.</p>
</Callout>

## Public hubs vs Saved

Visitors can browse skills and playbooks on <a href="/playbooks">Playbooks</a> and <a href="/building-blocks">Building Blocks</a> pages.

![Public Buildng Block Hub Pages](/docs/_assets/saved/public-buildingblocks-hub.webp)

There are also backlink opportunities on <a href="/build-backlinks">Build Backlinks</a> page.

![Public Backlinks Hub Pages](/docs/_assets/saved/public-backlinks-hub.webp)

**Saved** keeps that work in one place:

- **Libs → Browse** for listing bookmarks and filters
- **Your library** for drafts and your libirary page under <code>/creators/your-username/…</code>
- **Backlinks** for your shortlist (reorder, mark as done, browse the catalog).

![OpenQuok Core on the Building Blocks hub](/docs/_assets/saved/public-openquokcore-page.webp)


<Callout type="note">
<p>The example is our core lib. Let connect <strong>OpenQuok Core</strong> (skill + MCP) to use the CLI and workspace API: <a href="https://www.openquok.com/creators/openquok/building-blocks/openquok-core">hub listing</a>, <a href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">SKILL.md</a>, <a href="/docs/getting-started-for-cli">CLI</a>, and <a href="/docs/getting-started-for-mcp">MCP</a> getting started.</p>
</Callout>


## Before you publish

You need a **public username** before your library can appear under your creator URL. The page shows a banner with **Choose username** when that step is still open. See <a href="/docs/settings/profile">Profile</a> and <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

## In this section

<CardGrid>
<LinkCard title="Browse and bookmarks" description="Libs → Browse: search, filters, and catalog bookmarks" href="/docs/saved/explore-and-bookmarks" />
<LinkCard title="Your library" description="Libs → Your library: stats, editors, unpublish, and delete" href="/docs/saved/my-library" />
<LinkCard title="Backlinks shortlist" description="Reorder and mark outreach done on saved sites" href="/docs/saved/backlinks" />
<LinkCard title="Compose a playbook" description="Select building blocks and open Skill Builder" href="/docs/saved/compose-a-playbook" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Skill Builder" description="Visual workflow steps and SKILL.md preview" href="/tools/skill-builder" />
<LinkCard title="Publish listings" description="Review, approval, and hub visibility" href="/docs/publish-listings" />
<LinkCard title="Tour the app" description="Where Saved lives in the sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Agents hub" description="Connect Cursor, Claude Code, and other harnesses" href="/agents" />
</CardGrid>
