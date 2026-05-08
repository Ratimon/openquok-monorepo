---
title: Production deployment
description: Production setup for the OpenQuok web, backend, optional CLI auth server, and optional orchestrator workers.
order: 1
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This project is set up for **Vercel** as the primary host for the **backend** (Express serverless entry), **web** (SvelteKit), and optionally the **CLI auth server** (<Badge text="agent/server" variant="path" /> — device flow for <code>openquok auth:login</code>). **Supabase** remains the database and auth provider for the product API.

**Orchestrator workers** (BullMQ) are **not** run on Vercel: when <code>backend/config/orchestratorFlows.ts</code> uses <code>transport: "bullmq"</code> for **integration refresh**, **notification email**, and/or **scheduled social posts**, deploy **separate always-on processes** (for example on <a href="/docs/installation/railway">Railway</a>) that share the same **Redis** and **Supabase** credentials as the API. See <a href="/docs/configuration-worker">Configuration - Worker</a> and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>.

## What you need

- **Supabase** project (URL, anon key, service role key)
- **Vercel** projects for `backend/`, `web/`, and optionally `agent/server/` (CLI device-flow auth helper — see <a href="/docs/configuration-agent">Configuration - Agent</a>) — or your chosen host(s), with equivalent env injection
- **Recommended:** managed **Redis** for production OAuth flows and BullMQ orchestration — point <Badge text="REDIS_*" variant="envBackend" /> at a host reachable from **both** the API and any worker processes. In production, OAuth connection state must be durable across instances (avoid <Badge text="CACHE_PROVIDER=memory" variant="envBackend" />).
- **Optional:** one or more **worker** hosts for BullMQ flows (see <a href="/docs/installation/railway">Railway (orchestrator workers)</a>)

## Secrets and configuration

- **Never commit** real secrets. Use <Badge text="backend/.env.development.example" variant="path" /> and <Badge text="backend/.env.production.local" variant="path" /> (gitignored) locally; use the **Vercel dashboard** (or another host’s secret store) in production. For the CLI auth server, use <Badge text="agent/server/.env.production.example" variant="envFile" /> as a template and keep production values in <Badge text="agent/server/.env.production.local" variant="envFile" /> or only in Vercel — see <a href="/docs/configuration-agent">Configuration - Agent</a>.
- Mirror the same **variable names** as in <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (via `getEnv` / `getEnvBoolean` / `getEnvNumber`).
- **Public site origin:** set the **same** canonical HTTPS origin on the **backend** as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and on the **web** build as <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> (no trailing slash after the host, for example <Badge text="https://www.openquok.com" variant="new" />). Pick one hostname for “the product” (<code>www</code> or apex) and use it — OAuth redirect URIs are built only from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, and providers such as Meta require an **exact** string match in their dashboards.
- **CORS:** include apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> when both hostnames serve traffic, even though OAuth uses a single canonical origin above. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> (same public API origin in production).
- **Local HTTPS dev** differs: the web app can use an empty <Badge text="VITE_API_BASE_URL" variant="envWeb" /> and same-origin <code>/api</code> through the dev server. See <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit env)</a>.
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

## Next steps

<CardGrid>
<LinkCard title="Vercel" description="Root directory, build, and environment variables" href="/docs/installation/vercel" />
<LinkCard title="Railway (workers)" description="Long-running BullMQ workers, CLI, and monorepo build" href="/docs/installation/railway" />
<LinkCard title="Configuration - Agent" description="CLI auth server env, Vercel deploy, and scaling" href="/docs/configuration-agent" />
<LinkCard title="Configuration - Worker" description="Docker, Redis, Railway, and worker scripts" href="/docs/configuration-worker" />
<LinkCard title="Development environment" description="Local API, web, tests, and DB scripts" href="/docs/installation/development-environment" />
<LinkCard title="Backend configuration" description="Env keys aligned with GlobalConfig" href="/docs/configuration-backend" />
<LinkCard title="Vite (SvelteKit env)" description="VITE_FRONTEND_DOMAIN_URL and matching FRONTEND_DOMAIN_URL" href="/docs/configuration-web/vite" />
<LinkCard title="Frontend configuration" description="Web app configuration hub" href="/docs/configuration-web" />
</CardGrid>
