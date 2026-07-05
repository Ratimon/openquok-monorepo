---
title: Overview - Publish listings
description: Share building blocks and playbooks on the OpenQuok catalog — what to publish, how listings work, and where to start.
order: 0
lastUpdated: 2026-07-05
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok's public catalog helps people discover **agent skills**, **MCP servers**, and **ready-made playbooks** for social scheduling. You do not need to edit the codebase to contribute — everything happens in the web app.

<Callout type="note" title="Who this is for">
<p>This section is for <strong>creators and workspace owners</strong> who want to share a skill, MCP server, or curated stack with the community. For engineering conventions (code, migrations, docs authoring), see <a href="/docs/developer-guidelines">Developer guidelines</a> and <a href="/docs/documentation-contribution">Documentation contribution</a>.</p>
</Callout>

## What you can publish

| Kind | What it is | Public hub |
| --- | --- | --- |
| **Building block** | One installable skill, MCP server, or both | <a href="/building-blocks">Building Blocks</a> |
| **Playbook** | A curated stack of building blocks for a workflow | <a href="/playbooks">Playbooks</a> |

Published listings appear under your creator profile at <code>/creators/your-username</code> once approved.

## Start here

<CardGrid>
<LinkCard title="Listing types explained" description="Building blocks vs playbooks, and Skills vs MCP vs Both" href="/docs/publish-listings/listing-types" />
<LinkCard title="Publish via the UI" description="Sign in, set a username, and submit from your account or Skill Builder" href="/docs/publish-listings/publish-your-listing" />
</CardGrid>

## Browse the catalog

<CardGrid>
<LinkCard title="Building Blocks hub" description="Search skills and MCP servers to install in your agent" href="/building-blocks" />
<LinkCard title="Playbooks hub" description="Browse curated stacks for common agent workflows" href="/playbooks" />
<LinkCard title="Skill Builder" description="Compose a playbook draft visually and export SKILL.md" href="/tools/skill-builder" />
<LinkCard title="Creators directory" description="See who publishes on OpenQuok" href="/creators" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Agent setup guides" description="Connect OpenQuok skills and MCP to Cursor, Claude Code, and other hosts" href="/docs/agent-setup-guides" />
<LinkCard title="CLI getting started" description="Install openquok-core and authenticate your workspace" href="/docs/getting-started-for-cli" />
</CardGrid>
