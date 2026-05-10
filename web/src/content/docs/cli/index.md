---
title: Overview - CLI
description: Install the Openquok CLI, authenticate, and call the programmatic scheduling API from your terminal or automation.
order: 0
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Badge text="@openquok/auto-cli" variant="experimental" /> is the programmatic CLI for the Openquok scheduling API — built for automation and AI agents. It wraps the public API so you can schedule posts, manage integrations, and upload media from shell scripts; command output is JSON.

## Explore documentation

<CardGrid>
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and integrations" href="/docs/public-api" />
<LinkCard title="Learn more" description="Install, self-host, backend, workers, CLI auth, and contributor guides" href="/docs/getting-started" />
</CardGrid>

## Installation

<Tabs items={["npm", "pnpm"]}>
<TabItem label="npm">

```bash
npm install -g @openquok/auto-cli
```

</TabItem>
<TabItem label="pnpm">

```bash
pnpm add -g @openquok/auto-cli
```

</TabItem>
</Tabs>

Verify the install:

```bash
openquok --help
```

## Authentication

Use **OAuth2 device flow** (recommended) so you never embed client secrets in the CLI, or set an **API key** for CI and scripts. Full variable reference and self-hosted auth options are on <a href="/docs/cli/authentication">CLI authentication</a>.

**OAuth2 (device flow)** — prints a one-time code, browser approval, then stores credentials (default <code>~/.openquok/credentials.json</code>):

```bash
openquok auth:login
```

**Check or clear stored credentials:**

```bash
openquok auth:status
openquok auth:logout
```

**API key (environment variable)** — see <a href="/docs/cli/authentication#api-key">API key</a> on the authentication page.

<Callout type="note" title="CLI auth server">
<p>Device login talks to an auth helper service (default <Badge text="https://cli-auth.openquok.com" variant="new" />). If you <strong>deploy your own</strong> auth server, configure it under <a href="/docs/configuration-agent">Configuration - Agent</a> and point the CLI at it with <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> or <code>--authServer</code> — see <a href="/docs/cli/authentication#environment-variables">CLI authentication → Environment variables</a>.</p>
</Callout>

## Quick start

**List programmatic integrations:**

```bash
openquok integrations:list
```

**Create a scheduled post** (adjust IDs and timestamps):

```bash
openquok posts:create \
  --scheduledAt "2026-01-01T12:00:00Z" \
  --status scheduled \
  --body "Hello from Openquok" \
  --integrationIds "uuid1,uuid2"
```

**Upload media** (use returned paths/IDs in <code>posts:create</code>):

```bash
openquok upload ./image.png
```

## Commands (overview)

**Auth**

```bash
openquok auth:login
openquok auth:status
openquok auth:logout
```

**Integrations**

```bash
openquok integrations:list
openquok integrations:oauth-url <integration>
openquok integrations:delete <id>
```

**Posts**

```bash
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"
openquok posts:group <postGroupUuid>
openquok posts:update-group <postGroupUuid> --json '{"scheduledAt":"...","status":"draft"}'
openquok posts:delete-group <postGroupUuid>
```


## Guides

<CardGrid>
<LinkCard title="CLI authentication" description="OAuth device flow, API key, OPENQUOK_* variables, and custom auth server URL" href="/docs/cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the CLI auth server (env vars, SERVER_URL, callbacks, Vercel)" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Device flow, endpoints, and Postgres state" href="/docs/configuration-agent/architecture" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Installation" description="Local and production setup across the monorepo" href="/docs/installation" />
<LinkCard title="Development environment" description="Optional local CLI auth server and repo scripts" href="/docs/installation/development-environment" />
<LinkCard title="Configuration - Backend" description="API and OAuth environment variables" href="/docs/configuration-backend" />
</CardGrid>
