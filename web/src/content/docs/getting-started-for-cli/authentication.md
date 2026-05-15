---
title: CLI authentication
description: Setup OAuth2 (interactive terminal) authentication for Openquok CLI.
order: 1
lastUpdated: 2026-05-15
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The Openquok CLI authenticates to the API in one of two ways:

- **OAuth2 device flow** (recommended) — It is an authentication with no client ID or secret in the CLI; a small **CLI auth server** holds the OAuth client secret and completes the flow.
- **API key** — set <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> for scripts and CI.

If both are present, stored OAuth2 credentials take priority over <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> — run <Badge text="openquok auth:logout" variant="default" /> to clear them if you want the env var to be used.

## OAuth2 (device flow)

Run:

```bash
openquok auth:login
```

By default the CLI uses an **interactive** device flow:

1. **Terminal** — Shows the verification URL, your **user code**, and prompts you to press **Enter** to open the browser. The opened link includes a `code` query parameter so the verification page can pre-fill the code (no need to paste it manually).
2. **Browser** — On Openquok’s hosted stack this is <Badge text="https://www.openquok.com/cli/device/verify" variant="new" /> (not <Badge text="cli-auth.openquok.com" variant="default" />). Submit the code, then continue to the Openquok web app’s **Authorize application** screen. If you are not signed in, use **Sign in**; after authentication you are returned to the authorize URL, so you can pick a **workspace** and choose **Authorize** or **Deny**.
3. **Terminal** — When success, it writes **only the final result as JSON**.
4. **Credentials** — Stored for later commands (default <Badge text="~/.openquok/credentials.json" variant="path" />).

### Remote / SSH / CI use (no local browser launch)

OAuth2 device flow always needs **a** browser somewhere to complete authorization — it doesn't have to be on the CLI's machine. The CLI's job is just to print the verification URL and poll until you authorize it.

Interactive <Badge text="auth:login" variant="default" /> always prints the verification URL and user code, then tries to open a browser **on the CLI's machine** (after you press Enter when stdin is a TTY, otherwise immediately). If <Badge text="open()" variant="default" /> fails, the CLI re-prints the URL so you can open it manually.

For SSH, CI, or any flow where you don't want the CLI to call <Badge text="open()" variant="default" />, use <Badge text="auth:login --json" variant="default" />: the first JSON object on stdout includes <Badge text="verification_uri" variant="default" /> and <Badge text="verification_uri_complete" variant="default" />, and the CLI never launches a browser. Open the link in any browser (your laptop, phone, etc.) to complete authorization — the CLI keeps polling until you do.

For fully unattended auth with no browser at all, use an API key instead — see <a href="#api-key">API key</a> below.

### Machine-readable output (<Badge text="--json" variant="default" />)

For scripts, CI, or automation, emit the full device payload and polling result as JSON:

```bash
openquok auth:login --json
```

This prints an initial JSON object (including <Badge text="device_code" variant="default" />, <Badge text="user_code" variant="default" />, <Badge text="verification_uri" variant="default" />, <Badge text="verification_uri_complete" variant="default" />, <Badge text="expires_in" variant="default" />, and <Badge text="interval" variant="default" />), then polls until completion and prints a second JSON object when credentials are stored—similar to the historical CLI behavior.



**Other auth commands:**

```bash
openquok auth:status
openquok auth:logout
```

### Which auth server does the CLI use?

The CLI talks to the device-flow **API** at:

- <Badge text="https://cli-auth.openquok.com" variant="new" /> (default <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" />)

That origin serves <Badge text="POST /device/code" variant="path" /> and <Badge text="POST /device/token" variant="path" />. The **browser** step uses a different URL returned in <Badge text="verification_uri" variant="default" />:

- **Hosted Openquok:** <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />

You can point the CLI API at **your own** deployed auth server (self-hosted Openquok or local development of <Badge text="agent/server" variant="path" />):

- **Environment variable:** set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> to the server **API origin** (no trailing slash).
- **Per run:** pass <Badge text="--authServer" variant="default" /> to <Badge text="openquok auth:login" variant="default" />.

```bash
export OPENQUOK_AUTH_SERVER="https://auth.example.com"
openquok auth:login
```

```bash
openquok auth:login --authServer "https://auth.example.com"
```

For **local** auth server development, the default API URL is <Badge text="http://localhost:3111" variant="default" />. With only the auth server running (no web proxy), the browser opens <Badge text="http://localhost:3111/device/verify" variant="default" />. To test the production-style split locally, run the web dev server, set <Badge text="BROWSER_ORIGIN" variant="envBackend" /> on the auth server, and set <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" /> on web — see <a href="/docs/installation/development-environment#optional-cli-auth-server-device-flow">Development environment</a> and <a href="/docs/configuration-agent">Configuration - Agent</a>.

<Callout type="note" title="Operators: deploy the auth server">
<p>Environment variables for <strong>running</strong> the auth server (<Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, <Badge text="BROWSER_ORIGIN" variant="envBackend" />, OAuth client keys) and the web app (<Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" />) are documented under <a href="/docs/configuration-agent">Configuration - Agent</a> and <a href="/docs/configuration-web">Configuration - Web</a>, not on this page.</p>
</Callout>

## API key

Set your programmatic API token for non-interactive use:

```bash
export OPENQUOK_API_KEY="opo_..."
export OPENQUOK_API_URL="https://api.openquok.com"
```

Add exports to your shell profile if you want them to persist.

You can also pass an API key once (storage behavior is described in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/README.md"><Badge text="agent/README.md" variant="path" /></DocsExternalLink>):

```bash
openquok auth:login --apiKey "your_token"
```

## Environment variables

These variables apply to the **CLI process** (your shell, CI job, or agent), not to the auth server deployment.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> | No* | — | Bearer token for the programmatic API |
| <Badge text="OPENQUOK_API_URL" variant="envBackend" /> | No | <Badge text="https://api.openquok.com" variant="new" /> | API origin; requests use paths under <Badge text="/api/v1/" variant="path" /> |
| <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> | No | <Badge text="https://cli-auth.openquok.com" variant="new" /> | **API origin** for device flow (<Badge text="/device/code" variant="path" />, <Badge text="/device/token" variant="path" />). Browser URLs come from the server’s <Badge text="verification_uri" variant="default" />. Use <Badge text="http://localhost:3111" variant="default" /> when running <Badge text="agent/server" variant="path" /> locally. |

*Either <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> or successful <Badge text="openquok auth:login" variant="default" /> (stored credentials) is required for authenticated commands.

## Self-hosting the auth server

You do **not** need to self-host the auth server to use the CLI with Openquok’s hosted stack — the defaults above are enough.

If you run **your own** Openquok deployment and want a dedicated device-flow service:

1. Deploy <Badge text="agent/server" variant="path" /> and set <Badge text="SERVER_URL" variant="envBackend" /> to your API host.
2. Set <Badge text="BROWSER_ORIGIN" variant="envBackend" /> to your web origin (or omit it to serve browser steps on the same host as the API).
3. Deploy <Badge text="web" variant="path" /> with <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" /> when using split hosts.
4. Register the OAuth callback on your OAuth app — <Badge text="BROWSER_ORIGIN/cli/device/callback" variant="path" /> when split, or <Badge text="SERVER_URL/device/callback" variant="path" /> on a single host.
5. Set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> in the CLI to your API origin.

### Clone the repository

The auth server lives at <Badge text="agent/server" variant="path" /> in the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">openquok-monorepo</DocsExternalLink> repository:

```bash
git clone https://github.com/Ratimon/openquok-monorepo.git
cd openquok-monorepo
```

Next, configure environment variables (<Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" />, <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, <Badge text="BROWSER_ORIGIN" variant="envBackend" />) and register the OAuth callback — see <a href="/docs/configuration-agent">Configuration - Agent</a> for the full reference.

### Deployment

Deploy anywhere that runs Node.js and can reach a Postgres database — Vercel, Railway, Render, a VPS, or your own infrastructure.

All device-flow state lives in Postgres, so the process itself holds no state and scales horizontally. Put multiple replicas behind a load balancer when you need more throughput — see <a href="/docs/configuration-agent/scaling">Scaling & Postgres</a>.

For **Vercel** (the path with the most tooling in this monorepo), use **two** projects when mirroring Openquok production:

```bash
# Auth server API (agent/server)
pnpm vercel:env:sync:agent-server:prod
pnpm vercel:deploy:agent-server:prod

# Web browser routes (/cli/device/*)
pnpm vercel:env:sync:web:prod
pnpm vercel:deploy:web:prod
```

Or:

```bash
pnpm vercel:deploy:cli-device-flow:prod
```


### More for Step-by-step Deployment Guides

<CardGrid>
<LinkCard title="Configuration - Agent" description="production vs local env vars, BROWSER_ORIGIN, and deploy steps" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Split topology, endpoints, and Postgres device flow state" href="/docs/configuration-agent/architecture" />
<LinkCard title="Vercel — CLI auth server" description="Deploy on Vercel" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI overview" description="Install, quick start, and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="Admin — OAuth apps" description="Create OAuth client ID and secret; redirect URLs" href="/docs/admin/oauth-server" />
<LinkCard title="Configuration - Backend" description="API base URL and OAuth alignment with the web app" href="/docs/configuration-backend" />
</CardGrid>
