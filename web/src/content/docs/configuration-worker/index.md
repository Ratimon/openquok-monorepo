---
title: Orchestrator workers
description: Environment and deployment for BullMQ worker processes (integration refresh, notification email, and scheduled social posts), plus the super-admin queue dashboard in the web app.
order: 0
lastUpdated: 2026-04-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

When <code>backend/config/orchestratorFlows.ts</code> sets <code>transport: "bullmq"</code> for a flow, the **API only enqueues** work to **Redis / BullMQ**. **Long-running worker processes** in the <Badge text="orchestrator/" variant="path" /> package execute those jobs by importing backend services and repositories in the **same Node process** (they do not call your HTTP API to run business logic).

Deploy workers on an **always-on** host (for example <a href="/docs/Installation/railway">Railway</a>). Serverless-only platforms are a poor fit because workers loop until <code>SIGTERM</code>. Railway describes persistent containers under <DocsExternalLink href="https://docs.railway.com/services#persistent-services">Services → persistent services</DocsExternalLink>.

## Queue dashboard (Bull Board)

Super admins can inspect and **manage BullMQ jobs** (pause / resume queues, open jobs, retry, clean, and related controls) from the **web** using <DocsExternalLink href="https://github.com/felixmosh/bull-board">Bull Board</DocsExternalLink> embedded on the <strong>Queue dashboard</strong> page. The **API** mounts the same UI under a configurable path and the **browser** loads it in an iframe so subresource and XHR calls can be authenticated (see below).

### Who can use it

- You must be signed in and have the <strong>super admin</strong> role; see <a href="/docs/developer-guidelines/rbac">RBAC</a> for how roles are modeled. Admin-only API routes use the same auth surface.
- In the app, open the protected area: <code>/secret-admin</code> → <strong>Queue dashboard</strong> in the sidebar (or the same link on the super-admin index).


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
<LinkCard title="Web environment variables" description="VITE_API_BASE_URL and same-origin /api in development" href="/docs/configuration-web/environment" />
<LinkCard title="Railway (workers)" description="CLI, build/start commands, and persistent services" href="/docs/Installation/railway" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, BullMQ transport, and behavior" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Redis" description="REDIS_* shared with cache and BullMQ" href="/docs/configuration-backend/redis" />
<LinkCard title="RBAC" description="Super admin, roles, and permissions" href="/docs/developer-guidelines/rbac" />
<LinkCard title="Production deployment" description="Vercel API + optional worker hosts" href="/docs/Installation/production-deployment" />
</CardGrid>
