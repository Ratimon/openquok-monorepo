---
title: Overview - CLI Examples
description: Real world end-to-end examples for the OpenQuok CLI, organized by platform-specific social network.
order: 0
lastUpdated: 2026-08-20
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Copy-pasteable recipes for the `openquok` CLI grouped by social network. Each page chains <a href="/docs/cli-usages/integrations"><Badge text="integrations:list" variant="default" /></a>, <a href="/docs/cli-usages/media-upload"><Badge text="upload" variant="default" /></a>, and <a href="/docs/cli-usages/managing-posts"><Badge text="posts:create" variant="default" /></a> into the kind of scripts AI agents and CI jobs actually run.

<Callout type="note">
<p>OpenQuok ships first-party providers for <strong>Meta Threads</strong>, <strong>Facebook Page</strong>, <strong>Instagram</strong> (Business and Standalone), <strong>YouTube</strong>, <strong>TikTok</strong>, <strong>X</strong>, and <strong>Dev.to</strong>. Additional pages appear here when new providers land in <Badge text="backend/integrations/providers/" variant="path" />.</p>
</Callout>

<CardGrid>
<LinkCard title="Facebook Page" description="Text, photos, links, and follow-up comments for Facebook Pages" href="/docs/cli-examples/facebook" />
<LinkCard title="Instagram" description="Feed, reels, stories, and carousels for Business or Standalone accounts" href="/docs/cli-examples/instagram" />
<LinkCard title="Meta Threads" description="Text and media posts, timed follow-up replies, what to do when publish metadata is incomplete, and analytics" href="/docs/cli-examples/threads" />
<LinkCard title="YouTube" description="MP4 uploads with title, privacy, tags, thumbnail, and analytics" href="/docs/cli-examples/youtube" />
<LinkCard title="TikTok" description="Videos and photo carousels with privacy and settings" href="/docs/cli-examples/tiktok" />
<LinkCard title="X" description="Tweets, media, thread replies, finisher, and analytics" href="/docs/cli-examples/x" />
<LinkCard title="Dev.to" description="Markdown articles with title, tags, canonical URL, and organization" href="/docs/cli-examples/devto" />
</CardGrid>

## Conventions used in these pages

- Where examples show <Badge text="$THREADS_ID" variant="param" />, <Badge text="$INSTAGRAM_ID" variant="param" />, <Badge text="$YT_ID" variant="param" />, or <Badge text="$DEVTO_ID" variant="param" />, populate them with an integration UUID from <Badge text="openquok integrations:list" variant="default" />

```bash
THREADS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
INSTAGRAM_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier | startswith("instagram")) | .id')
YT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="youtube") | .id')
DEVTO_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="devto") | .id')
```

- The `--providerSettingsByIntegrationId` payloads shown match the JSON shapes the backend's provider modules expect today. If a key is missing or renamed, fetch the canonical schema with <a href="/docs/cli-usages/integrations"><Badge text="integrations:settings" variant="default" /></a> before scripting a batch.
- All examples assume you're already authenticated — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a> for OAuth device flow or programmatic token setup.

## Related Section(s)

<CardGrid>
<LinkCard title="CLI Usage" description="Command-by-command reference for every `openquok` verb" href="/docs/cli-usages" />
<LinkCard title="Other skills" description="Sibling pipelines such as openquok-tiktok-slideshow" href="/docs/other-skills" />
<LinkCard title="Social integrations" description="One-time connect setup (OAuth or API key) before the CLI can reach a channel" href="/docs/social-integration" />
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and SDK" href="/docs/getting-started-for-public-api" />
</CardGrid>
