---
title: Docker (local Redis)
description: Run Redis for BullMQ workers locally with Docker Compose, configure REDIS_* for development, and start worker processes.
order: 0.5
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Workers can only safely point at **one running Redis instance** at a time. To avoid sharing the same Redis between **local dev** and **production**, run a local Redis with Docker and keep <Badge text="NODE_ENV" variant="envRuntime" /> set to **development** when running workers locally.

## Run Redis with Docker Compose

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

Then set (or confirm) the local Redis settings in <Badge text="backend/.env.development.local" variant="envBackend" />:

```bash
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_BULLMQ_DB=0
REDIS_TLS=false
REDIS_TLS_REJECT_UNAUTHORIZED=true
```

To stop Redis:

```bash
docker compose -f infra/docker-compose.yml down
```

Variable details and TLS setups for managed Redis are documented under <a href="/docs/configuration-backend/redis">Redis cache</a> (shared with the API).

## Run workers locally (tsx)

From the **repository root** (after install):

```bash
pnpm orchestrator:dev:worker:integration-refresh-bullmq
pnpm orchestrator:dev:worker:notification-email-bullmq
pnpm orchestrator:dev:worker:scheduled-social-post-bullmq
```

<Callout type="note" title="Backend build and imports">
Workers import the backend package. If you change backend code that a worker uses, rebuild the backend (for example <code>pnpm --filter backend build</code>) before restarting the worker.
</Callout>

## Next steps

<CardGrid>
<LinkCard title="Redis & queues" description="redis-cli patterns for BullMQ keys locally and in production" href="/docs/configuration-worker/redis" />
<LinkCard title="Railway (workers)" description="Always-on services, build/start commands, and deploy flow" href="/docs/configuration-worker/railway" />
</CardGrid>
