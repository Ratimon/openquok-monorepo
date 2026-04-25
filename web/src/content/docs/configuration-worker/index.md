---
title: Orchestrator workers
description: Environment and deployment for BullMQ worker processes (integration refresh, notification email, and scheduled social posts).
order: 0
lastUpdated: 2026-04-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

When <code>backend/config/orchestratorFlows.ts</code> sets <code>transport: "bullmq"</code> for a flow, the **API only enqueues** work to **Redis / BullMQ**. **Long-running worker processes** in the <Badge text="orchestrator/" variant="path" /> package execute those jobs by importing backend services and repositories in the **same Node process** (they do not call your HTTP API to run business logic).

Deploy workers on an **always-on** host (for example <a href="/docs/Installation/railway">Railway</a>). Serverless-only platforms are a poor fit because workers loop until <code>SIGTERM</code>. Railway describes persistent containers under <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Services → persistent services</DocsExternalLink>.

## What to configure

- **Redis** — Same <Badge text="REDIS_*" variant="envBackend" /> (and optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />) as the API. See <a href="/docs/configuration-backend/redis">Redis cache</a>.
- **Supabase** — <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />, <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> for server-side tables.
- **Per worker** — Provider OAuth secrets for **integration refresh**; email provider keys for **notification email**; the same **provider or channel** credentials the API would use to publish for **scheduled social** posts. A short template lives in the repo at <Badge text="orchestrator/.env.production.example" variant="path" />.

## Local development: run Redis in Docker (recommended)

Workers can only safely point at **one running Redis instance** at a time. To avoid ever sharing the same Redis between **local dev** and **production**, run a local Redis with Docker and keep <Badge text="NODE_ENV" variant="envRuntime" /> set to **development** when running workers locally.

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

Then set (or confirm) the local Redis settings in <Badge text="backend/.env.development.local" variant="envFile" />:

```bash
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_BULLMQ_DB=0
```

To stop Redis:

```bash
docker compose -f infra/docker-compose.yml down
```


<Callout type="note" title="Minimal secret surface">
You only need to inject variables the worker path actually uses; you do not have to duplicate the entire API <Badge text=".env" variant="envFile" />. See <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/orchestrator/README.md">orchestrator/README.md</DocsExternalLink> in the repo for the full tables.
</Callout>

## Monorepo scripts (reference)

From the **repository root** (after install):

| Goal | Command |
|------|---------|
| Build common + backend + orchestrator | <code>pnpm railway:orchestrator:build</code> (alias of <code>pnpm orchestrator:build:deps</code>) |
| Production start — integration refresh | <code>pnpm railway:orchestrator:start:integration-refresh</code> |
| Production start — notification email | <code>pnpm railway:orchestrator:start:notification-email</code> |
| Production start — scheduled social post | <code>pnpm railway:orchestrator:start:scheduled-social-post</code> |
| Local dev (tsx) | <code>pnpm orchestrator:dev:worker:integration-refresh-bullmq</code> / <code>pnpm orchestrator:dev:worker:notification-email-bullmq</code> / <code>pnpm orchestrator:dev:worker:scheduled-social-post-bullmq</code> |

Repo-root <Badge text="railway.toml" variant="path" /> sets a shared **build command** for Railway; **start command** is set **per service** in Railway (one **always-on** service per worker you run). Use <code>pnpm railway:setup:&#42;</code> and <code>pnpm railway:deploy:&#42;</code> for each worker (integration refresh, notification email, scheduled social post). See <a href="/docs/Installation/railway">Railway (orchestrator workers)</a>.

## Stopping a worker service (Railway CLI)

If you need to stop a worker that is currently consuming BullMQ jobs (for example to ensure **only one** worker is processing a queue during debugging), you can delete the latest deployment for that service:

```bash
railway down --service "openquok-worker-scheduled-social-post" --environment production --yes
```

Confirm it is no longer running by checking the service instance list:

```bash
railway status --json
```

## Further reading

<CardGrid>
<LinkCard title="Railway (workers)" description="CLI, build/start commands, and persistent services" href="/docs/Installation/railway" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, BullMQ transport, and behavior" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Redis" description="REDIS_* shared with cache and BullMQ" href="/docs/configuration-backend/redis" />
<LinkCard title="Production deployment" description="Vercel API + optional worker hosts" href="/docs/Installation/production-deployment" />
</CardGrid>
