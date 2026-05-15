---
title: Auth Server Architecture
description: How the Openquok CLI auth server works — request flow, endpoints, and Postgres state.
order: 1
lastUpdated: 2026-05-15
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The CLI auth server (<Badge text="agent/server" variant="path" />) is a small Node.js service that implements OAuth2 **device flow** for the Openquok CLI. It exists so the CLI can authenticate **without embedding** OAuth client secrets.

Deploy-time env vars and templates for this service live under <a href="/docs/configuration-agent">Configuration - Agent</a>. Implementation reference: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/app.ts"><Badge text="agent/server/app.ts" variant="path" /></DocsExternalLink>.

Browser routes on the web app: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/tree/main/web/src/routes/(public)/cli/device"><Badge text="web/src/routes/(public)/cli/device" variant="path" /></DocsExternalLink>.

## Production topology (Openquok hosted)

```text
CLI                    cli-auth.openquok.com          www.openquok.com              Openquok API
 │                              │                            │                            │
 ├─ POST /device/code ─────────►│                            │                            │
 │◄── verification_uri ─────────│  (points to www)           │                            │
 │                              │                            │                            │
 │  User opens browser ──────────────────────────────────────►│ GET /cli/device/verify     │
 │                              │◄── server proxies POST ────│                            │
 │                              ├─ redirect to OAuth UI ────────────────────────────────►│
 │                              │                            │  /oauth/authorize          │
 │                              │◄── OAuth callback ─────────│ GET /cli/device/callback   │
 │                              │    (proxied)               │                            │
 │                              ├─ exchange for token ──────────────────────────────────►│
 │                              │◄── access_token ───────────────────────────────────────│
 │  POST /device/token (poll) ─►│                            │                            │
 │◄── access_token ─────────────│                            │                            │
```

<Callout type="note">
<p><Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> (CLI) targets <Badge text="cli-auth.openquok.com" variant="new" /> for API calls only. Users never need to open that host in a browser when <Badge text="BROWSER_ORIGIN" variant="envBackend" /> is set to <Badge text="www.openquok.com" variant="new" />.</p>
</Callout>

## Request flow (device login)

```text
CLI                        Auth Server                    Openquok (web + API)
 │                              │                           │
 ├─ POST /device/code ─────────►│                           │
 │◄── device_code + user_code ──│                           │
 │    + verification_uri        │                           │
 │                              │                           │
 │  User opens browser ────────►│ (or web /cli/device/*)    │
 │  Enters code                 │                           │
 │                              ├─ redirect to OAuth UI ───►│
 │                              │◄── callback with code ────│
 │                              ├─ exchange for token ─────►│
 │                              │◄── access_token ──────────│
 │                              │  (stored in Postgres)     │
 │  POST /device/token (poll) ─►│                           │
 │◄── access_token ─────────────│                           │
```

## Components and responsibilities

- **CLI**
  - Calls <Badge text="/device/code" variant="path" /> on the auth server API origin.
  - Opens <Badge text="verification_uri" variant="default" /> in a browser (production: <Badge text="www.openquok.com/cli/device/verify" variant="new" />).
  - Polls <Badge text="/device/token" variant="path" /> until the user finishes approval.

- **Auth server** (<Badge text="agent/server" variant="path" />)
  - Holds the OAuth **client secret** and performs the server-to-server exchange with the Openquok API.
  - Stores short-lived device flow state in Postgres (not in memory).
  - Returns an API token to the CLI once approval is complete.
  - Emits browser URLs from <Badge text="BROWSER_ORIGIN" variant="envBackend" /> when configured.

- **Web app** (<Badge text="web" variant="path" />, when <Badge text="BROWSER_ORIGIN" variant="envBackend" /> ≠ <Badge text="SERVER_URL" variant="envBackend" />)
  - Serves <Badge text="/cli/device/verify" variant="path" /> and proxies to the auth server using <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" />.
  - Proxies <Badge text="/cli/device/callback" variant="path" /> so OAuth redirects stay on the trusted web origin.

- **Openquok (web + API)**
  - Hosts the approval UI at <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> + <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" />.
  - Exchanges the OAuth authorization code for an API access token via <Badge text="/api/v1/oauth/token" variant="path" />.

## Endpoints

### Auth server API (<Badge text="SERVER_URL" variant="envBackend" />)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/device/code` | CLI starts the flow. Returns `device_code`, `user_code`, `verification_uri`. |
| `POST` | `/device/token` | CLI polls with `{"device_code": "..."}` until completed. |
| `GET` | `/health` | Health check. |

### Browser steps

When <Badge text="BROWSER_ORIGIN" variant="envBackend" /> equals <Badge text="SERVER_URL" variant="envBackend" /> (typical local dev), the auth server serves these directly:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/device/verify` | Code entry page. Supports `?code=` prefill. |
| `POST` | `/device/verify` | Validates code; redirects to OAuth authorize UI. |
| `GET` | `/device/callback` | OAuth redirect target; exchanges code and stores token. |

When <Badge text="BROWSER_ORIGIN" variant="envBackend" /> is the web app (Openquok production), the same behavior is exposed at:

| Method | Path | Host |
|--------|------|------|
| `GET` | `/cli/device/verify` | <Badge text="BROWSER_ORIGIN" variant="envBackend" /> |
| `POST` | `/cli/device/verify` | proxied to auth server |
| `GET` | `/cli/device/callback` | proxied to auth server |

## Postgres state model

The server is effectively stateless beyond one Postgres table (<Badge text="device_requests" variant="default" />). Rows are deleted after the CLI retrieves the token, or on next access if expired (15 minutes).

```text
CREATE TABLE device_requests (
  device_code TEXT PRIMARY KEY,
  user_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' or 'completed'
  access_token TEXT,
  api_url TEXT,
  organization_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Deployment and scaling

- **Works anywhere**: any platform that runs Node.js and can reach Postgres (VPS, Railway, Fly.io, Render, etc.).
- **Horizontal scaling**: safe as long as every instance shares the same <Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, <Badge text="BROWSER_ORIGIN" variant="envBackend" />, and OAuth client credentials. No sticky sessions required.
- **Serverless**: use a managed Postgres connection string appropriate for high concurrency (pooling).
- **Openquok production**: deploy both <Badge text="agent/server" variant="path" /> and <Badge text="web" variant="path" />; see <a href="/docs/configuration-agent#common-setup-steps">Configuration - Agent → Common setup steps</a>.

## Next steps

<CardGrid>
<LinkCard title="CLI" description="Install the Openquok CLI and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="Device login, OPENQUOK_AUTH_SERVER, and API keys" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the auth server: env vars, SERVER_URL, BROWSER_ORIGIN" href="/docs/configuration-agent" />
<LinkCard title="Scaling & Postgres" description="Multi-instance notes and serverless Postgres pooling" href="/docs/configuration-agent/scaling" />
<LinkCard title="Vercel (installation)" description="Deploy the CLI auth server on Vercel" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>
