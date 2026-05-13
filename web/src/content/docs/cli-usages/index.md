---
title: Overview - CLI Usage
description: Agentic CLI workflows for managing posts, integrations, analytics, notifications, and media uploads.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Operational recipes for the `openquok` CLI grouped by command verb. For one-off setup (install, auth) start at <a href="/docs/getting-started-for-cli">Get Started</a>; for end-to-end social platform recipes see <a href="/docs/cli-examples">CLI Examples</a>.

<CardGrid>
<LinkCard title="Managing Posts" description="List, create, find slots, delete, and reconnect missing posts" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Integrations" description="Discover connected channels, settings schemas, and dynamic tools" href="/docs/cli-usages/integrations" />
<LinkCard title="Analytics" description="Platform-level and per-post analytics over a 7 / 30 / 90 day window" href="/docs/cli-usages/analytics" />
<LinkCard title="Notifications" description="Paginated workspace notification history (100 entries per page)" href="/docs/cli-usages/notifications" />
<LinkCard title="Media Upload" description="Upload local files (`upload`) or mirror a public URL (`upload-from-url`); both return the ids you pass to posts:create" href="/docs/cli-usages/media-upload" />
</CardGrid>

## Conventions used in these pages

- All commands print **machine-readable JSON**, so every example can be piped through <code>jq</code>.
- Where examples show <code>4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b</code> or <code>8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d</code>, substitute a real integration / post UUID from <code>openquok integrations:list</code> or <code>openquok posts:list</code>.
- ISO-8601 timestamps with an explicit <Badge text="Z" variant="default" /> (UTC) or offset are required — the backend rejects timezone-less strings.
- Authentication is shared across every command (stored credentials, then <Badge text="OPENQUOK_API_KEY" variant="envBackend" />). Cover this once on <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Related Section(s)

<CardGrid>
<LinkCard title="CLI Examples" description="Platform-specific recipes for Meta Threads and Instagram (Business / Standalone)" href="/docs/cli-examples" />
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and SDK" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI authentication" description="OAuth device flow, API keys, and custom auth server URL" href="/docs/getting-started-for-cli/authentication" />
</CardGrid>
