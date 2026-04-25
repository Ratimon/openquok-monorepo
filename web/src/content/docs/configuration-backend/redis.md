---
title: Redis cache
description: Switch CACHE_PROVIDER to Redis and configure REDIS_* variables for Openquok.
order: 2
lastUpdated: 2026-04-24
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

By default the backend uses **Redis** for cache (<Badge text="CACHE_PROVIDER=redis" variant="envBackend" />). For local development, run Redis via Docker (recommended); if you don’t want Redis locally, you can fall back to <Badge text="CACHE_PROVIDER=memory" variant="envBackend" />.

The same <Badge text="REDIS_HOST" variant="envBackend" /> / <Badge text="REDIS_PORT" variant="envBackend" /> / <Badge text="REDIS_PASSWORD" variant="envBackend" /> values are also used for **BullMQ** when integration refresh runs in distributed mode (<code>transport: bullmq</code> in <code>backend/config/orchestratorFlows.ts</code>). That path uses the <DocsExternalLink href="https://flowcraft.js.org/guide/distributed-execution">Flowcraft distributed execution</DocsExternalLink> model with the <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">BullMQ adapter</DocsExternalLink> and a dedicated <DocsExternalLink href="https://bullmq.io/">BullMQ</DocsExternalLink> client (<code>ioredis</code>), not the <code>redis</code> package used by <code>RedisCacheProvider</code>. Optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" /> selects the logical Redis database for queues (defaults to <Badge text="REDIS_DB" variant="envBackend" />).

## Steps

<Steps>

### Create a Redis database

If you don’t have Redis already, you can create one via <DocsExternalLink href="https://cloud.redis.io/">Redis Cloud</DocsExternalLink> (or your preferred provider).

Once the database is ready, open your provider’s configuration/settings page and collect:

| Detail | Where to find it |
|---|---|
| **Host** | Public endpoint, the hostname portion (e.g. `redis-*****18904.*.ap-southeast-1-1.ec2.cloud.redislabs.com`) |
| **Port** | Public endpoint, the port number after `:` (e.g. `18903`) |
| **Password** | Database **Security** section (often “Default user password”) |

<Callout type="tip" title="Local development (Docker)">
<p>The repo includes a minimal local Redis in <Badge text="infra/docker-compose.yml" variant="path" />. This is the recommended way to run Redis for local development so your API + workers never accidentally point at a shared production instance.</p>

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

<p>To stop it:</p>

```bash
docker compose -f infra/docker-compose.yml down
```

<p>Then configure <Badge text="backend/.env.development.local" variant="envFile" /> to point at Docker:</p>

```bash
CACHE_PROVIDER=redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_BULLMQ_DB=0
```
</Callout>

### Set the backend env variables

Edit <Badge text="backend/.env.development.local" variant="envFile" /> (or your production env). A typical Redis-backed setup looks like this (use your provider’s host, port, and password — do not commit real secrets):

```bash
# -----------------------------------------------------------------------------
# Cache (memory or redis; used for module_configs etc.)
# -----------------------------------------------------------------------------
CACHE_PROVIDER=redis
CACHE_DEFAULT_TTL=300
CACHE_LOG_HITS=true
CACHE_LOG_MISSES=true
CACHE_CHECK_PERIOD=60
CACHE_USE_CLONES=false
CACHE_ENABLED=true
CACHE_ENABLE_PATTERNS=true

# Redis (when CACHE_PROVIDER=redis). Point at your local or managed Redis host.
# These placeholder lines target localhost:6379 with no password — they will FAIL integration checks
# (e.g. pnpm test:integration:bullmq-redis) unless you run Redis locally (e.g. Docker). Copy real host/port/password
# from your provider into .env.development.local; managed Redis often needs REDIS_TLS=true as well.
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=app:cache:
REDIS_MAX_RECONNECT_ATTEMPTS=10
REDIS_ENABLE_OFFLINE_QUEUE=true
REDIS_USE_SCAN=true
# Optional: logical Redis DB for BullMQ / Flowcraft queues (defaults to REDIS_DB).
REDIS_BULLMQ_DB=0
```

For Redis-backed cache, set <Badge text="CACHE_PROVIDER=redis" variant="envBackend" /> and replace the placeholder <Badge text="REDIS_HOST" variant="envBackend" /> / <Badge text="REDIS_PORT" variant="envBackend" /> / <Badge text="REDIS_PASSWORD" variant="envBackend" /> with your provider values. Managed hosts often need <Badge text="REDIS_TLS=true" variant="envBackend" /> (and only in local dev, if required, <Badge text="REDIS_TLS_REJECT_UNAUTHORIZED=false" variant="envBackend" />).

Integration token refresh in **BullMQ** mode uses the same <Badge text="REDIS_*" variant="envBackend" /> connection. Set <code>orchestratorFlows.integrationRefresh.transport</code> to <code>bullmq</code> in <code>backend/config/orchestratorFlows.ts</code> (<code>enabled</code>, queue name, and transport are documented there). See <a href="/docs/developer-guidelines/orchestrator-workflows/">Backend orchestrator workflows</a>.

### Verify the connection

Start the backend and look for a Redis “connected” log line. If you see connection failures, re-check host/port/password.

You can also run these opt-in smoke tests:

```bash
# Local dev / Docker Redis (uses backend/.env.development.local)
cd backend
pnpm test:integration:bullmq-redis
pnpm test:integration:third-parties:redis

# Production-connection smoke test (uses backend/.env.production.local)
pnpm test:integration:third-parties:prod:redis
```

### Optional: BullMQ connectivity (distributed refresh worker)

With Redis running, you can confirm the queue client from the backend package:

```bash
cd backend
pnpm test:integration:bullmq-redis
```

Then run the worker (after setting <code>transport: bullmq</code> for integration refresh in <code>backend/config/orchestratorFlows.ts</code> and redeploying the API):

```bash
# From repository root (recommended)
pnpm orchestrator:dev:worker:integration-refresh-bullmq
```

For **production** worker hosts (always-on), use <code>pnpm railway:orchestrator:build</code> and <code>pnpm railway:orchestrator:start:integration-refresh</code> as documented in <a href="/docs/configuration-worker">Orchestrator workers</a> and <a href="/docs/Installation/railway">Railway (orchestrator workers)</a>.

</Steps>

<Callout type="tip" title="Tip">
You can keep <Badge text="CACHE_PROVIDER=memory" variant="envBackend" /> for local dev if you don’t want Redis running.
</Callout>
