---
title: Auth Server Architecture
description: How the Openquok CLI auth server works — request flow, endpoints, and Postgres state.
order: 1
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The CLI auth server (<Badge text="agent/server" variant="path" />) is a small Node.js service that implements OAuth2 **device flow** for the Openquok CLI. It exists so the CLI can authenticate **without embedding** OAuth client secrets.

Deploy-time env vars and templates for this service live under <a href="/docs/configuration-agent">Configuration - Agent</a>. Implementation reference: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/app.ts"><Badge text="agent/server/app.ts" variant="path" /></DocsExternalLink>.

## Request flow (device login)

```text
CLI                        Auth Server                    Openquok
 │                              │                           │
 ├─ POST /device/code ─────────►│                           │
 │◄── device_code + user_code ──│                           │
 │                              │                           │
 │  User opens browser ────────►│                           │
 │  Enters code                 │                           │
 │                              ├─ redirect to OAuth UI ───►│
 │                              │◄── callback with code ────│
 │                              ├─ exchange for token ─────►│
 │                              │◄── access_token ──────────│
 │                              │  (stored in Postgres)     │
 │                              │                           │
 │  POST /device/token (poll) ─►│                           │
 │◄── access_token ─────────────│                           │
```

## Components and responsibilities

- **CLI**
  - Calls <Badge text="/device/code" variant="path" /> to get a <Badge text="user_code" variant="default" />.
  - Prints instructions / opens the browser.
  - Polls <Badge text="/device/token" variant="path" /> until the user finishes approval.

- **Auth server**
  - Holds the OAuth **client secret** and performs the server-to-server exchange with the Openquok API.
  - Stores short-lived device flow state in Postgres (not in memory).
  - Returns an API token to the CLI once approval is complete.

- **Openquok (web + API)**
  - Hosts the approval UI at <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> + <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" />.
  - Exchanges the OAuth authorization code for an API access token via <Badge text="/api/v1/oauth/token" variant="path" />.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/device/code` | CLI calls this to start a new device flow. Returns `device_code`, `user_code`, `verification_uri`. |
| `GET` | `/device/verify` | Browser page where the user enters their code. Supports `?code=` prefill. |
| `POST` | `/device/verify` | Validates the user code and redirects to the Openquok OAuth approval UI. |
| `GET` | `/device/callback` | Openquok redirects here after authorization. Exchanges the code for an access token and stores it. |
| `POST` | `/device/token` | CLI polls this with `{"device_code": "..."}` until completed, then returns token. |
| `GET` | `/health` | Health check. |


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
- **Horizontal scaling**: safe as long as every instance shares the same <Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, and OAuth client credentials. No sticky sessions required.
- **Serverless**: use a managed Postgres connection string appropriate for high concurrency (pooling).

## Next steps

<CardGrid>
<LinkCard title="CLI" description="Install the Openquok CLI and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="Device login, OPENQUOK_AUTH_SERVER, and API keys" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the auth server: env vars, SERVER_URL, callbacks" href="/docs/configuration-agent" />
<LinkCard title="Scaling & Postgres" description="Multi-instance notes and serverless Postgres pooling" href="/docs/configuration-agent/scaling" />
<LinkCard title="Vercel (installation)" description="Deploy the CLI auth server on Vercel" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>

