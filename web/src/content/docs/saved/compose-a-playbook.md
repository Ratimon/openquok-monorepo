---
title: Create your own playbook
description: Select building blocks, then finish the stack in Skill Builder and save a playbook draft.
order: 3
lastUpdated: 2026-10-03
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Compose a playbook

> Turn one or more building blocks into a playbook draft — arrange steps in Skill Builder, then save from your account.

A **playbook** tells an agent which blocks to install and how to run them in order. You do not need to write the whole file by hand. OpenQuok helps you stack blocks and preview markdown.

## Selection bar

On **Libs → Browse** or **Libs → Your library**, find the dashed **Compose a playbook from building blocks** bar above the building block grid.

![Select Building Blocks to Create New Playbooks](/docs/_assets/saved/compose-building-blocks.webp)

1. Turn on **Add** on each building block you want in the stack.

<Callout type="note">
<p>Playbook cards are not selectable here.</p>
</Callout>

2. The bar shows how many blocks you picked.
3. Click **Create playbook (n)**.
4. Click **Clear selection** to start over.

## What happens next

OpenQuok saves your picks and opens <a href="/tools/skill-builder">Skill Builder</a> with those blocks pre-loaded. There you can:

![Open Free OpenQuok's skill builder](/docs/_assets/saved/skill-builder.webp)

- Reorder or remove members of the stack
- Add **workflow steps** — CLI commands, prompts, and notes between blocks
- Preview the exported <code>SKILL.md</code> on the right

![Edit skill markdown](/docs/_assets/saved/skill-editor.webp)

Sign in and choose **Save as playbook** to open the playbook editor with the draft filled in.

<Callout type="tip">
<p>Skill Builder includes <strong>OpenQuok Core</strong> by default so scheduling commands stay in the stack. Read the hub page at <a href="https://www.openquok.com/creators/openquok/building-blocks/openquok-core">OpenQuok Core</a> or the skill file on <a href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">GitHub</a> for install and auth steps.</p>
</Callout>

## Start without selecting blocks

On **Your library**, **New playbook** clears any Skill Builder draft and opens <a href="/tools/skill-builder">Skill Builder</a> so you can pick blocks inside the tool instead of the grid.

## Publish the draft

<Steps
	howToName="Save a composed playbook"
	howToDescription="Turn a Skill Builder draft into a hub listing."
>

### Finish in Skill Builder

Arrange steps and confirm the markdown preview looks right.

### Save as playbook

Use **Save as playbook** (sign in if prompted). The playbook editor opens with title, members, and tags ready to edit.

### Submit for review

Save, then enable **Publish** when you want others to install the stack. Community playbooks need admin approval — see <a href="/docs/publish-listings/publish-your-listing#publish-a-playbook">Publish via the UI → Publish a playbook</a>.

</Steps>

## Other ways to discover blocks

| Entry point | What it does |
| --- | --- |
| <a href="/building-blocks">Building Blocks hub</a> | Browse with the public sidebar; multi-select **Create playbook** opens Skill Builder with those slugs |
| <a href="/account/saved">Saved → Libs → Browse</a> | Same sidebar filters and bookmarks as the hub, inside your account |
| <a href="/playbooks">Playbooks hub</a> | See full workflows others published; bookmark them from **Browse** or on hub cards |
| <a href="/agents">Agents hub</a> | Pick a harness, then install OpenQuok Core or blocks from catalog links |

## Related

<CardGrid>
<LinkCard title="Browse and bookmarks" description="Find blocks to add to a stack" href="/docs/saved/explore-and-bookmarks" />
<LinkCard title="Your library" description="Edit, unpublish, and track hub stats" href="/docs/saved/my-library" />
<LinkCard title="Skill Builder" description="Visual composer at /tools/skill-builder" href="/tools/skill-builder" />
<LinkCard title="CLI getting started" description="Install openquok and authenticate" href="/docs/getting-started-for-cli" />
</CardGrid>
