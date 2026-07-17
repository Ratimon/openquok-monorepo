---
title: Docker (local services)
description: Local Redis for OpenQuok contributors developing against the hosted product, or the self-host Compose stack for operators running on their own machine.
order: 0.5
lastUpdated: 2026-07-17
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

This repo keeps Compose files under <Badge text="infra/" variant="path" />. There are **two** stacks with different audiences:

| File | Who | Role |
| --- | --- | --- |
| <Badge text="infra/docker-compose.yml" variant="path" /> | **Contributors** for the hosted product at openquok.com | **Local deps only** — Redis and optional CLI-auth Postgres, against a linked/local Supabase while iterating on the SaaS codebase. |
| <Badge text="infra/self-host/docker-compose.yml" variant="path" /> | **Operators** who want OpenQuok on their own computer or private network | **Full app stack** — API, web, Redis, BullMQ workers (optional CLI profile). See <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. |

Do **not** treat the self-host file as a substitute for the contributor Compose file, or vice versa.

## Local Redis for contributors

<Steps>

### Start Redis locally

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

### Point backend + workers at the local Redis

Edit <Badge text="backend/.env.development.local" variant="envBackend" />:

```bash
NODE_ENV=development
CACHE_PROVIDER=redis

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_BULLMQ_DB=0
REDIS_TLS=false
REDIS_TLS_REJECT_UNAUTHORIZED=true
```

### Stop Redis

```bash
# From repo root
docker compose -f infra/docker-compose.yml down
```

</Steps>

<Callout type="note" title="Related docs">
<p>Once Redis is running, see <a href="/docs/configuration-backend/redis">Redis cache</a> for the full list of <Badge text="REDIS_*" variant="envBackend" /> options and BullMQ notes.</p>
<p>For end-to-end setup (backend + web with <code>pnpm</code>), see <a href="/docs/installation/development-environment">Development environment</a>.</p>
</Callout>

## Self-host stack (own machine)

To run the full application in Docker on **your** host (not the openquok.com SaaS deploy path), use <Badge text="infra/self-host/" variant="path" />. Copy <Badge text="infra/self-host/.env.example" variant="path" />, fill Supabase keys, then:

```bash
# From repo root
docker compose -f infra/self-host/docker-compose.yml up --build
```

Requirements, ports, and env defaults: <a href="/docs/installation/system-requirements">System requirements</a> and <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>.

<Callout type="warning">
<p>The self-host stack is aimed at <strong>localhost / private-network</strong> use. Defaults such as <Badge text="NOT_SECURED=true" variant="envBackend" />, open registration, no Redis password, and published API/web ports assume a trusted operator machine. Put a TLS reverse proxy in front and tighten env before exposing beyond your LAN — see the security notes on the <a href="/docs/installation/docker-compose#security-and-exposure">self-host install page</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Canonical self-host bring-up for API, web, and workers" href="/docs/installation/docker-compose" />
<LinkCard title="Development environment" description="pnpm local servers with optional Compose Redis" href="/docs/installation/development-environment" />
<LinkCard title="Redis cache" description="REDIS_* options and BullMQ notes" href="/docs/configuration-backend/redis" />
</CardGrid>
