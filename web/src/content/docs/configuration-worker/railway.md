---
title: Railway (workers)
description: Deploy BullMQ workers as always-on Railway services—build/start scripts, CLI deploy, and stopping a worker safely.
order: 2
lastUpdated: 2026-05-11
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Orchestrator workers are long-running processes and should run on an **always-on** host (for example <a href="/docs/installation/railway">Railway</a>). See <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Railway → persistent services</DocsExternalLink>.

Workers must share the same **Supabase** and **Redis** credentials as the API:

- <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" />, and <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> . Legacy JWT keys are not accepted; see <a href="/docs/configuration-backend/supabase">Supabase</a>.
- <Badge text="REDIS_*" variant="envBackend" />, <Badge text="REDIS_TLS" variant="envBackend" />, <Badge text="REDIS_TLS_REJECT_UNAUTHORIZED" variant="envBackend" />, and (optionally) <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />

Queue inspection and destructive Redis operations belong on <a href="/docs/configuration-worker/redis">Redis & queues</a>.

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

## Next steps

<CardGrid>
<LinkCard title="Docker (local Redis)" description="Local Compose Redis and worker dev commands" href="/docs/configuration-worker/docker" />
<LinkCard title="Redis & queues" description="redis-cli for BullMQ locally and in production" href="/docs/configuration-worker/redis" />
<LinkCard title="Railway (installation)" description="Service definitions and monorepo Railway patterns" href="/docs/installation/railway" />
</CardGrid>
