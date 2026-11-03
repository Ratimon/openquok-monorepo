---
title: Overview - Saved Playbooks
description: Bookmark building blocks and playbooks from public hubs, manage your creator library, and use the Backlinks tab for your outreach shortlist.
order: 0
lastUpdated: 2026-11-03
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Saved Playbooks & Backlinks

> Bookmark catalog listings, manage playbooks and building blocks, and keep an outreach shortlist on the Backlinks tab.

<p>Open <a href="/account/saved">Account → Saved</a> in the account sidebar (<Badge text="/account/saved" variant="path" />).</p>

| Tab | What you do |
| --- | --- |
| **Libs** | Browse the public catalog or open **Your library** for drafts and published skill (<Badge text="SKILLS" variant="default" /> and <Badge text="MCP" variant="default" />) listings |
| **Backlinks** | Manage sites you bookmarked — reorder and mark done on <strong>Backlinks</strong> tab. Docs: <a href="/docs/directory-submission/build-backlinks">Build Backlinks</a>, <a href="/docs/saved/backlinks">Backlinks management</a> |

![Account -> Saved - > Choose Tab](/docs/_assets/saved/overview-tabs.webp)

<Callout type="note">
<p><strong>Building block</strong> = one installable skill markdown or MCP entry. <strong>Playbook</strong> = a curated stack of building blocks with a shared workflow. See the <a href="/docs/getting-started/glossary#building-block">Glossary</a> and <a href="/docs/publish-listings/listing-types">Listing types explained</a>.</p>
</Callout>

## Public hubs vs Saved

Browse **playbooks** and **building blocks** on <a href="/playbooks">Playbooks</a> and <a href="/building-blocks">Building Blocks</a>.

![Public Buildng Block Hub Pages](/docs/_assets/saved/public-buildingblocks-hub.webp)

**Saved → Libs** keeps catalog bookmarks and your creator library in one workspace:

- **Browse** for listing search, filters, and bookmarks
- **Your library** for drafts and your public pages under <code>/creators/your-username/…</code>

![OpenQuok Core on the Building Blocks hub](/docs/_assets/saved/public-openquokcore-page.webp)

<Callout type="note">
<p>Example: connect <strong>OpenQuok Core</strong> (skill + MCP) for CLI and workspace API — <a href="https://www.openquok.com/creators/openquok/building-blocks/openquok-core">hub listing</a>, <a href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">SKILL.md</a>, <a href="/docs/getting-started-for-cli">CLI</a>, and <a href="/docs/getting-started-for-mcp">MCP</a> getting started.</p>
</Callout>

<p>Directory **research** uses the public <a href="/build-backlinks">Build Backlinks</a> page. Manage saved sites on <a href="/account/saved?tab=backlinks">Account → Saved</a> → <strong>Backlinks</strong> tab — see <a href="/docs/directory-submission/build-backlinks">Build Backlinks</a> and <a href="/docs/saved/backlinks">Backlinks management</a>.</p>

## Before you publish

You need a **public username** before your library can appear under your creator URL. The page shows a banner with **Choose username** when that step is still open. See <a href="/docs/settings/profile">Profile</a> and <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

## In this section

<CardGrid>
<LinkCard title="Browse and bookmarks" description="Libs → Browse — search, filters, and catalog bookmarks" href="/docs/saved/explore-and-bookmarks" />
<LinkCard title="Your library" description="Libs → Your library — stats, editors, unpublish, and delete" href="/docs/saved/my-library" />
<LinkCard title="Compose a playbook" description="Select building blocks and open Skill Builder" href="/docs/saved/compose-a-playbook" />
<LinkCard title="Backlinks management" description="Saved tab — reorder and mark outreach done" href="/docs/saved/backlinks" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Build Backlinks" description="Public catalog vs My Products directory launch" href="/docs/directory-submission/build-backlinks" />
<LinkCard title="Directory submission" description="Product profile and extension autofill on My Products" href="/docs/directory-submission" />
<LinkCard title="Skill Builder" description="Visual workflow steps and SKILL.md preview" href="/tools/skill-builder" />
<LinkCard title="Publish listings" description="Review, approval, and hub visibility" href="/docs/publish-listings" />
<LinkCard title="Tour the app" description="Where Saved lives in the sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Agents hub" description="Connect Cursor, Claude Code, and other harnesses" href="/agents" />
</CardGrid>
