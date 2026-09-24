---
title: Overview - Playbooks
description: Browse agent building blocks and playbooks, save bookmarks, and manage your own catalog listings from the account Playbooks page.
order: 0
lastUpdated: 2026-09-24
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Playbooks

> Discover skills and MCP servers on the public hub, compose them into playbooks, and publish your own playbook as a listing .

Open <Badge text="Playbooks" variant="default" /> in the account sidebar at <Badge text="/account/playbooks" variant="path" />. The page has two tabs:

| Tab | What you do |
| --- | --- |
| **Explore** | Search the public catalog, filter by category and tags, bookmark favorites, and start a new playbook from selected building blocks |
| **My Playbooks** | See your drafts and published listings, open editors, and track hub views and clicks |

![Account -> OpenQuok Playbook management tab](/docs/_assets/playbooks/overview.webp)


<Callout type="note">
<p><strong>Building block</strong> = one installable skill or MCP entry. <strong>Playbook</strong> = a curated stack of building blocks with a shared workflow. Full definitions are in the <a href="/docs/getting-started/glossary#building-block">Glossary</a> and <a href="/docs/publish-listings/listing-types">Listing types explained</a>.</p>
</Callout>

## Public hubs vs your account

Visitors browse the public catalog at <a href="/playbooks">Playbooks</a> and <a href="/building-blocks">Building Blocks</a>.

![Public Playbooks Hub Pages](/docs/_assets/playbooks/public-hub.webp)

While your account page is where you **save bookmarks**, **compose stacks**, and **edit what you publish** under <code>/creators/your-username/…</code>.

![Public Playbooks Hub Pages](/docs/_assets/playbooks/public-openquokcore-page.webp)


To schedule posts from an agent after you install a block, connect **OpenQuok Core** — the official skill and MCP bundle for the CLI and workspace API:

- Hub listing: <a href="https://www.openquok.com/creators/openquok/building-blocks/openquok-core">OpenQuok Core on the Building Blocks hub</a>
- Skill source: <a href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">openquok-core SKILL.md</a>
- Agent onboarding: <a href="/docs/getting-started-for-cli">CLI getting started</a> and <a href="/docs/getting-started-for-mcp">MCP getting started</a>

## Before you publish

You need a **public username** before a listing can appear under your creator URL. The page shows a banner with **Choose username** when that step is still open. See <a href="/docs/settings/profile">Profile</a> and <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>.

## In this section

<CardGrid>
<LinkCard title="Explore and bookmarks" description="Search, filters, bookmarks, and hub links" href="/docs/playbooks/explore-and-bookmarks" />
<LinkCard title="My Playbooks library" description="Catalog stats, editors, unpublish, and delete" href="/docs/playbooks/my-library" />
<LinkCard title="Compose a playbook" description="Select building blocks and open Skill Builder" href="/docs/playbooks/compose-a-playbook" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Skill Builder" description="Visual workflow steps and SKILL.md preview" href="/tools/skill-builder" />
<LinkCard title="Publish listings" description="Review, approval, and hub visibility" href="/docs/publish-listings" />
<LinkCard title="Tour the app" description="Where Playbooks lives in the sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Agents hub" description="Connect Cursor, Claude Code, and other harnesses" href="/agents" />
</CardGrid>
