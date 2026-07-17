---
title: Production - deployment
description: Production setup for the OpenQuok web, backend, optional CLI auth server, and optional orchestrator workers.
order: 1
lastUpdated: 2026-07-16
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This project is set up for **Vercel**  for the **backend** (Express.js), **web** (SvelteKit), and optionally the **CLI auth server** (<Badge text="agent/server" variant="path" /> — device flow for <code>openquok auth:login</code>). **Supabase** remains the database and auth provider for the API.

**Orchestrator workers** (BullMQ) are **not** run on Vercel. We deploy **separate always-on processes** (for example on <a href="/docs/installation/railway">Railway</a>) that share the same **Redis** and **Supabase** credentials as the API. See <a href="/docs/configuration-worker">Configuration - Worker</a> and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>.

<Callout type="tip" title="Self-host">
<p>To run API, web, Redis, and BullMQ workers on your own host from this monorepo (instead of Vercel + Railway), follow <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. That path still needs an operator-provided Supabase project; see <a href="/docs/installation/system-requirements">System requirements</a>.</p>
</Callout>

## What you need

- **Supabase** project (URL, anon key, service role key)
- **Vercel** projects for `backend/`, `web/`, and optionally `agent/server/` (CLI device-flow auth helper — see <a href="/docs/configuration-agent">Configuration - Agent</a>) — or your chosen host(s), with equivalent env injection
- **Recommended:** managed **Redis** for production OAuth flows and BullMQ orchestration — point <Badge text="REDIS_*" variant="envBackend" /> at a host reachable from **both** the API and any worker processes. In production, OAuth connection state must be durable across instances (avoid <Badge text="CACHE_PROVIDER=memory" variant="envBackend" />).
- **Optional:** one or more **worker** hosts for BullMQ flows (see <a href="/docs/installation/railway">Railway (orchestrator workers)</a>)

## Secrets and configuration

- **Never commit** real secrets. Use <Badge text="backend/.env.development.example" variant="path" /> and <Badge text="backend/.env.production.local" variant="path" /> (gitignored) locally; use the **Vercel dashboard** (or another host’s secret store) in production. For the CLI auth server, use <Badge text="agent/server/.env.production.example" variant="envBackend" /> as a template and keep production values in <Badge text="agent/server/.env.production.local" variant="envBackend" /> or only in Vercel — see <a href="/docs/configuration-agent">Configuration - Agent</a>.
- Mirror the same **variable names** as in <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (via `getEnv` / `getEnvBoolean` / `getEnvNumber`).
- **Public site origin:** set the **same** canonical HTTPS origin on the **backend** as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and on the **web** build as <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> (no trailing slash after the host, for example <Badge text="https://www.openquok.com" variant="new" />). Pick one hostname for “the product” (<code>www</code> or apex) and use it — OAuth redirect URIs are built only from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, and providers such as Meta require an **exact** string match in their dashboards.
- **CORS:** include apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> when both hostnames serve traffic, even though OAuth uses a single canonical origin above. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> (same public API origin in production).
- **Local HTTPS dev** differs: the web app can use an empty <Badge text="VITE_API_BASE_URL" variant="envWeb" /> and same-origin <code>/api</code> through the dev server. See <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit)</a>.
- **Media publishing (Threads, etc.)**: for posts with media stored as object keys, set <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> so workers can build public HTTPS URLs for Meta to fetch. See <a href="/docs/configuration-backend/cloudflare-r2">R2 or local storage</a>.

<Callout type="warning">
<p>If you change <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> or <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />, redeploy or restart <strong>both</strong> the API and the web app, then update third-party allow-lists (Meta Instagram or Threads redirect URIs, Stripe return URLs, etc.) so every registered URL uses the same scheme and host as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />.</p>
</Callout>


## Deploy with Vercel

Use the detailed CLI and project settings on <a href="/docs/installation/vercel">Vercel</a>. From the repository root:

```bash
pnpm vercel:env:sync:web:prod
pnpm vercel:env:sync:backend:prod
pnpm vercel:env:sync:agent-server:prod
```

```bash
pnpm vercel:deploy:backend:prod
pnpm vercel:deploy:web:prod
pnpm vercel:deploy:agent-server:prod
```

After deploy, configure OAuth redirect URIs, webhooks, and any third-party dashboards to use your production API URL.

## Deploy orchestrator workers (Railway)

Workers are required when you configure BullMQ transports . Use <a href="/docs/configuration-worker/railway">Configuration → Worker → Railway (workers)</a> for the full CLI flow and service management details.

<Callout type="warning">
When deploying multiple workers, you must run <code>railway service</code> to select the correct Railway service. The deploy scripts (<code>pnpm railway:deploy:…</code>) run <code>railway up</code> and will deploy to the <strong>currently linked</strong> service—if you forget to switch, you may deploy the wrong worker to the wrong service.
</Callout>

From the repository root, set up / deploy one persistent service per worker:

```bash
# One-time: create services + set production env vars
pnpm railway:setup:integration-refresh
pnpm railway:setup:notification-email
pnpm railway:setup:scheduled-social-post
```

```bash
# Update env (safe to re-run)
pnpm railway:env:sync:integration-refresh:prod
pnpm railway:env:sync:notification-email:prod
pnpm railway:env:sync:scheduled-social-post:prod
```

```bash
# Deploy each worker (Railway CLI must be linked to the target service)
pnpm railway:deploy:integration-refresh
pnpm railway:deploy:notification-email
pnpm railway:deploy:scheduled-social-post
```

## Next steps

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Self-host with docker compose" href="/docs/installation/docker-compose" />
<LinkCard title="Vercel" description="Separate projects for backend, web, and agent/server—matches the deploy and env sync commands above" href="/docs/installation/vercel" />
<LinkCard title="Railway (orchestrator workers)" description="CLI linking, env sync, and deploy scripts for BullMQ workers—referenced in the workers section" href="/docs/configuration-worker/railway" />
<LinkCard title="Configuration - Agent" description="CLI auth server secrets, Vercel root directory, and production OAuth callbacks" href="/docs/configuration-agent" />
<LinkCard title="Configuration - Worker" description="Redis for BullMQ, worker processes, and Railway alongside the API" href="/docs/configuration-worker" />
<LinkCard title="Configuration - Backend" description="GlobalConfig env vars, Redis, Supabase, and R2 public URLs for worker media links" href="/docs/configuration-backend" />
<LinkCard title="Vite (SvelteKit)" description="Canonical `VITE_FRONTEND_DOMAIN_URL`, API base URL, and CORS alignment with the backend" href="/docs/configuration-web/vite" />
</CardGrid>
