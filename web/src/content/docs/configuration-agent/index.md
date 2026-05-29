---
title: Configuration - Agent
description: Deploy and configure the CLI auth server environment variables for production and local development.
order: 0
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **CLI auth server** (<Badge text="agent/server" variant="path" />) implements OAuth2 **device flow** so the Openquok CLI can obtain tokens without embedding OAuth client secrets in the CLI; short-lived state lives in **Postgres**, and token exchange is proxied to the **Openquok API**.

In **Openquok production**, the flow is split across **two Vercel projects** in the same monorepo:

| Role | Package | Host | Examples |
| --- | --- | --- | --- |
| **API** (CLI polling, token exchange) | <Badge text="agent/server" variant="path" /> | <Badge text="cli-auth.openquok.com" variant="new" /> | <Badge text="POST /device/code" variant="path" />, <Badge text="POST /device/token" variant="path" /> |
| **Browser** (code entry, OAuth callback) | <Badge text="web" variant="path" /> | <Badge text="www.openquok.com" variant="new" /> | <Badge text="GET /cli/device/verify" variant="path" />, <Badge text="GET /cli/device/callback" variant="path" /> |

The auth server sets <Badge text="BROWSER_ORIGIN" variant="envBackend" /> so <Badge text="verification_uri" variant="default" /> and the OAuth <Badge text="redirect_uri" variant="default" /> point at the web app; the web app proxies those steps to the auth server using <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" /> (see <a href="/docs/configuration-web">Configuration - Web</a>).

For **local development**, copy the development template to <Badge text="agent/server/.env.development.local" variant="envBackend" /> (gitignored). For **production** deploys and Vercel env sync, copy the production template to <Badge text="agent/server/.env.production.local" variant="envBackend" />.

In local development, keep <Badge text="NODE_ENV" variant="envBackend" /> set to **development** unless you intentionally mimic production. On Vercel, the platform injects configuration at runtime.

```bash
NODE_ENV=development
SERVER_URL=http://localhost:3111
DATABASE_URL=postgresql://openquok:openquok@localhost:5432/openquok_cli_auth
```

<Callout type="warning">
<p><Badge text="SERVER_URL" variant="envBackend" /> is the <strong>API origin</strong> the CLI calls (<Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> defaults to this in production). Use the correct scheme (<code>http</code> vs <code>https</code>), host, and <strong>no trailing slash</strong>.</p>
<p>The OAuth app <strong>redirect / callback URL</strong> must match where the browser lands after approval — not necessarily the same host as <Badge text="SERVER_URL" variant="envBackend" />:</p>
<ul class="mt-2 list-disc pl-5 space-y-1">
<li><strong>Openquok production</strong> — register <Badge text="https://www.openquok.com/cli/device/callback" variant="new" /> (web app). Set <Badge text="BROWSER_ORIGIN=https://www.openquok.com" variant="envBackend" /> on the auth server and <Badge text="CLI_AUTH_SERVER_URL=https://cli-auth.openquok.com" variant="envBackend" /> on the web app.</li>
<li><strong>Local (auth server only)</strong> — leave <Badge text="BROWSER_ORIGIN" variant="envBackend" /> unset so browser steps stay on <Badge text="http://localhost:3111/device/verify" variant="default" /> and <Badge text="http://localhost:3111/device/callback" variant="default" />.</li>
<li><strong>Self-hosted</strong> — set <Badge text="BROWSER_ORIGIN" variant="envBackend" /> to your web origin and register <Badge text="BROWSER_ORIGIN/cli/device/callback" variant="path" /> on the OAuth app, or use a single host (omit <Badge text="BROWSER_ORIGIN" variant="envBackend" />) and register <Badge text="SERVER_URL/device/callback" variant="path" />.</li>
</ul>
</Callout>

<Callout type="note" title="Who this page is for">
<p><strong>Deployers</strong> configure <Badge text="agent/server" variant="path" /> and (for production) deploy <Badge text="web" variant="path" /> with matching env. <strong>CLI users</strong> — install, <code>openquok auth:login</code>, programmatic tokens — see <a href="/docs/getting-started-for-cli">CLI</a> and <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.</p>
</Callout>

Request paths, polling, and the <Badge text="device_requests" variant="default" /> table are explained in <a href="/docs/configuration-agent/architecture">Auth server architecture</a>.

## Environment variables

When running locally, values are loaded from <Badge text="agent/server/.env.development.local" variant="envBackend" /> or <Badge text="agent/server/.env.production.local" variant="envBackend" /> as described above.

Templates: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.development.example"><Badge text="agent/server/.env.development.example" variant="envBackend" /></DocsExternalLink>, <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.production.example"><Badge text="agent/server/.env.production.example" variant="envBackend" /></DocsExternalLink>.

### Required

- <Badge text="DATABASE_URL" variant="envBackend" /> — Postgres connection string. The server auto-creates the <code>device_requests</code> table on startup.
- <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> — Platform CLI OAuth app client ID (prefix <code>oqc_...</code>). Used only on the auth server; not configured on the Openquok API backend.
- <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" /> — That app’s client secret (prefix <code>oqs_...</code>). Held only by the auth server for token exchange — not end-user credentials.

<Callout type="note">
<p>Each CLI user still gets their own <Badge text="opo_…" variant="default" /> token scoped to the workspace they approve; plan limits apply to that workspace. See <a href="/docs/configuration-agent/architecture#oauth-client-credentials-vs-user-access-tokens">Auth server architecture → OAuth client credentials vs user access tokens</a>.</p>
</Callout>

### SERVER_URL (API origin)

- <Badge text="SERVER_URL" variant="envBackend" /> — Public origin of the **auth server API** (no trailing slash). The CLI uses this as <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" />.

**Openquok production (reference):**

- <Badge text="SERVER_URL=https://cli-auth.openquok.com" variant="new" />

**Local development:**

- <Badge text="SERVER_URL=http://localhost:3111" variant="default" />

### BROWSER_ORIGIN (browser steps)

- <Badge text="BROWSER_ORIGIN" variant="envBackend" /> — Public origin where users open device login in the browser (no trailing slash). When set and different from <Badge text="SERVER_URL" variant="envBackend" />, the auth server returns <Badge text="verification_uri" variant="default" /> under <Badge text="/cli/device/verify" variant="path" /> on this host and uses <Badge text="/cli/device/callback" variant="path" /> for OAuth <Badge text="redirect_uri" variant="default" />.

**Openquok production:**

- <Badge text="BROWSER_ORIGIN=https://www.openquok.com" variant="new" />
- OAuth app callback: <Badge text="https://www.openquok.com/cli/device/callback" variant="new" />
- Deploy <Badge text="web" variant="path" /> with <Badge text="CLI_AUTH_SERVER_URL=https://cli-auth.openquok.com" variant="envBackend" /> — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.production.example"><Badge text="web/.env.production.example" variant="envBackend" /></DocsExternalLink>.

**Local (single host):** omit <Badge text="BROWSER_ORIGIN" variant="envBackend" /> (defaults to <Badge text="SERVER_URL" variant="envBackend" />). Register <Badge text="http://localhost:3111/device/callback" variant="default" /> on the OAuth app.

<Callout type="warning" title="Self-hosted deployment">
<p>If you deploy your own stack, set <Badge text="SERVER_URL" variant="envBackend" />, <Badge text="BROWSER_ORIGIN" variant="envBackend" />, and the OAuth callback to <strong>your</strong> domains — do not copy Openquok production URLs unless those hosts are literally yours.</p>
<p class="mt-2">See <a href="/docs/installation/vercel#cli-auth-server-on-vercel">Installation → Vercel → CLI auth server on Vercel</a>.</p>
</Callout>

### Optional

- <Badge text="PORT" variant="envBackend" /> — Local listen port (default <code>3111</code>). Less relevant on Vercel; useful for <code>pnpm dev</code>.
- <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> — Web app hosting the OAuth approval UI.
- <Badge text="OPENQUOK_API_URL" variant="envBackend" /> — API base URL; token exchange uses <code>/api/v1/oauth/token</code>.
- <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" /> — Frontend path for the approve UI (default <code>/oauth/authorize</code>).

<Callout type="note" title="Local development">
From <Badge text="agent/server" variant="path" />, run <code>pnpm dev</code> and hit <code>http://localhost:3111/health</code> once env vars are set. For local Postgres, run <code>docker compose -f infra/docker-compose.yml up -d postgres</code>.
</Callout>

## Common setup steps

<Steps>

### Start with the example env file

Copy <Badge text="agent/server/.env.development.example" variant="envBackend" /> or <Badge text="agent/server/.env.production.example" variant="envBackend" /> to the matching <Badge text="*.local" variant="envBackend" /> file. Set <Badge text="DATABASE_URL" variant="envBackend" />, OAuth client ID and secret, and <Badge text="SERVER_URL" variant="envBackend" />. For production on Openquok, also set <Badge text="BROWSER_ORIGIN" variant="envBackend" /> and configure <Badge text="web/.env.production.local" variant="envBackend" /> with <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" />. Restart after changes.

### Register the OAuth callback

In your OAuth app, set the callback URL:

- **Openquok production:** <Badge text="https://www.openquok.com/cli/device/callback" variant="new" />
- **Local (auth server only):** <Badge text="http://localhost:3111/device/callback" variant="default" />
- **Self-hosted (split web + API):** <Badge text="BROWSER_ORIGIN/cli/device/callback" variant="path" />
- **Self-hosted (single host):** <Badge text="SERVER_URL/device/callback" variant="path" />

### Deploy

**Auth server** — separate Vercel project, **Root Directory** <Badge text="agent/server" variant="path" />:

```bash
pnpm vercel:env:sync:agent-server:prod
pnpm vercel:deploy:agent-server:prod
```

**Web app** (production browser routes) — deploy the <Badge text="web" variant="path" /> project and sync <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" />:

```bash
pnpm vercel:env:sync:web:prod
pnpm vercel:deploy:web:prod
```

Or both from the repo root:

```bash
pnpm vercel:deploy:cli-device-flow:prod
```

See <a href="/docs/installation/vercel#cli-auth-server-on-vercel">Installation → Vercel → CLI auth server on Vercel</a>.

</Steps>

<p>To run the CLI **before** <Badge text="@openquok/auto-cli" variant="experimental" /> is installed from npm (<code>pnpm --filter ./agent build</code>, <code>node agent/dist/index.js …</code>), see <a href="/docs/installation/development-environment#running-the-cli-from-the-monorepo-unpublished">Development environment → Running the CLI from the monorepo (unpublished)</a>.</p>

## Guides

<CardGrid>
<LinkCard title="CLI" description="Install the Openquok CLI, quick start, and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OPENQUOK_AUTH_SERVER, device login, and programmatic tokens for CLI users" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Auth server architecture" description="Request flow, endpoints, and Postgres state for device flow" href="/docs/configuration-agent/architecture" />
<LinkCard title="Configuration - Web" description="CLI_AUTH_SERVER_URL and web production env" href="/docs/configuration-web" />
<LinkCard title="Neon Postgres" description="Create and configure a Neon database for agent server" href="/docs/configuration-agent/neon" />
<LinkCard title="Admin: OAuth apps" description="Create/rotate client ID & secret; redirect URL for hosted vs self-hosted" href="/docs/admin/oauth-server" />
<LinkCard title="Vercel deployment" description="Separate project, env sync, deploy scripts, and callback URL" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
<LinkCard title="Scaling & Postgres" description="Multi-instance auth server, pooled DB, and serverless notes" href="/docs/configuration-agent/scaling" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI authentication" description="How CLI users point at a custom auth server" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Production deployment" description="Secrets, Vercel projects for backend and web, optional workers" href="/docs/installation/production-deployment" />
<LinkCard title="Vercel" description="Root directory, CLI deploy scripts, and linking" href="/docs/installation/vercel" />
<LinkCard title="Configuration - Backend" description="API and OAuth environment variables" href="/docs/configuration-backend" />
</CardGrid>
