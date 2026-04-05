---
title: Vercel
description: Deploy Openquok's Application to Vercel — backend/web projects, env vars, CLI, and domains.
order: 2
lastUpdated: 2026-04-02
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

Deploy the **backend** (Express) and **web** (SvelteKit) to <DocsExternalLink href="https://vercel.com">Vercel</DocsExternalLink>.

<Callout type="note" title="Production checklist">
<p>For env vars, CORS, optional Redis, and how integration refresh flows run in-process, start at <a href="/docs/Installation/production-deployment">Production deployment</a>.</p>
</Callout>

## Prerequisites

- <DocsExternalLink href="https://vercel.com/signup">Vercel account</DocsExternalLink>
- <DocsExternalLink href="https://vercel.com/docs/cli">Vercel CLI</DocsExternalLink> (optional — `npx vercel` is enough)

## Backend on Vercel

<Steps>

### Create a new Vercel project

and connect this repository.

### Set Root Directory to <Badge text="backend" variant="path" />

### Configure the build

<Callout type="warning" title="Do not run the Vercel build on your local backend folder">
<p>The build uses <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/vercel.json"><Badge text="backend/vercel.json" variant="path" /></DocsExternalLink>: <code>tsup</code> bundles <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/handler/index.ts"><Badge text="backend/handler/index.ts" variant="path" /></DocsExternalLink> to <Badge text="api/index.js" variant="path" />, and all traffic is rewritten to that serverless function (same Express app as local, via <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/app.ts"><code>createApp</code></DocsExternalLink> in <Badge text="backend/app.ts" variant="path" />; <code>listen()</code> is skipped when <Badge text="VERCEL" variant="envRuntime" /> is set).</p>
<p class="mt-2">Do <strong>not</strong> run that <Badge text="buildCommand" variant="default" /> on your local <Badge text="backend/" variant="path" /> folder: the post-build script deletes source files; it is only safe on Vercel’s ephemeral build machine (or a throwaway clone).</p>
</Callout>

### Set environment variables

Set **Environment Variables** in the Vercel project to match production (same names as <Badge text="backend/.env.production.local" variant="path" />): <Badge text="NODE_ENV" variant="envRuntime" />, Supabase keys, <Badge text="REDIS_*" variant="envBackend" /> (prefix), <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, Stripe, OAuth, Sentry, email, etc.

<Callout type="danger" title="Sensitive environment options">
Don’t forget to mark sensitive variables appropriately in the Vercel project settings where required.
</Callout>

<Callout type="warning" title="CORS and production origins">
<ul class="mt-2 list-disc space-y-1 pl-5">
<li>Set <Badge text="FRONTEND_DOMAIN_URL" variant="envCors" /> <strong>without a trailing slash</strong> (for example <Badge text="https://www.openquok.com" variant="new" />, not <Badge text="https://www.openquok.com/" variant="deprecated" />).</li>
<li>Include both apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envCors" /> (example: <Badge text="https://openquok.com,https://www.openquok.com" variant="new" />).</li>
<li>Keep the web app’s <Badge text="VITE_API_BASE_URL" variant="envWeb" /> pointing to the same backend origin used by <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />.</li>
</ul>
<p class="mt-3">If these do not match, browser preflight for auth endpoints (such as <Badge text="/api/v1/auth/refresh" variant="path" />) can fail with a CORS error.</p>
</Callout>

### Deploy

Deploy from the dashboard (push to the production branch) or from the repository root:

**Deploy backend to Vercel (preview)** — invokes the Vercel CLI with `backend/` as the working directory.

```bash
pnpm vercel:deploy:backend
```

**Deploy backend to Vercel (production)** — same command shape, production target.

```bash
pnpm vercel:deploy:backend:prod
```

After deploy, set <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> to your backend URL (for example <Badge text="https://your-api.vercel.app" variant="new" /> or a custom domain). Point Stripe webhooks and Google OAuth redirect URIs at that URL. Set the web app’s <Badge text="VITE_API_BASE_URL" variant="envWeb" /> to the same backend base URL.

Example CLI prompts (your paths and names may differ):

```text
? Set up and deploy "~/Projects/solo/openquok-monorepo/backend"? yes
? Which scope should contain your project? ratimon's projects
? Link to existing project? no
? What's your project's name? openquok-backend
? In which directory is your code located? ./
Local settings detected in vercel.json:
- Build Command: npx tsup && sh scripts/vercel-clean-after-build.sh
- Install Command: cd .. && pnpm install --frozen-lockfile
- Output Directory: public
> Auto-detected Project Settings for Express

? Want to modify these settings? no
? Do you want to change additional project settings? no
```

</Steps>

## Web on Vercel

<Steps>

### Create a second Vercel project

and connect the same repository.

### Set Root Directory to <Badge text="web" variant="path" />


### Set environment variables

Set **Environment Variables** to match production (same keys as <Badge text="web/.env.production.local" variant="envFile" />): <Badge text="VITE_API_BASE_URL" variant="envWeb" /> (your deployed backend), <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />, <Badge text="VITE_PUBLIC_SUPABASE_*" variant="envWeb" /> (prefix), Stripe and analytics keys as needed.

### Deploy

**Deploy web to Vercel (preview)** — invokes the Vercel CLI with `web/` as the working directory.

```bash
pnpm vercel:deploy:web
```

**Deploy web to Vercel (production)** — same command shape, production target.

```bash
pnpm vercel:deploy:web:prod
```

</Steps>

## Custom domains (e.g. Route 53)

Add each domain in the Vercel project (**Settings → Domains**), create the DNS records Vercel shows (often CNAME to `cname.vercel-dns.com` or A records for apex), then set:

- **Backend:** <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (and ensure CORS allows the frontend origin).
- **Web:** <Badge text="VITE_API_BASE_URL" variant="envWeb" />, <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />.

## Next steps

<CardGrid>
<LinkCard title="Production deployment" description="Vercel, env vars, optional Redis, in-process workflows" href="/docs/Installation/production-deployment" />
<LinkCard title="Development environment" description="Local API, web, tests, and DB scripts" href="/docs/Installation/development-environment" />
<LinkCard title="Backend configuration" description="Environment variables and Supabase setup for the backend package" href="/docs/configuration-backend" />
<LinkCard title="Web configuration" description="Environment variables and Vite/SvelteKit settings for the web app" href="/docs/configuration-web" />
</CardGrid>
