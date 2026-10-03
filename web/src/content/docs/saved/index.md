---
title: Overview - Saved
description: Bookmark catalog listings, manage your playbooks and building blocks, and keep a build-backlinks shortlist.
order: 0
lastUpdated: 2026-10-03
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Saved

> Discover skills and MCP servers on the public hub, compose them into playbooks, and publish your own playbook as a listing.

Open <Badge text="Saved" variant="default" /> in the account sidebar at <Badge text="/account/saved" variant="path" />. The page has two tabs:

| Tab | What you do |
| --- | --- |
| **Libs** | Browse the public catalog or open **Your library** for drafts, published listings, and catalog stats |
| **Backlinks** | Review, reorder, and mark outreach done on sites you bookmarked on the Build Backlinks hub |

Inside **Libs**, use the **Browse** and **Your library** segments at the top of the tab. **Browse** is the default when you open Saved.

You can bookmark deep links with query parameters:

| Parameter | Values | Effect |
| --- | --- | --- |
| <Badge text="tab" variant="param" /> | <Badge text="libs" variant="default" />, <Badge text="backlinks" variant="default" /> | Top tab (defaults to Libs) |
| <Badge text="libs" variant="param" /> | <Badge text="browse" variant="default" />, <Badge text="library" variant="default" /> | Libs inner segment |
| <Badge text="bookmarked" variant="param" /> | <Badge text="1" variant="default" /> | On Libs → Browse, turn on the bookmarked-only filter |

Example: <Badge text="/account/saved?tab=libs&bookmarked=1" variant="path" /> opens catalog bookmarks on a paid plan.

![Account -> OpenQuok Playbook management tab](/docs/_assets/saved/overview.webp)


<Callout type="note">
<p><strong>Building block</strong> = one installable skill or MCP entry. <strong>Playbook</strong> = a curated stack of building blocks with a shared workflow. Full definitions are in the <a href="/docs/getting-started/glossary#building-block">Glossary</a> and <a href="/docs/publish-listings/listing-types">Listing types explained</a>.</p>
</Callout>

## Public hubs vs your account

Visitors browse the public catalog at <a href="/playbooks">Playbooks</a> and <a href="/building-blocks">Building Blocks</a>.

![Public Playbooks Hub Pages](/docs/_assets/saved/public-hub.webp)

Your account page is where you **save bookmarks**, **compose stacks**, **edit what you publish** under <code>/creators/your-username/…</code>, and **keep a backlink shortlist**.

![Public Playbooks Hub Pages](/docs/_assets/saved/public-openquokcore-page.webp)


To schedule posts from an agent after you install a block, connect **OpenQuok Core** — the official skill and MCP bundle for the CLI and workspace API:

- Hub listing: <a href="https://www.openquok.com/creators/openquok/building-blocks/openquok-core">OpenQuok Core on the Building Blocks hub</a>
- Skill source: <a href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">openquok-core SKILL.md</a>
- Agent onboarding: <a href="/docs/getting-started-for-cli">CLI getting started</a> and <a href="/docs/getting-started-for-mcp">MCP getting started</a>

## Before you publish

You need a **public username** before a listing can appear under your creator URL. The page shows a banner with **Choose username** when that step is still open. See <a href="/docs/settings/profile">Profile</a> and <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

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
