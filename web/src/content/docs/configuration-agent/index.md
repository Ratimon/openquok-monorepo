---
title: Configuration - Agent
description: Deploy and configure the CLI auth server environment variables for production and local development.
order: 0
lastUpdated: 2026-05-10
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **CLI auth server** (<Badge text="agent/server" variant="path" />) implements OAuth2 **device flow** so the Openquok CLI can obtain tokens without embedding OAuth client secrets in the CLI; short-lived state lives in **Postgres**, and token exchange is proxied to the **Openquok API**.


For **local development**, copy the development template to <Badge text="agent/server/.env.development.local" variant="envFile" /> (gitignored). For **production** deploys and Vercel env sync, copy the production template to <Badge text="agent/server/.env.production.local" variant="envFile" /> .

In local development, keep <Badge text="NODE_ENV" variant="envRuntime" /> set to **development** unless you intentionally mimic production. On Vercel, the platform injects configuration at runtime.

```bash
NODE_ENV=development
SERVER_URL=http://localhost:3111
DATABASE_URL=postgresql://openquok:openquok@localhost:5432/openquok_cli_auth
```

<Callout type="warning">
<p><Badge text="SERVER_URL" variant="envBackend" /> must be the <strong>exact</strong> public origin of <strong>your</strong> deployed auth server: correct scheme (<code>http</code> vs <code>https</code>), host, and <strong>no trailing slash</strong>. It is used to build verification links and the OAuth redirect/callback.</p>
<p>The redirect URI you register on the OAuth app must match <strong>that same origin</strong> plus <code>/device/callback</code>. <strong>Openquok’s own production deployment</strong> uses <Badge text="https://cli-auth.openquok.com/device/callback" variant="new" /> — that value is <strong>not</strong> for a fork or self-hosted install unless your service is literally served at that host. For local work use <Badge text="http://localhost:3111/device/callback" variant="default" />. A mismatch produces authorization or redirect errors.</p>
</Callout>

<Callout type="note" title="Who this page is for">
<p><strong>Deployers</strong> configuring this service: set <Badge text="SERVER_URL" variant="envBackend" /> to <strong>your</strong> public origin (for example self-hosted <code>https://auth.yourcompany.com</code>, or local <Badge text="http://localhost:3111" variant="default" />). <Badge text="https://cli-auth.openquok.com" variant="new" /> is only the URL for <strong>Openquok’s hosted production</strong> auth server — do not copy it into your env when you deploy your own instance. <strong>CLI users</strong> — install, <code>openquok auth:login</code>, API keys — see <a href="/docs/cli">CLI</a> and <a href="/docs/cli/authentication">CLI authentication</a>.</p>
</Callout>

Request paths, polling, and the <Badge text="device_requests" variant="default" /> table are explained in <a href="/docs/configuration-agent/architecture">Auth server architecture</a>.

## Environment variables

When running locally, values are loaded from <Badge text="agent/server/.env.development.local" variant="envFile" /> or <Badge text="agent/server/.env.production.local" variant="envFile" /> as described above.

### Required

- <Badge text="DATABASE_URL" variant="envBackend" /> — Postgres connection string. The server auto-creates the <code>device_requests</code> table on startup.
- <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> — OAuth app client ID (prefix <code>oqc_...</code>).
- <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" /> — OAuth app secret (prefix <code>oqs_...</code>).

### SERVER_URL (prod vs local)

- <Badge text="SERVER_URL" variant="envBackend" /> — Public origin of **this** service **with no trailing slash**. Used for verification links and OAuth <Badge text="redirect_uri" variant="default" />.

Set it based on where the auth server is running:

- **Openquok production (reference deployment)** — example only; use this shape only if you operate the service at this exact host:
  - <Badge text="SERVER_URL=https://cli-auth.openquok.com" variant="new" />
  - Register this callback URL on the OAuth app for that deployment:

```text
https://cli-auth.openquok.com/device/callback
```

<Callout type="warning" title="Forks and self-hosted deploys">
<p>If you fork the repo or deploy your own auth server, set <Badge text="SERVER_URL" variant="envBackend" /> and the OAuth callback to <strong>your</strong> domain (for example <code>https://cli-auth.your-org.vercel.app</code>), not OpenQuok’s production host unless you intentionally proxy or reuse it.</p>
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
- <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> — Web app hosting the OAuth approval UI.
- <Badge text="OPENQUOK_API_URL" variant="envBackend" /> — API base URL; token exchange uses <code>/api/v1/oauth/token</code>.
- <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" /> — Frontend path for the approve UI (default <code>/oauth/authorize</code>).

<Callout type="note" title="Local development">
From <Badge text="agent/server" variant="path" />, run <code>pnpm dev</code> and hit <code>http://localhost:3111/health</code> once env vars are set. For local Postgres, run <code>docker compose -f infra/docker-compose.yml up -d postgres</code>.
</Callout>

### OAuth callback URL

Set your OAuth app’s redirect / callback to:

```text
SERVER_URL/device/callback
```

Self-hosters substitute their real <Badge text="SERVER_URL" variant="envBackend" /> (for example <code>https://auth.example.com/device/callback</code>).

## Common setup steps

<Steps>

### Start with the example env file

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.development.example"><Badge text="agent/server/.env.development.example" variant="envFile" /></DocsExternalLink> to <Badge text="agent/server/.env.development.local" variant="envFile" /> for local work, or <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.production.example"><Badge text="agent/server/.env.production.example" variant="envFile" /></DocsExternalLink> to <Badge text="agent/server/.env.production.local" variant="envFile" /> for production / Vercel sync. Set <Badge text="DATABASE_URL" variant="envBackend" />, OAuth client ID and secret, and <Badge text="SERVER_URL" variant="envBackend" /> to <strong>your</strong> deployment (if you fork or self-host, do not leave upstream Openquok production URLs unless that is literally your service). Restart the server after changes. Full reference: <a href="#environment-variables">Environment variables</a>.

### Register the OAuth callback

In your OAuth app, set the callback URL to:

```text
SERVER_URL/device/callback
```

Use your real public origin for <code>SERVER_URL</code> (no trailing slash). Openquok’s production deployment registers <Badge text="https://cli-auth.openquok.com/device/callback" variant="new" />; a self-hosted example is <code>https://your-auth-host.example.com/device/callback</code>.

### Deploy (Vercel)

Use a **separate** Vercel project with **Root Directory** <Badge text="agent/server" variant="path" />, sync secrets, then deploy from the repo root — see <a href="/docs/installation/vercel#cli-auth-server-on-vercel">Installation → Vercel → CLI auth server on Vercel</a>.

</Steps>

<p>To run the CLI **before** <Badge text="@openquok/auto-cli" variant="experimental" /> is installed from npm (<code>pnpm --filter ./agent build</code>, <code>node agent/dist/index.js …</code>), see <a href="/docs/installation/development-environment#running-the-cli-from-the-monorepo-unpublished">Development environment → Running the CLI from the monorepo (unpublished)</a>.</p>

## Guides

<CardGrid>
<LinkCard title="CLI" description="Install the Openquok CLI, quick start, and command overview" href="/docs/cli" />
<LinkCard title="CLI authentication" description="OPENQUOK_AUTH_SERVER, device login, and API keys for CLI users" href="/docs/cli/authentication" />
<LinkCard title="Auth server architecture" description="Request flow, endpoints, and Postgres state for device flow" href="/docs/configuration-agent/architecture" />
<LinkCard title="Neon Postgres" description="Create a Neon project and set DATABASE_URL for agent/server" href="/docs/configuration-agent/neon" />
<LinkCard title="Admin: OAuth apps" description="Create/rotate client ID & secret; redirect URL for hosted vs self-hosted" href="/docs/admin/oauth-server" />
<LinkCard title="Vercel deployment" description="Separate project, env sync, deploy scripts, and callback URL" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
<LinkCard title="Scaling & Postgres" description="Multi-instance auth server, pooled DB, and serverless notes" href="/docs/configuration-agent/scaling" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI authentication" description="How CLI users point at a custom auth server" href="/docs/cli/authentication" />
<LinkCard title="Production deployment" description="Secrets, Vercel projects for backend and web, optional workers" href="/docs/installation/production-deployment" />
<LinkCard title="Vercel" description="Root directory, CLI deploy scripts, and linking" href="/docs/installation/vercel" />
<LinkCard title="Configuration - Backend" description="API and OAuth environment variables" href="/docs/configuration-backend" />
</CardGrid>
