---
title: Redis & queues
description: redis-cli patterns for BullMQ queues—monitor sizes, clear local queues safely, and read-only checks in production.
order: 1
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Workers and the API share <Badge text="REDIS_*" variant="envBackend" /> (and optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />). Configure connection strings and provider setup on <a href="/docs/configuration-backend/redis">Redis cache</a>. This page focuses on **BullMQ queue keys** and safe <code>redis-cli</code> usage.

<Callout type="warning" title="Pick the correct DB">
If you set <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />, use that DB index when running redis-cli (with <code>-n</code>). Do not run destructive commands against the wrong DB.
</Callout>

## Local development

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

### Clear a local queue (debugging)

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

The safest pattern is to use <code>SCAN</code> (not <code>KEYS</code>) when exploring key sets.

## Production

### Monitor queues

<Callout type="warning" title="Be careful with production Redis">
Prefer read-only commands. Use <code>SCAN</code> (not <code>KEYS</code>) and double-check the DB index (<Badge text="REDIS_BULLMQ_DB" variant="envBackend" />).
</Callout>

Export <Badge text="REDIS_HOST" variant="envBackend" />, <Badge text="REDIS_PORT" variant="envBackend" />, <Badge text="REDIS_PASSWORD" variant="envBackend" />, and the logical database index (for BullMQ, usually <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />; fall back to <Badge text="REDIS_DB" variant="envBackend" /> if unset). If your host requires TLS (for example <DocsExternalLink href="https://cloud.redis.io/">Redis Cloud</DocsExternalLink>), add <code>--tls</code> to every <code>redis-cli</code> invocation, or use a <code>rediss://</code> URL (see <a href="/docs/configuration-backend/redis">Redis cache</a> and your provider’s connection string).

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" ping
```

With TLS (typical for managed endpoints):

```bash
redis-cli --tls -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" ping
```

### Inspect memory and key counts (bloat check)

**Read-only:** confirm how much memory the instance uses, whether a <code>maxmemory</code> cap is set, and the eviction policy (BullMQ expects <code>noeviction</code> in production; see <DocsExternalLink href="https://docs.bullmq.io/bullmq/particularities-and-common-errors#redis-oom">BullMQ → Redis OOM</DocsExternalLink>).

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" INFO memory
```

## Clearing Redis keys (last resort)

If you have to do destructive cleanup, **stop the worker service(s)** first (see <a href="/docs/configuration-worker/railway#stopping-a-worker-service-railway-cli">Railway → Stopping a worker service</a>) so no process races with your deletes. Keep this as a last resort; prefer fixing retention in code and a short, targeted plan.

<Callout type="danger" title="Be careful with FLUSHDB">
<code>FLUSHDB</code> deletes <strong>everything</strong> in the selected logical Redis DB (<code>-n</code>): BullMQ queues, Flowcraft run state, notification digests, and (if you use it) API cache. Only use it if you are sure the DB is safe to wipe.
</Callout>

### Recommended: OpenQuok cleanup script (prefix deletes)

This removes OpenQuok-owned prefixes with <code>SCAN</code> + <code>UNLINK</code> (not <code>FLUSHDB</code>), using the same Redis connection settings as the app:

```bash
pnpm --filter openquok-orchestrator script:free-openquok-redis-memory -- --targets=bull,digest,flowcraft
```

To also clear cache keys (under <code>REDIS_PREFIX</code>, typically <code>app:cache:</code>):

```bash
pnpm --filter openquok-orchestrator script:free-openquok-redis-memory -- --targets=bull,digest,flowcraft,cache
```

### Manual (redis-cli): clear BullMQ queues by prefix

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:notification-email:*" | xargs -n 200 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" UNLINK
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:scheduled-social-post:*" | xargs -n 200 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" UNLINK
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:integration-refresh:*" | xargs -n 200 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" UNLINK
```

### Nuclear option: wipe the whole DB (FLUSHDB)

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_DB" FLUSHDB
```

Re-check <code>DBSIZE</code> / <code>INFO memory</code> after cleanup, then re-deploy or start the worker(s) when finished.

## Next steps

<CardGrid>
<LinkCard title="Docker (local Redis)" description="Compose Redis and local worker scripts" href="/docs/configuration-worker/docker" />
<LinkCard title="Railway (workers)" description="Deploy and operate always-on worker services" href="/docs/configuration-worker/railway" />
<LinkCard title="Redis cache" description="REDIS_* variables, TLS, and provider setup" href="/docs/configuration-backend/redis" />
</CardGrid>
