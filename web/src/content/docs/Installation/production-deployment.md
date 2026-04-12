---
title: Production deployment
description: Production setup for the OpenQuok web, backend, and optional orchestrator workers.
order: 1
lastUpdated: 2026-04-12
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This project is set up for **Vercel** as the primary host for the **backend** (Express serverless entry) and **web** (SvelteKit). **Supabase** remains the database and auth provider.

**Orchestrator workers** (BullMQ) are **not** run on Vercel: when <code>backend/config/orchestratorFlows.ts</code> uses <code>transport: "bullmq"</code> for integration refresh or notification email, deploy **separate always-on processes** (for example on <a href="/docs/Installation/railway">Railway</a>) that share the same **Redis** and **Supabase** credentials as the API. See <a href="/docs/configuration-worker">Orchestrator workers</a> and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>.

## What you need

- **Supabase** project (URL, anon key, service role key)
- **Vercel** projects for `backend/` and `web/` (or your chosen host, with equivalent env injection)
- **Optional:** managed **Redis** if you set <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code> **or** if you use **BullMQ** orchestration — point <Badge text="REDIS_*" variant="envBackend" /> at a host reachable from **both** the API and any worker processes
- **Optional:** one or more **worker** hosts for BullMQ flows (see <a href="/docs/Installation/railway">Railway (orchestrator workers)</a>)

## Secrets and configuration

- **Never commit** real secrets. Use <Badge text="backend/.env.development.example" variant="path" /> and <Badge text="backend/.env.production.local" variant="path" /> (gitignored) locally; use the **Vercel dashboard** (or another host’s secret store) in production.
- Mirror the same **variable names** as in <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (via `getEnv` / `getEnvBoolean` / `getEnvNumber`).
- **Public site origin:** set the **same** canonical HTTPS origin on the **backend** as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and on the **web** build as <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> (no trailing slash after the host, for example <Badge text="https://www.openquok.com" variant="new" />). Pick one hostname for “the product” (<code>www</code> or apex) and use it in both env vars and in the browser address bar—OAuth redirect URIs are built only from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, and providers such as Meta require an **exact** string match in their dashboards.
- **CORS:** include apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> when both hostnames serve traffic, even though OAuth uses a single canonical origin above. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />.

<Callout type="warning" title="Redeploy both apps after changing the public origin">
<p>If you change <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> or <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />, redeploy or restart <strong>both</strong> the API and the web app, then update third-party allow-lists (Meta Instagram or Threads redirect URIs, Stripe return URLs, etc.) so every registered URL uses the same scheme and host as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />.</p>
</Callout>

<Callout type="note" title="Infra folder">
<p><Badge text="infra/README.md" variant="path" /> only documents optional Redis and high-level notes. There is no Docker Compose bundle in this repo. Worker deployment detail lives under <a href="/docs/configuration-worker">Orchestrator workers</a> and <a href="/docs/Installation/railway">Railway</a>.</p>
</Callout>

## Deploy with Vercel

Use the detailed CLI and project settings on <a href="/docs/Installation/vercel">Vercel</a>. From the repository root:

```bash
pnpm vercel:deploy:backend:prod
pnpm vercel:deploy:web:prod
```

After deploy, configure OAuth redirect URIs, webhooks, and any third-party dashboards to use your production API URL.

## Next steps

<CardGrid>
<LinkCard title="Vercel" description="Root directory, build, and environment variables" href="/docs/Installation/vercel" />
<LinkCard title="Railway (workers)" description="Long-running BullMQ workers, CLI, and monorepo build" href="/docs/Installation/railway" />
<LinkCard title="Orchestrator workers" description="Env and scripts for worker processes" href="/docs/configuration-worker" />
<LinkCard title="Development environment" description="Local API, web, tests, and DB scripts" href="/docs/Installation/development-environment" />
<LinkCard title="Backend configuration" description="Env keys aligned with GlobalConfig" href="/docs/configuration-backend" />
<LinkCard title="Web environment variables" description="VITE_FRONTEND_DOMAIN_URL and matching FRONTEND_DOMAIN_URL" href="/docs/configuration-web/environment" />
<LinkCard title="Frontend configuration" description="Web app configuration hub" href="/docs/configuration-web" />
</CardGrid>
