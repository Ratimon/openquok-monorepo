---
title: Overview - CLI Examples
description: Real world end-to-end examples for the Openquok CLI, organized by platform-specific social network.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Copy-pasteable recipes for the `openquok` CLI grouped by social network. Each page chains <a href="/docs/cli-usages/integrations"><Badge text="integrations:list" variant="default" /></a>, <a href="/docs/cli-usages/media-upload"><Badge text="upload" variant="default" /></a>, and <a href="/docs/cli-usages/managing-posts"><Badge text="posts:create" variant="default" /></a> into the kind of scripts AI agents and CI jobs actually run.

<Callout type="note" title="Only platforms the project supports">
<p>Openquok currently ships first-party providers for <strong>Meta Threads</strong> and <strong>Instagram</strong> (Business and Standalone). The examples here are limited to those — once new providers (TikTok, YouTube, LinkedIn, …) land in <Badge text="backend/integrations/providers/" variant="path" />, additional pages will be added.</p>
</Callout>

<CardGrid>
<LinkCard title="Meta Threads" description="Text and media posts, timed follow-up replies, what to do when publish metadata is incomplete, and analytics" href="/docs/cli-examples/threads" />
<LinkCard title="Instagram" description="Feed, reels, stories, and carousels for Business or Standalone accounts" href="/docs/cli-examples/instagram" />
</CardGrid>

## Conventions used in these pages

- Where examples show <Badge text="$THREADS_ID" variant="default" /> or <Badge text="$INSTAGRAM_ID" variant="default" />, populate them with an integration UUID from <code>openquok integrations:list</code>:

```bash
THREADS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
INSTAGRAM_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier | startswith("instagram")) | .id')
```

- The `--providerSettingsByIntegrationId` payloads shown match the JSON shapes the backend's provider modules expect today. If a key is missing or renamed, fetch the canonical schema with <a href="/docs/cli-usages/integrations"><Badge text="integrations:settings" variant="default" /></a> before scripting a batch.
- All examples assume you're already authenticated — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a> for OAuth device flow or API key setup.

## Related Section(s)

<CardGrid>
<LinkCard title="CLI Usage" description="Command-by-command reference for every `openquok` verb" href="/docs/cli-usages" />
<LinkCard title="Social integrations" description="One-time OAuth setup for each provider before the CLI can reach it" href="/docs/social-integration" />
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and SDK" href="/docs/getting-started-for-public-api" />
</CardGrid>
