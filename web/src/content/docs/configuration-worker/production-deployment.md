---
title: Production deployment
description: Deploy BullMQ workers as always-on services (e.g. Railway), with build/start commands and Redis queue operations.
order: 1
lastUpdated: 2026-04-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Production: always-on worker services

Orchestrator workers are long-running processes and should run on an **always-on** host (for example <a href="/docs/Installation/railway">Railway</a>). See <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Railway → persistent services</DocsExternalLink>.

Workers must share the same **Supabase** and **Redis** credentials as the API:

- <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />, <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" />
- <Badge text="REDIS_*" variant="envBackend" /> and (optionally) <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />

## Monorepo scripts (reference)

From the **repository root** (after install):

```bash
# Build common + backend + orchestrator (recommended before deploy)
pnpm railway:orchestrator:build
```

```bash
# Start workers (one always-on service per worker)
pnpm railway:orchestrator:start:integration-refresh
pnpm railway:orchestrator:start:notification-email
pnpm railway:orchestrator:start:scheduled-social-post
```

<Callout type="note" title="Railway build vs start">
Repo-root <Badge text="railway.toml" variant="path" /> sets a shared build command for Railway. The start command is set per Railway service (one persistent service per worker process).
</Callout>

## Stopping a worker service (Railway CLI)

If you need to stop a worker that is currently consuming BullMQ jobs (for example to ensure only one worker is processing a queue during debugging), you can delete the latest deployment for that service:

```bash
railway down --service "openquok-worker-scheduled-social-post" --environment production --yes
```

Confirm it is no longer running by checking the service instance list:

```bash
railway status --json
```

## redis-cli: monitor queues in production

<Callout type="warning" title="Be careful with production Redis">
Prefer read-only commands. Use <code>SCAN</code> (not <code>KEYS</code>) and double-check the DB index (<Badge text="REDIS_BULLMQ_DB" variant="envBackend" />).
</Callout>

### Connect

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" ping
```

### Inspect queue keys

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:<QUEUE_NAME>:*"
```

### Basic queue health signals

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" LLEN "bull:<QUEUE_NAME>:wait"
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" LLEN "bull:<QUEUE_NAME>:active"
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" ZCARD "bull:<QUEUE_NAME>:failed"
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" ZCARD "bull:<QUEUE_NAME>:delayed"
```

## redis-cli: clearing queues (last resort)

If you have to do destructive cleanup, stop the worker service first, then delete keys for a single queue prefix. Keep this as a last resort; prefer a targeted debugging plan and short-lived test queues.

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:<QUEUE_NAME>:*"
```

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" --scan --pattern "bull:<QUEUE_NAME>:*" | xargs -n 50 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" -n "$REDIS_BULLMQ_DB" DEL
```

## Next steps

<CardGrid>
<LinkCard title="Local development (workers + Redis)" description="Run Redis locally, start workers, and queue debugging commands" href="/docs/configuration-worker/development-environment" />
<LinkCard title="Railway (workers)" description="Service definitions and deployment patterns for worker processes" href="/docs/Installation/railway" />
</CardGrid>

