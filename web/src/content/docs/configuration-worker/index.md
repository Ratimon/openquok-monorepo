---
title: Orchestrator workers
description: Environment and deployment for BullMQ worker processes (integration refresh, notification email, and scheduled social posts).
order: 0
lastUpdated: 2026-04-25
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
- **Per worker** — Provider OAuth secrets for **integration refresh**; email provider keys for **notification email**; the same **provider or channel** credentials the API would use to publish for **scheduled social** posts. A short template lives in the repo at <Badge text="orchestrator/.env.production.example" variant="path" />.

## Pages in this section

<CardGrid>
<LinkCard title="Local development (workers + Redis)" description="Run Redis locally, start workers, and use redis-cli to monitor/clear queues safely" href="/docs/configuration-worker/development-environment" />
<LinkCard title="Production deployment (workers)" description="Build/start commands, Railway services, and redis-cli operations for queues in production" href="/docs/configuration-worker/production-deployment" />
</CardGrid>

<Callout type="note" title="Minimal secret surface">
You only need to inject variables the worker path actually uses; you do not have to duplicate the entire API <Badge text=".env" variant="envFile" />. See <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/orchestrator/README.md">orchestrator/README.md</DocsExternalLink> in the repo for the full tables.
</Callout>

## Further reading

<CardGrid>
<LinkCard title="Railway (workers)" description="CLI, build/start commands, and persistent services" href="/docs/Installation/railway" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, BullMQ transport, and behavior" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Redis" description="REDIS_* shared with cache and BullMQ" href="/docs/configuration-backend/redis" />
<LinkCard title="Production deployment" description="Vercel API + optional worker hosts" href="/docs/Installation/production-deployment" />
</CardGrid>
