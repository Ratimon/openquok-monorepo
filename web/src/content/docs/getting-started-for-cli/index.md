---
title: Introduction to Openquok CLI
description: An CLI-first tool for AI agents. Give your agents the Openquok CLI to schedule posts, manage integrations, and upload media purely from the terminal.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="warning">
<p>For your AI agent to work best with Openquok, install the skill by running:</p>
<pre class="my-3 max-w-full rounded-lg bg-base-200/80 p-3 text-sm"><code>npx skills add Ratimon/openquok-monorepo</code></pre>
<p>Alternatively, install only the CLI skill by path and id (useful once this repository ships more than one skill):</p>
<pre class="my-3 max-w-full rounded-lg bg-base-200/80 p-3 text-sm"><code>npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core</code></pre>
<p>Or open <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/SKILL.md">the skill on GitHub</DocsExternalLink> (<code>agent/SKILL.md</code>).</p>
</Callout>

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
Add the env to <Badge text="~/.bashrc" variant="path" />, or <Badge text="~/.zshrc" variant="path" />, etc to Shell profile, so the env variable persists across sessions.
</Callout>

<Callout type="warning">
Stored OAuth2 credentials take priority over <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> when both are present. Run <code>openquok auth:logout</code> to clear them if you want the env var to be used.
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

<Callout type="note">
All commands output as a JSON, so that it is easier for the CLI to use in scripts and automation pipelines.
</Callout>

**List your connected social media channels or accounts:**

```bash
openquok integrations:list
```

**Create a scheduled post** (adjust IDs and timestamps):

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -c "Hello from Openquok" \
  -i "uuid1,uuid2"
```

**Upload media** (use returned paths/IDs in <code>posts:create</code>):

```bash
openquok upload ./image.png
```

**List your scheduled posts** (defaults to ±30 local calendar days from today when you omit dates):

```bash
openquok posts:list
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
openquok integrations:trigger <id> <method> [-d '<json>']
```

**Posts**

```bash
openquok posts:list
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"
openquok posts:group <postGroupUuid>
openquok posts:update-group <postGroupUuid> --json '{"scheduledAt":"...","status":"draft"}'
openquok posts:delete-group <postGroupUuid>
```


## Explore More ?

<CardGrid>
<LinkCard title="CLI Usage" description="Command-by-command reference" href="/docs/cli-usages" />
<LinkCard title="CLI Examples" description="e.g. Meta Threads and Instagram (Business / Standalone)" href="/docs/cli-examples" />
<LinkCard title="Public API" description="REST endpoints and OAuth used by the CLI and integrations" href="/docs/getting-started-for-public-api" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI authentication" description="OAuth device flow, API key, and custom auth server URL" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the CLI auth server (env vars, SERVER_URL, callbacks, Vercel)" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Device flow, endpoints, and Postgres state" href="/docs/configuration-agent/architecture" />
</CardGrid>
