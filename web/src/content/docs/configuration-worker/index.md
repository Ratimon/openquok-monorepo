---
title: Orchestrator workers
description: Environment and deployment for BullMQ worker processes (integration refresh and notification email).
order: 0
lastUpdated: 2026-04-07
---

<script>
import { Badge, Callout, CardGrid, LinkCard, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

When <code>backend/config/orchestratorFlows.ts</code> sets <code>transport: "bullmq"</code> for a flow, the **API only enqueues** work to **Redis / BullMQ**. **Long-running worker processes** in the <Badge text="orchestrator/" variant="path" /> package execute those jobs by importing backend services and repositories in the **same Node process** (they do not call your HTTP API to run business logic).

Deploy workers on an **always-on** host (for example <a href="/docs/Installation/railway">Railway</a>). Serverless-only platforms are a poor fit because workers loop until <code>SIGTERM</code>. Railway describes persistent containers under <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Services → persistent services</DocsExternalLink>.

## What to configure

- **Redis** — Same <Badge text="REDIS_*" variant="envBackend" /> (and optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" />) as the API. See <a href="/docs/configuration-backend/redis">Redis cache</a>.
- **Supabase** — <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />, <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> for server-side tables.
- **Per worker** — Provider OAuth secrets for integration refresh; email provider keys when the notification-email worker should send mail. A short template lives in the repo at <Badge text="orchestrator/.env.worker.example" variant="path" />.


<Callout type="note" title="Minimal secret surface">
You only need to **inject** variables the worker path actually uses; you do not have to duplicate the entire API <Badge text=".env" variant="envFile" />. See <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/orchestrator/README.md">orchestrator/README.md</DocsExternalLink> in the repo for the full tables.
</Callout>

## Monorepo scripts (reference)

From the **repository root** (after install):

| Goal | Command |
|------|---------|
| Build common + backend + orchestrator | <code>pnpm railway:orchestrator:build</code> (alias of <code>pnpm orchestrator:build:deps</code>) |
| Production start — integration refresh | <code>pnpm railway:orchestrator:start:integration-refresh</code> |
| Production start — notification email | <code>pnpm railway:orchestrator:start:notification-email</code> |
| Local dev (tsx) | <code>pnpm orchestrator:worker:integration-refresh-bullmq</code> / <code>pnpm orchestrator:worker:notification-email-bullmq</code> |

Repo-root <Badge text="railway.toml" variant="path" /> sets a shared **build command** for Railway; **start command** is set **per service** in Railway (two workers ⇒ two start commands). See <a href="/docs/Installation/railway">Railway (orchestrator workers)</a>.

## Further reading

<CardGrid>
<LinkCard title="Railway (workers)" description="CLI, build/start commands, and persistent services" href="/docs/Installation/railway" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, BullMQ transport, and behavior" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Redis" description="REDIS_* shared with cache and BullMQ" href="/docs/configuration-backend/redis" />
<LinkCard title="Production deployment" description="Vercel API + optional worker hosts" href="/docs/Installation/production-deployment" />
</CardGrid>
