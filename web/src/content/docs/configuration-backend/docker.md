---
title: Docker (local services)
description: Run local Redis (and other services) via Docker Compose for Openquok development.
order: 0.5
lastUpdated: 2026-04-24
---

<script>
import { Badge, Callout, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

For local development, it’s safest to run infrastructure dependencies (like **Redis**) on your machine via Docker so your API + workers never accidentally point at a shared production instance.

This repo keeps Compose files under <Badge text="infra/" variant="path" />.

## Steps

<Steps>

### Start Redis locally

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

### Point backend + workers at the local Redis

Edit <Badge text="backend/.env.development.local" variant="envFile" />:

```bash
NODE_ENV=development
CACHE_PROVIDER=redis

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_BULLMQ_DB=0
```

### Stop Redis

```bash
# From repo root
docker compose -f infra/docker-compose.yml down
```

</Steps>

<Callout type="note" title="Related docs">
<p>Once Redis is running, see <a href="/docs/configuration-backend/redis">Redis cache</a> for the full list of <Badge text="REDIS_*" variant="envBackend" /> options and BullMQ notes.</p>
<p>For end-to-end setup (backend + web), see <a href="/docs/Installation/development-environment">Development environment</a>.</p>
</Callout>

