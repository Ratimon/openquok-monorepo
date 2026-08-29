---
title: Other skills
description: Sibling agent skills that extend openquok-core  (e.g. research, media generation, posting).
order: 0
lastUpdated: 2026-08-03
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Guides for **sibling skills** that sit beside <Badge text="openquok-core" variant="default" />. Core owns auth, media Rule 2 (<Badge text="upload" variant="param" /> then attach the returned id and path), channel recipes, and <Badge text="posts:create" variant="default" />. Sibling skills add a domain pipeline (research → generate → post) and call the same <Badge text="openquok" variant="default" /> binary.

They **never replace** openquok-core. Install core + the CLI first, then add the sibling skill.

<Callout type="note" title="Copy install for scripts">
<p>Skills that ship a <code>scripts/</code> folder must install with <strong>Copy</strong> (CLI flag <Badge text="--copy" variant="param" />) so helpers land as real files, not agent-dir symlinks only.</p>
</Callout>

<CardGrid>
<LinkCard title="openquok-tiktok-slideshow" description="Research a niche, lock a consistent character, generate portrait slides, overlay text, and draft a TikTok photo carousel via openquok-core" href="/docs/other-skills/openquok-tiktok-slideshow" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to OpenQuok CLI" description="Install openquok-core, the global CLI, and authenticate" href="/docs/getting-started-for-cli" />
<LinkCard title="Agent Setup Guides" description="Wire openquok-core into OpenClaw, Hermes, Grok Bot, ThinkRail, and similar hosts" href="/docs/agent-setup-guides" />
<LinkCard title="CLI Examples — TikTok" description="Photo carousel and privacy settings for posts:create" href="/docs/cli-examples/tiktok" />
<LinkCard title="Warm up a TikTok account" description="Before start TikTok account" href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience" />
<LinkCard title="CLI Usage" description="Command-by-command reference" href="/docs/cli-usages" />
</CardGrid>
