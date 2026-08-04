---
title: openquok-tiktok-slideshow
description: Lightweight creator pipeline — research any channel, lock a character profile plus reference images, generate portrait slides, overlay text, and post via openquok-core.
order: 1
lastUpdated: 2026-08-03
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Badge text="openquok-tiktok-slideshow" variant="default" /> is a sibling skill for any niche or channel persona — not an App Store product funnel. The loop is:

**Research channel → lock character → generate frames → text overlay → post via openquok.**

It requires <Badge text="openquok-core" variant="default" /> and the global <Badge text="openquok" variant="default" /> CLI. Uploads and create go through core recipes (media Rule 2, TikTok photo carousel, preferred private draft).

| Property | Value |
| --- | --- |
| Skill name | <Badge text="openquok-tiktok-slideshow" variant="default" /> |
| Requires | openquok-core, Node 18+, <Badge text="canvas" variant="experimental" /> (overlays), image provider key |
| Source | <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-tiktok-slideshow/SKILL.md"><Badge text="agent/skills/openquok-tiktok-slideshow/" variant="path" /></DocsExternalLink> |
| Playbook | <DocsExternalLink href="https://www.openquok.com/creators/openquok/playbooks/viral-tiktok-carousel">Viral TikTok Carousel</DocsExternalLink> |

<Callout type="warning" title="Does not replace openquok-core">
<p>Install and authenticate <strong>openquok-core</strong> first. This skill only adds pipeline scripts; it does not ship the CLI or channel recipes.</p>
</Callout>

## Install (Copy required)

Scripts must land as **real files**:

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-tiktok-slideshow --copy -y
```

Interactive installs: Project scope + **Copy**. Hermes: copy the **full** skill folder (a URL install of <code>SKILL.md</code> alone omits <code>scripts/</code> and <code>references/</code>).

## Prerequisites

| Need | Notes |
| --- | --- |
| **openquok-core** + global CLI | Auth, <Badge text="upload" variant="param" />, <Badge text="posts:create" variant="default" /> — see <a href="/docs/getting-started-for-cli">CLI getting started</a> |
| **Node.js 18+** | All scripts under <code>scripts/</code> |
| **canvas** | Native deps for <Badge text="add-text-overlay.js" variant="path" /> — see below |
| **Image provider** | Prefer OpenAI <Badge text="gpt-image-1.5" variant="default" /> (not <Badge text="gpt-image-1" variant="deprecated" />); or Stability / Replicate / local images |
| **TikTok (or other) integration** | Connected in the workspace; UUID from <Badge text="openquok integrations:list" variant="default" /> |
| **New or cold TikTok account** | Warm up <strong>7–14 days</strong> before heavy posting — <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">warm-up guide</a> |

```bash
openquok --version
openquok auth:status
```

### Install canvas (overlays)

From the skill install directory (or any Node project that can <code>require('canvas')</code> for the overlay script):

```bash
npm install canvas
```

<Badge text="canvas" variant="experimental" /> needs platform-native libraries. Follow the upstream install guide for your OS: <DocsExternalLink href="https://github.com/Automattic/node-canvas#compiling">node-canvas compiling</DocsExternalLink>.

## Pipeline

<Callout type="note" title="Account warmup (new or cold accounts)">
<p>If the TikTok account is new or barely used, follow <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">How to warm up a TikTok account to reach a US audience</a> for <strong>7–14 days</strong> before you schedule AI slideshows or scale posting. Established accounts can skip straight to channel intent.</p>
</Callout>

<Steps>

### Account warmup (optional)

New or cold accounts: use the <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">warm-up guide</a> (device region, VPN consistency, normal browsing, first posts) before the generate → post pipeline below.

### Channel intent

Define niche, audience pain, handle ideas, and platforms (TikTok and/or others). This is a **creator/channel** workspace — not an App Store or mobile-app profile.

### Research any channel

Find peer accounts in the niche: hooks, formats, sounds, gaps. Save with <Badge text="scripts/competitor-research.js" variant="path" /> → <code>channel-research.json</code>. Guide in the skill: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-tiktok-slideshow/references/competitor-research.md"><Badge text="references/competitor-research.md" variant="path" /></DocsExternalLink>.

### Lock character

Fill <code>character-profile.json</code> from the neutral template (<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-tiktok-slideshow/references/character-profile.template.json"><Badge text="character-profile.template.json" variant="path" /></DocsExternalLink>):

- <strong>LOCKED</strong> — identity, face (including distinctive marks), body, signature accessory, conflict rule — immutable after approval
- <strong>VARIATIONS</strong> — outfit, pose, expression, setting, visual style, framing — safe to change per post

Generate and save <strong>face_lock</strong> / <strong>body_lock</strong> under <code>refs/</code>. Never change locks after approval. Details: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-tiktok-slideshow/references/character-lock.md"><Badge text="references/character-lock.md" variant="path" /></DocsExternalLink>. Six-slide formula: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-tiktok-slideshow/references/slide-structure.md"><Badge text="references/slide-structure.md" variant="path" /></DocsExternalLink>.

### OpenQuok channel

1. Confirm auth (<Badge text="openquok auth:status" variant="default" />)
2. <Badge text="openquok integrations:list" variant="default" /> → store UUID(s) on <code>openquok.integrationId</code>
3. Prefer a **private draft**: <Badge text="privacyLevel" variant="param" /> <code>SELF_ONLY</code>, <Badge text="contentPostingMethod" variant="param" /> <code>DIRECT_POST</code> so a human can add trending audio before going public — same pattern as <a href="/docs/cli-examples/tiktok">TikTok CLI examples</a>

### Scaffold + run scripts

```bash
node scripts/onboarding.js --init --dir tiktok-marketing/
node scripts/onboarding.js --validate --config tiktok-marketing/config.json
```

Then generate → overlay → post (below). Iterate a test set of six frames until the look is locked — do not post until you are happy.

</Steps>

## Config shape

Workspace data lives **outside** the skill folder (for example <code>tiktok-marketing/</code>):

```json
{
  "channel": {
    "name": "",
    "handle": "",
    "niche": "",
    "audience": "",
    "painPoint": "",
    "platforms": ["tiktok"]
  },
  "character": {
    "profilePath": "tiktok-marketing/character-profile.json",
    "referenceImages": {
      "faceLock": "tiktok-marketing/refs/face-lock.png",
      "bodyLock": "tiktok-marketing/refs/body-lock.png"
    }
  },
  "imageGen": {
    "provider": "openai",
    "apiKey": "",
    "model": "gpt-image-1.5"
  },
  "openquok": {
    "integrationId": "",
    "status": "scheduled",
    "privacyLevel": "SELF_ONLY",
    "contentPostingMethod": "DIRECT_POST",
    "scheduledAt": null,
    "title": ""
  },
  "posting": { "schedule": ["07:30", "16:30", "21:00"] },
  "research": "tiktok-marketing/channel-research.json",
  "strategy": "tiktok-marketing/strategy.json"
}
```

## Core scripts

### Generate slideshow images

```bash
node scripts/generate-slides.js \
  --config tiktok-marketing/config.json \
  --output tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --prompts prompts.json
```

When <code>character.profilePath</code> is set, the script prepends the **LOCKED** block and merges **VARIATIONS**. OpenAI attaches face/body lock images when those files exist. Portrait <code>1024x1536</code>; set exec timeout ≥ **600s** for six <Badge text="gpt-image-1.5" variant="default" /> images.

### Add text overlays

```bash
node scripts/add-text-overlay.js \
  --input tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --texts texts.json
```

Requires <Badge text="canvas" variant="experimental" />. Six-slide formula: Hook → Problem → Discovery → Transform ×2 → CTA. No emoji in overlay text.

### Post via openquok

```bash
node scripts/post-via-openquok.js \
  --config tiktok-marketing/config.json \
  --dir tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --caption "…" \
  --title "Short title"
```

Under the hood: <Badge text="openquok upload" variant="default" /> each slide → <Badge text="openquok posts:create --json" variant="default" /> TikTok photo carousel. Default privacy is <code>SELF_ONLY</code>.

Optional analytics after publish (via core, not this skill):

```bash
openquok analytics:platform <integration-uuid> --days 7
```

## Quick reference

| Script | Purpose |
| --- | --- |
| <Badge text="scripts/onboarding.js" variant="path" /> | <Badge text="--init" variant="param" /> / <Badge text="--validate" variant="param" /> workspace |
| <Badge text="scripts/competitor-research.js" variant="path" /> | Channel research JSON helpers |
| <Badge text="scripts/generate-slides.js" variant="path" /> | Six portrait frames from locked profile |
| <Badge text="scripts/add-text-overlay.js" variant="path" /> | Canvas text overlays |
| <Badge text="scripts/post-via-openquok.js" variant="path" /> | Upload + TikTok carousel create |

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Landscape 1536×1024 | Portrait **1024×1536** |
| Symlink skill install | Reinstall with <Badge text="--copy" variant="param" /> |
| Raw local paths in <Badge text="posts:create" variant="default" /> | Always <Badge text="openquok upload" variant="default" /> first (core Rule 2) |
| Public direct post with no sound | Prefer <code>SELF_ONLY</code> draft → add trending audio in-app |
| <Badge text="gpt-image-1" variant="deprecated" /> | Switch to <Badge text="gpt-image-1.5" variant="default" /> |
| Skipping warmup on a new account | Warm <strong>7–14 days</strong> first — <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">warm-up guide</a> |
| Changing face/body after lock | Keep LOCKED + ref images fixed; only edit VARIATIONS |

## Related

<CardGrid>
<LinkCard title="Other skills overview" description="How sibling skills relate to openquok-core" href="/docs/other-skills" />
<LinkCard title="Introduction to Openquok CLI" description="Install openquok-core and authenticate" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI Examples — TikTok" description="Photo carousel, privacy, and DIRECT_POST recipes" href="/docs/cli-examples/tiktok" />
<LinkCard title="TikTok setup" description="OAuth, scopes, and media domain verification" href="/docs/social-integration/tiktok" />
<LinkCard title="Media Upload" description="upload and upload-from-url before posts:create" href="/docs/cli-usages/media-upload" />
<LinkCard title="Agent Setup Guides" description="Install openquok-core on OpenClaw or Hermes" href="/docs/agent-setup-guides" />
<LinkCard title="Warm up a TikTok account" description="VPN, device setup, and posting cadence before you scale" href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience" />
</CardGrid>
