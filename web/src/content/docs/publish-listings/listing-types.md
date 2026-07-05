---
title: Listing types explained
description: Understand building blocks vs playbooks and when to publish Skills, MCP, or both on OpenQuok.
order: 1
lastUpdated: 2026-07-05
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok organizes the catalog in two layers: **what you install** (building blocks) and **how you combine them** (playbooks).

## Building blocks vs playbooks

<h3 id="building-blocks">Building blocks</h3>

A **building block** is a single listing on the <a href="/building-blocks">Building Blocks</a> hub. Think of it as one brick in your agent stack:

- One product name, description, and install instructions
- Tagged by category (for example social publishing, analytics, productivity)
- Filterable as **Skills**, **MCP**, **Both**, or **Official** (first-party OpenQuok entries)

Examples: a standalone MCP server, a skill that teaches an agent how to schedule posts, or **OpenQuok Core** which ships both a skill and MCP tools.

Use a building block when you are publishing **one** installable thing others can add to their setup.

<h3 id="playbooks">Playbooks</h3>

A **playbook** is a **stack** — a curated bundle of building blocks with a shared story (for example “research → draft → schedule → measure”). Playbooks live on the <a href="/playbooks">Playbooks</a> hub.

- Includes multiple building blocks you select from the catalog (or your own drafts)
- Often exported from <a href="/tools/skill-builder">Skill Builder</a> as a workflow + `SKILL.md` preview
- Great for sharing an end-to-end routine instead of a single tool

Use a playbook when you want readers to **install a whole workflow**, not hunt for pieces one by one.

<Callout type="tip" title="Quick mental model">
<p><strong>Building block</strong> = one ingredient. <strong>Playbook</strong> = the recipe that lists which ingredients to use and in what order.</p>
</Callout>

## Skills, MCP, and Both

When you create a **building block**, you choose an **extension type**. This controls what install information appears on the hub card.

### Skills

**Skills** are agent instructions — usually installed with a shell command that copies a `SKILL.md` (or similar) into the user's agent config.

Choose **Skills** when your listing is:

- Documentation and prompts the agent reads at runtime
- CLI-oriented workflows (`openquok posts:create`, etc.)
- Installed with a command like `npx skills add …`

Hub cards show the **skills install command** and a **Skill Setup Doc** link when you provide one.

### MCP

**MCP** (Model Context Protocol) listings expose **tools** an MCP client can call — list integrations, create posts, fetch analytics, and so on.

Choose **MCP** when your listing is:

- An MCP server (HTTP, stdio, or SSE transport)
- Defined by a tools table (tool name + short description) on the hub card
- Installed by adding server config to the user's MCP client

Hub cards show the **MCP tools table** and an **MCP Setup Doc** link. Full JSON config belongs on the detail page, not the card.

### Both

**Both** means the same listing ships **skills and MCP** — for example **OpenQuok Core**, where agents can use either the skill recipes or native MCP tools against the same workspace.

Choose **Both** when:

- Users might connect via MCP *or* install a skill, and you want one catalog entry
- You can fill in separate install commands and setup doc URLs for each tab

<Callout type="note" title="Pick one type honestly">
<p>If you only ship a skill today, choose <strong>Skills</strong>. You can update the listing later if you add MCP. Mislabeling makes the hub card confusing for installers.</p>
</Callout>

## Official vs community listings

| Filter | Meaning |
| --- | --- |
| **Official** | First-party OpenQuok entries (for example OpenQuok Core) |
| **Skills / MCP / Both** | Community building blocks filtered by extension type |

Community building blocks and playbooks go through **review** before they appear on the public catalog (see <a href="/docs/publish-listings/publish-your-listing">Publish via the UI</a>).

## Related

<CardGrid>
<LinkCard title="Publish via the UI" description="Create a building block or playbook from your account" href="/docs/publish-listings/publish-your-listing" />
<LinkCard title="Skill Builder" description="Compose a playbook draft without writing code first" href="/tools/skill-builder" />
</CardGrid>
