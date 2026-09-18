---
title: Cache design
description: How OpenQuok uses Redis and Postgres — source of truth, cache strategy, and connection limits.
order: 3.5
lastUpdated: 2026-09-18
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok stores product data in **Supabase (Postgres)**. Redis is a **shared helper** for cache, OAuth state, and job queues. Redis is **not** the source of truth for posts, users, or billing.

Configure Redis connection variables on <a href="/docs/configuration-backend/redis">Redis cache</a>. Use <a href="/docs/configuration-worker/redis">Redis &amp; queues</a> for BullMQ keys and <code>redis-cli</code> checks.

## Source of truth

| Data | Source of truth |
| --- | --- |
| Posts, schedules, integrations, users, orgs, billing | Postgres |
| API read cache (profiles, RBAC, calendar lists, blog, listings) | Postgres (copy in Redis) |
| OAuth PKCE state | Redis (short TTL; not a DB copy) |
| BullMQ jobs and Flowcraft run state | Redis (pipeline only; schedule rows stay in Postgres) |

Write scheduled posts to Postgres **before** you enqueue a worker job. If Redis loses a job, reconciliation can rescan Postgres. Do not treat the queue as the schedule record.

## Three Redis roles

One Redis host can serve all roles. The API and workers use **two clients**:

| Role | Client | Key examples |
| --- | --- | --- |
| Application cache | <code>redis</code> package (<code>RedisCacheProvider</code>) | <Badge text="REDIS_PREFIX" variant="envBackend" /> (default <code>app:cache:</code>) |
| Queues and workflow | <code>ioredis</code> / BullMQ | <code>bull:&lt;queue&gt;:*</code>, <code>workflow:state</code> |
| OAuth connect | Same cache client | <code>login:</code>, <code>organization:</code>, … under the cache prefix |

Optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" /> puts queue keys on a separate logical DB. Cache keys use <Badge text="REDIS_DB" variant="envBackend" />.

## Cache strategy

**Reads — read-aside.** Services call <code>getOrSet</code>: read Redis; on miss, load Postgres, then set Redis with TTL. Code: <Badge text="backend/connections/cache/CacheService.ts" variant="path" />.

**Writes — write-around.** Mutations write Postgres first. Then <code>CacheInvalidationService</code> deletes keys or patterns (for example calendar list caches after a post change). OpenQuok does **not** write-through every read cache on each DB update.

**TTL — backstop.** Default <Badge text="CACHE_DEFAULT_TTL" variant="envBackend" /> is 900 seconds. OAuth state TTL is 3600 seconds. Stale data can exist until invalidation or TTL expiry.

Production must use <Badge text="CACHE_PROVIDER=redis" variant="envBackend" /> (or Redis env with auto-force in production) so OAuth state works across Vercel instances.

## Connection limits

Managed Redis plans cap **concurrent connections** (for example 256 on Redis Cloud Essentials 250&nbsp;MB).

| Component | Typical connections |
| --- | --- |
| Each warm Vercel API instance | 1 cache client + short-lived queue clients on enqueue |
| Each Railway worker | 1–2 persistent <code>ioredis</code> clients (BullMQ) + optional cache client |
| Health probes | Can open extra clients if each probe creates a new connection |

Traffic spikes can raise connection count fast. Redis does **not** remove idle clients for you. Stale TCP sessions can stay until the client disconnects or you run <code>CLIENT KILL</code>.

<Callout type="warning" title="Production">
<p>Watch <strong>Connected clients</strong> in your Redis provider dashboard. Keep <Badge text="BULL_BOARD_ENABLED" variant="envBackend" /> off on serverless API unless you need the dashboard there. Prefer one worker replica per queue service.</p>
</Callout>

### Check connections

```bash
redis-cli -u 'redis://default:PASSWORD@HOST:PORT' --tls INFO clients | grep connected_clients
redis-cli -u 'redis://...' --tls CLIENT LIST
```

Kill only clients with <strong>idle</strong> over one day and no recent <code>bzpopmin</code> / <code>setex</code> activity. Do not kill live worker or API rows.

## Related

<CardGrid>
<LinkCard title="Redis cache" description="REDIS_* setup, TLS, and local Docker" href="/docs/configuration-backend/redis" />
<LinkCard title="Redis &amp; queues" description="BullMQ keys and safe redis-cli for workers" href="/docs/configuration-worker/redis" />
<LinkCard title="Configuration - Worker" description="BullMQ workers and health endpoints" href="/docs/configuration-worker" />
</CardGrid>
