---
title: Neon Postgres
description: Create a Neon Postgres project and wire its connection string into the Openquok CLI auth server.
order: 2
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The Openquok **CLI auth server** (<Badge text="agent/server" variant="path" />) stores short-lived OAuth device-flow state in **Postgres**. Neon is a good managed Postgres option for production deployments (including serverless hosts like Vercel).

## Environment variables

- <Badge text="DATABASE_URL" variant="envBackend" /> — Neon Postgres connection string (recommended: include `sslmode=require`).

<Callout type="note" title="Neon Auth">
<p>Leave <strong>Neon Auth</strong> disabled. The auth server does not use Neon-managed users/sessions; it only needs a standard Postgres database reachable via <Badge text="DATABASE_URL" variant="envBackend" />.</p>
</Callout>

## Common setup steps

<Steps>

### Create a Neon project

In Neon, create a new project and choose:

- <Badge text="Postgres version: 16" variant="default" /> (matches local dev via `postgres:16-alpine`)
- A region close to your deployed auth server (Vercel / host region)

### Copy the connection string

From Neon’s connection details, copy the **Postgres connection string**. It should look like:

```text
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

If Neon offers multiple strings, prefer a pooled/serverless-friendly option for high concurrency deployments (for example Vercel).

### Set DATABASE_URL in production

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/.env.production.example"><Badge text="agent/server/.env.production.example" variant="envBackend" /></DocsExternalLink> to <Badge text="agent/server/.env.production.local" variant="envBackend" /> (gitignored), then set:

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

If you deploy on Vercel, you can also set the same key in the Vercel project’s Environment Variables instead of using a local file.

### Verify the auth server boots

Once deployed, hit the health check endpoint:

```text
GET /health
```

On startup, the server will auto-create the `device_requests` table if it does not exist.

</Steps>

## Links

- <DocsExternalLink href="https://console.neon.tech/">Neon Console</DocsExternalLink>
- <a href="/docs/configuration-agent">Configuration - Agent</a> (env vars) · <a href="/docs/configuration-agent/architecture">Auth server architecture</a>
