---
title: Configuration - Agent
description: CLI auth server — OAuth helper for openquok CLI based login, environment variables configure, and  deployment.
order: 0
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **CLI auth server** implements OAuth2 **device flow** so users can run:

```bash
openquok auth:login
```

without embedding OAuth client secrets in the CLI. The server stores short-lived state in **Postgres** and proxies token exchange to the **Openquok API**.


## Which auth server does the CLI use?

By default, `openquok auth:login` uses the hosted device-flow server:

- <Badge text="https://cli-auth.openquok.com" variant="new" />

You can point the CLI at your own auth server in two ways:

- **Environment variable**: set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> to your base URL (no trailing slash)
- **Per-invocation flag**: pass <code>--authServer</code> to <code>openquok auth:login</code>

```bash
# Option A: override globally for your shell / CI
export OPENQUOK_AUTH_SERVER="https://auth.example.com"
openquok auth:login

# Option B: override for a single login attempt
openquok auth:login --authServer "https://auth.example.com"
```

## Environment variables

The CLI auth server reads configuration from the environment (and from <Badge text="agent/server/.env.production.local" variant="envFile" /> when you sync to Vercel).

Checked-in template:

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.production.example"><Badge text="agent/server/.env.production.example" variant="envFile" /></DocsExternalLink>

### Required

- <Badge text="DATABASE_URL" variant="envBackend" /> — Postgres connection string. The server auto-creates the <code>device_requests</code> table on startup.
- <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> — OAuth app client ID (prefix <code>oqc_...</code>).
- <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" /> — OAuth app secret (prefix <code>oqs_...</code>).

### SERVER_URL (production vs local)

- <Badge text="SERVER_URL" variant="envBackend" /> — Public origin of **this** service **with no trailing slash**. Used for verification links and OAuth <Badge text="redirect_uri" variant="default" />.

Set it based on where the auth server is running:

- **Production** (hosted service):
  - <Badge text="SERVER_URL=https://cli-auth.openquok.com" variant="new" />
  - Register this callback URL on the OAuth app:

```text
https://cli-auth.openquok.com/device/callback
```

<Callout type="warning" title="You can self-host the auth server">
<p>You are not required to use Openquok’s hosted <Badge text="https://cli-auth.openquok.com" variant="new" />. You can deploy your own CLI auth server (including on Vercel) and register your own callback URL instead.</p>
<p class="mt-2">See <a href="/docs/installation/vercel#cli-auth-server-on-vercel">Installation → Vercel → CLI auth server on Vercel</a>.</p>
</Callout>

- **Local development** (default port):
  - <Badge text="SERVER_URL=http://localhost:3111" variant="default" />
  - Register this callback URL on the OAuth app:

```text
http://localhost:3111/device/callback
```

### Optional

- <Badge text="PORT" variant="envBackend" /> — Local listen port (default <code>3111</code>). Less relevant on Vercel; useful for <code>pnpm dev</code>.
- <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> — Web app hosting the OAuth approval UI (default matches hosted Openquok).
- <Badge text="OPENQUOK_API_URL" variant="envBackend" /> — API base URL; token exchange uses <code>/api/v1/oauth/token</code>.
- <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" /> — Frontend path for the approve UX (default <code>/oauth/authorize</code>).

<Callout type="note" title="Local development">
From <Badge text="agent/server" variant="path" />, run <code>pnpm dev</code> and hit <code>http://localhost:3111/health</code> once env vars are set. For local Postgres, run <code>docker compose -f infra/docker-compose.yml up -d postgres</code>. See <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/SERVER.md"><Badge text="SERVER.md" variant="path" /></DocsExternalLink> for the full local flow.
</Callout>

### OAuth callback URL

Set your OAuth app’s redirect / callback to:

```text
SERVER_URL/device/callback
```

Self-hosters substitute their real <Badge text="SERVER_URL" variant="envBackend" /> (for example <code>https://auth.example.com/device/callback</code>).

## Common setup steps

<Steps>

### Register the OAuth callback

In your new app, set the callback URL to:

```text
SERVER_URL/device/callback
```

Use your real public origin for <code>SERVER_URL</code> (no trailing slash), for example <Badge text="https://cli-auth.openquok.com/device/callback" variant="new" />.

### Configure environment variables

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.production.example"><Badge text="agent/server/.env.production.example" variant="envFile" /></DocsExternalLink> to <Badge text="agent/server/.env.production.local" variant="envFile" />, set <Badge text="DATABASE_URL" variant="envBackend" />, OAuth client ID/secret, and <Badge text="SERVER_URL" variant="envBackend" />. See <a href="#environment-variables">Environment variables</a>.

### Deploy (Vercel)

Use a **separate** Vercel project with **Root Directory** <Badge text="agent/server" variant="path" />, sync secrets, then deploy from the repo root — see <a href="/docs/installation/vercel#cli-auth-server-on-vercel">Installation → Vercel → CLI auth server on Vercel</a>.

</Steps>

## Guides

<CardGrid>
<LinkCard title="Environment variables" description="DATABASE_URL, SERVER_URL, OAuth client keys, and optional API URLs" href="/docs/configuration-agent#environment-variables" />
<LinkCard title="Auth server architecture" description="Request flow, endpoints, and Postgres state for device flow" href="/docs/configuration-agent/architecture" />
<LinkCard title="Admin: OAuth apps" description="Create/rotate client ID & secret; redirect URL for hosted vs self-hosted" href="/docs/admin/oauth-server" />
<LinkCard title="Vercel deployment" description="Separate project, env sync, deploy scripts, and callback URL" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
<LinkCard title="Scaling & Postgres" description="Multi-instance auth server, pooled DB, and serverless notes" href="/docs/configuration-agent/scaling" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Production deployment" description="Secrets, Vercel projects for backend and web, optional workers" href="/docs/installation/production-deployment" />
<LinkCard title="Vercel" description="Root directory, CLI deploy scripts, and linking" href="/docs/installation/vercel" />
<LinkCard title="Configuration - Backend" description="API and OAuth environment variables" href="/docs/configuration-backend" />
</CardGrid>
