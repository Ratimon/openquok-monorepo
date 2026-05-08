---
title: Auth server architecture
description: How the Openquok CLI auth server works — request flow, endpoints, and Postgres state.
order: 0.75
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The CLI auth server (<Badge text="agent/server" variant="path" />) is a small Node.js service that implements OAuth2 **device flow** for the Openquok CLI. It exists so the CLI can authenticate **without embedding** OAuth client secrets.

This page is a docs-friendly explanation of the source-of-truth spec in:

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/SERVER.md"><Badge text="agent/server/SERVER.md" variant="path" /></DocsExternalLink>

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

## Endpoints (auth server)

- <Badge text="POST /device/code" variant="path" /> — start a new device flow; returns <Badge text="device_code" variant="default" />, <Badge text="user_code" variant="default" />, and <Badge text="verification_uri" variant="default" />
- <Badge text="GET /device/verify" variant="path" /> — browser page where the user enters their code (supports <code>?code=</code> prefill)
- <Badge text="POST /device/verify" variant="path" /> — validate code and redirect to the Openquok approval UI
- <Badge text="GET /device/callback" variant="path" /> — Openquok redirects here after authorization; auth server exchanges code for a token and stores it
- <Badge text="POST /device/token" variant="path" /> — CLI polls with the request body below until completed; then returns token

```text
{"device_code":"..."}
```
- <Badge text="GET /health" variant="path" /> — health check

<Callout type="note" title="Public routes on serverless platforms">
Public routes are defined at the root (<Badge text="/health" variant="path" />, <Badge text="/device/*" variant="path" />). On serverless platforms that mount handlers under <Badge text="/api" variant="path" />, rewrites map these public URLs into the function entrypoint so the CLI and browser keep stable paths.
</Callout>

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
<LinkCard title="Configuration - Agent" description="Hosted vs self-hosted, env vars, callback URL, and setup steps" href="/docs/configuration-agent" />
<LinkCard title="Scaling & Postgres" description="Multi-instance notes and serverless Postgres pooling" href="/docs/configuration-agent/scaling" />
<LinkCard title="Vercel (installation)" description="Deploy the CLI auth server on Vercel" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>

