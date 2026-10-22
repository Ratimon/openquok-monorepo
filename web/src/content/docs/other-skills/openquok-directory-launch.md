---
title: openquok-directory-launch
description: Sibling skill for product profiles, directory variants, listing readiness, and cached directory SEO — openquok directory:* CLI or hosted MCP directory* tools.
order: 2
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Badge text="openquok-directory-launch" variant="default" /> prepares **directory launch** work: product profiles, per-site variants (PeerPush, Uneed, …), listing readiness, and domain-rating analytics. Use the **`openquok directory:*`** CLI or **hosted OpenQuok MCP** <Badge text="directory*" variant="default" /> / <Badge text="directorySeo*" variant="default" /> tools.

It requires <Badge text="openquok-core" variant="default" /> and the global <Badge text="openquok" variant="default" /> CLI. Social scheduling stays on core.

| Property | Value |
| --- | --- |
| Skill name | <Badge text="openquok-directory-launch" variant="default" /> |
| Requires | openquok-core, global <Badge text="openquok" variant="default" />, workspace plan capabilities |
| Source | <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-directory-launch/SKILL.md"><Badge text="agent/skills/openquok-directory-launch/" variant="path" /></DocsExternalLink> |
| CLI reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI usage</a> |

<Callout type="warning" title="Does not replace openquok-core">
<p>Install and authenticate <strong>openquok-core</strong> first. This skill adds directory launch and directory SEO recipes only — not auth, media Rule 2, or <Badge text="posts:create" variant="default" />.</p>
</Callout>

## Install

Install **after** openquok-core from the same agent package root:

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core -y
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-directory-launch -y
```

From ClawHub (after publish):

```bash
clawhub install openquok-directory-launch
```

## MCP alternative

If your client already has **OpenQuok MCP** connected with an <Badge text="opo_" variant="param" /> programmatic token, you can use <Badge text="directoryDestinationsList" variant="default" />, <Badge text="directoryVariantsEnsure" variant="default" />, <Badge text="directoryListingSummary" variant="default" />, and directory SEO tools without installing this skill. See <a href="/docs/mcp-references/tools">MCP tools reference</a>.

## Typical CLI chain

```bash
openquok directory:destinations:list
openquok directory:profiles:list --main-only
openquok directory:variants:ensure <main-profile-id> --site-key peerpush
openquok directory:listings <profile-id>
openquok directory:analytics:overview --profile <profile-id>
```

Use <Badge text="checkedAt" variant="param" /> on cached DR metrics before calling <Badge text="directory:analytics:refresh" variant="default" />.

## Related

<CardGrid>
<LinkCard title="Directory launch CLI usage" description="Full directory:* command matrix and flags" href="/docs/cli-usages/directory-launch" />
<LinkCard title="CLI Examples — PeerPush" description="End-to-end directory launch recipes" href="/docs/cli-examples/peerpush" />
<LinkCard title="CLI Examples — Uneed" description="End-to-end directory launch recipes" href="/docs/cli-examples/uneed" />
<LinkCard title="Introduction to OpenQuok CLI" description="Install openquok-core and authenticate" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP getting started" description="Connect hosted OpenQuok MCP with an opo_ token" href="/docs/getting-started-for-mcp" />
</CardGrid>
