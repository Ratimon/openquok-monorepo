---
title: Overview - CLI Usage
description: Agentic CLI workflows for managing posts, integrations, analytics, and media uploads.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Operational recipes for the <Badge text="openquok" variant="default" /> CLI grouped by command verb. For one-off setup (install, auth) start at <a href="/docs/getting-started-for-cli">Get Started</a>; for end-to-end social platform recipes see <a href="/docs/cli-examples">CLI Examples</a>.

<CardGrid>
<LinkCard title="Managing Posts" description="List, create, find slots, delete, and reconnect missing posts" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Integrations" description="Discover connected channels, settings schemas, and dynamic tools" href="/docs/cli-usages/integrations" />
<LinkCard title="Global Plugs" description="Catalog, list, upsert, activate, and delete channel-level engagement rules" href="/docs/cli-usages/plugs" />
<LinkCard title="Analytics" description="Platform-level and per-post analytics over a 7 / 30 / 90 day window" href="/docs/cli-usages/analytics" />
<LinkCard title="Media Upload" description="Upload local files (`upload`) or mirror a public URL (`upload-from-url`); both return the ids you pass to posts:create" href="/docs/cli-usages/media-upload" />
</CardGrid>

## Conventions used in these pages

- All commands print **machine-readable JSON**, so every example can be piped through <Badge text="jq" variant="default" />.
- Sample IDs in command examples use **kebab-case angle-bracket placeholders** — <Badge text="<integration-id>" variant="param" />, <Badge text="<post-id>" variant="param" />, <Badge text="<post-group-id>" variant="param" />, <Badge text="<media-group-id>" variant="param" />, <Badge text="<customer-group-id>" variant="param" />. Substitute real ids from <Badge text="openquok integrations:list" variant="default" /><Badge text="openquok posts:list" variant="default" />, or the response of <Badge text="openquok upload" variant="default" /> before running. When an example needs two distinct ids of the same kind, the suffix form is used: <Badge text="<integration-id-1>" variant="param" />, <Badge text="<integration-id-2>" variant="param" /> (or descriptive variants like <Badge text="<threads-integration-id-1>" variant="param" />).
- ISO-8601 timestamps with an explicit <Badge text="Z" variant="default" /> (UTC) or offset are required — the backend rejects timezone-less strings.
- Authentication is shared across every command (stored credentials, then <Badge text="OPENQUOK_API_KEY" variant="envBackend" />). Cover this once on <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Related Section(s)

<CardGrid>
<LinkCard title="CLI Examples" description="Platform-specific recipes for Meta Threads and Instagram (Business / Standalone)" href="/docs/cli-examples" />
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and SDK" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic token, and custom auth server URL" href="/docs/getting-started-for-cli/authentication" />
</CardGrid>
