---
title: Development environment
description: Run BullMQ workers locally with a local Redis, and use redis-cli to monitor and clear queues safely.
order: 0
lastUpdated: 2026-04-27
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

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
REDIS_TLS=false
REDIS_TLS_REJECT_UNAUTHORIZED=true
```

To stop Redis:

```bash
docker compose -f infra/docker-compose.yml down
```

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

## redis-cli: monitor queues locally

BullMQ stores state in Redis keys scoped by queue name. The safest pattern is to use <code>SCAN</code> (not <code>KEYS</code>) and inspect sizes.

<Callout type="warning" title="Pick the correct DB">
If you set <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />, use that DB index when running redis-cli (with <code>-n</code>). Do not run destructive commands against the wrong DB.
</Callout>

### Connect

```bash
# Local dev Redis (no password)
redis-cli -h localhost -p 6379 -n 0 ping
```

### Find BullMQ keys for a queue

Replace <code>&lt;QUEUE_NAME&gt;</code> with your queue name (for example <code>scheduled-social-post</code>).

```bash
redis-cli -h localhost -p 6379 -n 0 --scan --pattern "bull:<QUEUE_NAME>:*"
```

### Inspect queue sizes (common keys)

BullMQ typically uses:

- <code>bull:&lt;QUEUE_NAME&gt;:wait</code> (list)
- <code>bull:&lt;QUEUE_NAME&gt;:active</code> (list)
- <code>bull:&lt;QUEUE_NAME&gt;:paused</code> (list)
- <code>bull:&lt;QUEUE_NAME&gt;:delayed</code> (zset)
- <code>bull:&lt;QUEUE_NAME&gt;:completed</code> (zset)
- <code>bull:&lt;QUEUE_NAME&gt;:failed</code> (zset)

```bash
redis-cli -h localhost -p 6379 -n 0 LLEN "bull:<QUEUE_NAME>:wait"
redis-cli -h localhost -p 6379 -n 0 LLEN "bull:<QUEUE_NAME>:active"
redis-cli -h localhost -p 6379 -n 0 ZCARD "bull:<QUEUE_NAME>:delayed"
redis-cli -h localhost -p 6379 -n 0 ZCARD "bull:<QUEUE_NAME>:failed"
redis-cli -h localhost -p 6379 -n 0 ZCARD "bull:<QUEUE_NAME>:completed"
```

## redis-cli: clear a local queue (debugging)

If you are iterating on worker behavior and want to remove stuck jobs in a local Redis DB, it’s safer to clear by **queue prefix** in that local DB.

<Callout type="warning" title="Do not do this against production Redis">
Only run bulk delete/clear steps against your local dev Redis. In production, prefer stopping workers and letting BullMQ retries settle, or use a targeted cleanup plan.
</Callout>

```bash
# List the keys first
redis-cli -h localhost -p 6379 -n 0 --scan --pattern "bull:<QUEUE_NAME>:*"
```

```bash
# Delete all BullMQ keys for the queue
redis-cli -h localhost -p 6379 -n 0 --scan --pattern "bull:<QUEUE_NAME>:*" | xargs -n 50 redis-cli -h localhost -p 6379 -n 0 DEL
```

## Next steps

<CardGrid>
<LinkCard title="Production deployment (workers)" description="Build/start commands and operational commands for production queues" href="/docs/configuration-worker/production-deployment" />
<LinkCard title="Railway (workers)" description="Always-on worker services on Railway" href="/docs/Installation/railway" />
</CardGrid>

