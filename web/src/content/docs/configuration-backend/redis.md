---
title: Redis cache
description: Switch CACHE_PROVIDER to Redis and configure REDIS_* variables for Openquok.
order: 2
lastUpdated: 2026-04-05
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

By default the backend uses an **in-memory** cache (<Badge text="CACHE_PROVIDER=memory" variant="envBackend" />). For production (or multi-instance deployments), configure **Redis** and set <Badge text="CACHE_PROVIDER=redis" variant="envBackend" />.

The same <Badge text="REDIS_HOST" variant="envBackend" /> / <Badge text="REDIS_PORT" variant="envBackend" /> / <Badge text="REDIS_PASSWORD" variant="envBackend" /> values are also used for **BullMQ** when you run the integration refresh worker in distributed mode (<Badge text="INTEGRATION_REFRESH_TRANSPORT=bullmq" variant="envBackend" />). That path uses the <DocsExternalLink href="https://flowcraft.js.org/guide/distributed-execution">Flowcraft distributed execution</DocsExternalLink> model with the <DocsExternalLink href="https://flowcraft.js.org/guide/adapters/bullmq">BullMQ adapter</DocsExternalLink> and a dedicated <DocsExternalLink href="https://bullmq.io/">BullMQ</DocsExternalLink> client (<code>ioredis</code>), not the <code>redis</code> package used by <code>RedisCacheProvider</code>. Optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" /> selects the logical Redis database for queues (defaults to <Badge text="REDIS_DB" variant="envBackend" />).

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

### Set the backend env variables

Edit <Badge text="backend/.env.development.local" variant="envFile" /> (or your production env). Add or update:

```bash
CACHE_PROVIDER=redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_DB=0
# Optional: separate logical DB for BullMQ / Flowcraft (defaults to REDIS_DB)
# REDIS_BULLMQ_DB=0
REDIS_PREFIX=app:cache:
```

### Verify the connection

Start the backend and look for a Redis “connected” log line. If you see connection failures, re-check host/port/password.

### Optional: BullMQ connectivity (distributed refresh worker)

With Redis running, you can confirm the queue client from the backend package:

```bash
cd backend
pnpm test:integration:bullmq-redis
```

Then run the worker (after setting <Badge text="INTEGRATION_REFRESH_TRANSPORT=bullmq" variant="envBackend" /> on the API):

```bash
cd backend
pnpm worker:integration-refresh-bullmq
```

</Steps>

<Callout type="tip" title="Tip">
You can keep <Badge text="CACHE_PROVIDER=memory" variant="envBackend" /> for local dev if you don’t want Redis running.
</Callout>
