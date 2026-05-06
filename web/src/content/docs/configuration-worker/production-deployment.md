---
title: Production deployment
description: Deploy BullMQ workers as always-on services (e.g. Railway), with build/start commands and Redis queue operations.
order: 1
lastUpdated: 2026-04-27
---

<script>
import { Badge, Callout, CardGrid, LinkCard, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Production: always-on worker services

Orchestrator workers are long-running processes and should run on an **always-on** host (for example <a href="/docs/installation/railway">Railway</a>). See <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Railway → persistent services</DocsExternalLink>.

Workers must share the same **Supabase** and **Redis** credentials as the API:

- <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />, <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" />
- <Badge text="REDIS_*" variant="envBackend" />, <Badge text="REDIS_TLS" variant="envBackend" />, <Badge text="REDIS_TLS_REJECT_UNAUTHORIZED" variant="envBackend" />, and (optionally) <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />

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

If you need to stop a worker that is currently consuming BullMQ jobs (for example to ensure only one worker is processing a queue during debugging), you can delete the latest deployment for that service. Service names match the <a href="/docs/installation/railway">Railway</a> setup scripts (<code>openquok-worker-*</code>):

```bash
railway down --service "openquok-worker-integration-refresh" --environment production --yes
railway down --service "openquok-worker-notification-email" --environment production --yes
railway down --service "openquok-worker-scheduled-social-post" --environment production --yes
```

Confirm it is no longer running by checking the service instance list:

```bash
railway status --json
```

## Deploying a worker (Railway CLI)

**CLI deploy from the monorepo root** — make sure the Railway CLI is targeting the worker service you want to deploy. Run <code>railway service</code> again before each deploy so <code>railway up</code> targets the correct service:

```bash
railway login
railway link

# Select the worker service (run again before each deploy)
railway service
```

Each script sets <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> and runs the deploy; see <a href="/docs/installation/railway#railway-cli">Railway (workers) → Railway CLI</a> for the full flow.

```bash
pnpm railway:deploy:integration-refresh
pnpm railway:deploy:notification-email
pnpm railway:deploy:scheduled-social-post
```

## redis-cli: monitor queues in production

<Callout type="warning" title="Be careful with production Redis">
Prefer read-only commands. Use <code>SCAN</code> (not <code>KEYS</code>) and double-check the DB index (<Badge text="REDIS_BULLMQ_DB" variant="envBackend" />).
</Callout>

### Connect

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

If you have to do destructive cleanup, **stop the worker service(s)** first (see <a href="#stopping-a-worker-service-railway-cli">Stopping a worker service</a>) so no process races with your deletes. Keep this as a last resort; prefer fixing retention in code and a short, targeted plan.

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
<LinkCard title="Local development (workers + Redis)" description="Run Redis locally, start workers, and queue debugging commands" href="/docs/configuration-worker/development-environment" />
<LinkCard title="Redis cache" description="REDIS_* variables, TLS, and provider setup" href="/docs/configuration-backend/redis" />
<LinkCard title="Railway (workers)" description="Service definitions and deployment patterns for worker processes" href="/docs/installation/railway" />
</CardGrid>

