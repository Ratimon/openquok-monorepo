---
title: Overview - CLI
description: Install and automate social media content pipeline using the Openquok CLI from your terminal.
order: 0
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Badge text="@openquok/auto-cli" variant="experimental" /> is the programmatic CLI for the Openquok scheduling API — built for automation and AI agents. It wraps the <a href="/docs/getting-started-for-public-api">public API</a> so you can schedule posts, manage integrations, and upload media from shell scripts.


## Installation

Requires **Node.js 20.19+** (or 22.12+, or 23+). Older versions may install with warnings or fail at runtime.

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

Use **OAuth2 device flow**, so you never embed client secrets in the CLI, or set an **API key** for CI and scripts. Full variable reference and self-hosted auth options are on <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.


### Option 1: OAuth2 (Suggested)

**OAuth2 (device flow)** — this will automatically open a browser with a one-time code and approval screen for you to authorize, then it stores credentials at <Badge text="~/.openquok/credentials.json" variant="path" /> as default:

```bash
openquok auth:login
```

**Check or clear stored credentials:**

```bash
# Check current auth status
openquok auth:status

# Remove the stored credentials
openquok auth:logout
```

### Option 2: API key

Set **API key** as an environment variable. — see <a href="/docs/getting-started-for-cli/authentication#api-key">API key</a> on the authentication page.


```bash
export OPENQUOK_API_KEY="opo_..."
```

<Callout type="tip">
Add the env to <Badge text="~/.bashrc" variant="path" />, <Badge text="~/.zshrc" variant="path" />, etc to Shell profile, so the env variable persists across sessions.
</Callout>

<Callout type="warning">
<Badge text="OPENQUOK_API_KEY" variant="envBackend" /> always takes precedence over stored credentials.
</Callout>

<Callout type="warning">
OAuth2 credentials take priority over the API key.
</Callout>


#### Custom API URL (self-hosted)

If you’re running your own self-hosted openquok backend, point the CLI to your server:

```bash
export OPENQUOK_API_URL="https://api.yourserver.com"
```

<Callout type="note" title="CLI auth server">
<p>Device login talks to an auth helper service (default <Badge text="https://cli-auth.openquok.com" variant="new" />). If you <strong>deploy your own</strong> auth server, configure it under <a href="/docs/configuration-agent">Configuration - Agent</a> and point the CLI at it with <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> or <code>--authServer</code> — see <a href="/docs/getting-started-for-cli/authentication#environment-variables">CLI authentication → Environment variables</a>.</p>
</Callout>

## Quick start

**List your connected social media channels or accounts:**

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

**List your scheudled posts:**

```bash
openquok integrations:list
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
openquok integrations:settings <id>
openquok integrations:trigger <id> <method> [--data '<json>']
```

**Posts**

```bash
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"
openquok posts:group <postGroupUuid>
openquok posts:update-group <postGroupUuid> --json '{"scheduledAt":"...","status":"draft"}'
openquok posts:delete-group <postGroupUuid>
```


## Explore More ?

<CardGrid>
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and integrations" href="/docs/getting-started-for-public-api" />
<LinkCard title="Learn more" description="Want to understand More?" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI authentication" description="OAuth device flow, API key, and custom auth server URL" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the CLI auth server (env vars, SERVER_URL, callbacks, Vercel)" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Device flow, endpoints, and Postgres state" href="/docs/configuration-agent/architecture" />
</CardGrid>
