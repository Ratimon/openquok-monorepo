---
title: Redis cache
description: Switch CACHE_PROVIDER to Redis and configure REDIS_* variables.
order: 2
lastUpdated: 2026-03-30
---

<script>
import { Badge, Callout, ExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

By default the backend uses an **in-memory** cache (<Badge text="CACHE_PROVIDER=memory" variant="envBackend" />). For production (or multi-instance deployments), configure **Redis** and set <Badge text="CACHE_PROVIDER" variant="envBackend" /> to <Badge text="redis" variant="default" />.

## Steps

<Steps>

### Create a Redis database

If you don’t have Redis already, you can create one via <ExternalLink href="https://cloud.redis.io/">Redis Cloud</ExternalLink> (or your preferred provider).

Once the database is ready, open your provider’s configuration/settings page and collect:

| Detail | Where to find it |
|---|---|
| **Host** | Public endpoint, the hostname portion (e.g. `redis-*****18904.*.ap-southeast-1-1.ec2.cloud.redislabs.com`) |
| **Port** | Public endpoint, the port number after `:` (e.g. `18903`) |
| **Password** | Database **Security** section (often “Default user password”) |

### Set the backend env variables

Edit <Badge text="backend/.env.development.local" variant="envFile" /> (or your production env) and set:

```bash
CACHE_PROVIDER=redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=app:cache:
```

### Verify the connection

Start the backend and look for a Redis “connected” log line. If you see connection failures, re-check host/port/password.

</Steps>

<Callout type="tip" title="Tip">
You can keep <Badge text="CACHE_PROVIDER" variant="envBackend" /> as <Badge text="memory" variant="default" /> for local dev if you don’t want Redis running.
</Callout>
