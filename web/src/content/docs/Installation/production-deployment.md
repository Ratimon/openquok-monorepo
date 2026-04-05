---
title: Production deployment
description: Production setup for the OpenQuok web and backend.
order: 1
lastUpdated: 2026-04-03
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This project is set up for **Vercel** as the primary host for the **backend** (Express serverless entry) and **web** (SvelteKit). **Supabase** remains the database and auth provider.


## What you need

- **Supabase** project (URL, anon key, service role key)
- **Vercel** projects for `backend/` and `web/` (or your chosen host, with equivalent env injection)
- **Optional:** managed **Redis** if you set <Badge text="CACHE_PROVIDER" variant="envBackend" /><code>=redis</code> — point <Badge text="REDIS_*" variant="envBackend" /> at your provider

## Secrets and configuration

- **Never commit** real secrets. Use <Badge text="backend/.env.development.example" variant="path" /> and <Badge text="backend/.env.production.local" variant="path" /> (gitignored) locally; use the **Vercel dashboard** (or another host’s secret store) in production.
- Mirror the same **variable names** as in <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (via `getEnv` / `getEnvBoolean` / `getEnvNumber`).
- **CORS:** set <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> without a trailing slash; include apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> when both are used. Align the web app’s <Badge text="VITE_API_BASE_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />.

<Callout type="note" title="Infra folder">
<p><Badge text="infra/README.md" variant="path" /> only documents optional Redis and the in-process workflow model. There is no Docker Compose bundle in this repo.</p>
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
<LinkCard title="Development environment" description="Local API, web, tests, and DB scripts" href="/docs/Installation/development-environment" />
<LinkCard title="Backend configuration" description="Env keys aligned with GlobalConfig" href="/docs/configuration-backend" />
<LinkCard title="Frontend configuration" description="Web app environment variables" href="/docs/configuration-web" />
</CardGrid>
