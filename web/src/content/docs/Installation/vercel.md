---
title: Vercel
description: Deploy Openquok's Application to Vercel — backend/web projects, env vars, CLI, and domains.
order: 2
lastUpdated: 2026-04-08
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
<p>The build uses <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/vercel.json"><Badge text="backend/vercel.json" variant="path" /></DocsExternalLink>: <code>tsup</code> bundles <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/handler/index.ts"><Badge text="backend/handler/index.ts" variant="path" /></DocsExternalLink> to <Badge text="api/[[...path]].js" variant="path" /> (optional catch-all so <code>/api/v1/*</code> hits Express; <Badge text="api/index.js" variant="path" /> would only match <code>/api</code>). Do not add a <code>functions</code> pattern for that path in <Badge text="vercel.json" variant="path" /> — Vercel validates those patterns before the build, when the file does not exist yet. Rewrites send other paths to <code>/api</code> per the <DocsExternalLink href="https://vercel.com/kb/guide/using-express-with-vercel">Express on Vercel</DocsExternalLink> pattern. Configure memory or max duration in the Vercel project <strong>Settings → Functions</strong> if needed. Same Express app as local, via <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/app.ts"><code>createApp</code></DocsExternalLink> in <Badge text="backend/app.ts" variant="path" />; <code>listen()</code> is skipped when <Badge text="VERCEL" variant="envRuntime" /> is set).</p>
<p class="mt-2">The post-build step only creates <Badge text="public/" variant="path" /> for <Badge text="outputDirectory" variant="default" /> (placeholder only; no <Badge text="index.html" variant="path" /> — that would make static HTML win for GETs and <strong>POST</strong> return <strong>405</strong> before Express). You can run <Badge text="build:vercel" variant="default" /> locally to verify the bundle.</p>
</Callout>

### Set environment variables

Set **Environment Variables** in the Vercel project to match production (same names as <Badge text="backend/.env.production.local" variant="path" />): <Badge text="NODE_ENV" variant="envRuntime" />, Supabase keys, <Badge text="REDIS_*" variant="envBackend" /> (prefix), <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, Stripe, OAuth, Sentry, email, etc.

<Callout type="danger" title="Sensitive environment options">
Don’t forget to mark sensitive variables appropriately in the Vercel project settings where required.
</Callout>

<Callout type="tip" title="Sync env vars with the Vercel CLI">
You can sync a local env file into your Vercel project (after linking) from the monorepo root:

```bash
pnpm vercel:env:sync:backend:prod
```

This reads <Badge text="backend/.env.production.local" variant="path" /> and upserts keys into the Vercel <code>production</code> environment.
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

<Callout type="note" title="CLI deploy from the repo root (link stays under backend)">
<p><code>pnpm vercel:deploy:backend</code> runs the Vercel CLI from the <strong>repository root</strong> so the full pnpm workspace is uploaded, but it reads <Badge text="backend/.vercel/project.json" variant="path" /> and sets <Badge text="VERCEL_ORG_ID" variant="envRuntime" /> / <Badge text="VERCEL_PROJECT_ID" variant="envRuntime" /> so you are not prompted to <strong>“Set up and deploy”</strong> the monorepo root as a new project.</p>
<p class="mt-2">It uses <Badge text="backend/vercel.json" variant="path" /> with <strong>Root Directory</strong> <Badge text="backend" variant="path" /> in the dashboard (paths are relative to <Badge text="backend/" variant="path" />). The repo-root <Badge text="vercel.backend.json" variant="path" /> is only for a project whose Root Directory is the <strong>repository root</strong> (empty); do not mix that layout with <code>pnpm vercel:deploy:backend</code>.</p>
<p class="mt-2">Link the backend once (creates <Badge text="backend/.vercel" variant="path" />):</p>

```bash
cd backend
npx vercel link
```

<p class="mt-2"><Badge text="backend/.vercel" variant="path" /> is usually gitignored; on a fresh clone, run <code>vercel link</code> again or set <Badge text="VERCEL_ORG_ID" variant="envRuntime" /> and <Badge text="VERCEL_PROJECT_ID" variant="envRuntime" /> before deploy (CI uses the env vars).</p>
</Callout>

**Deploy backend to Vercel (preview)** — from the repo root; uploads the monorepo and installs workspace packages.

```bash
pnpm vercel:deploy:backend
```

**Deploy backend to Vercel (production)** — same command shape, production target.

```bash
pnpm vercel:deploy:backend:prod
```

After deploy, set <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> to your backend URL (for example <Badge text="https://your-api.vercel.app" variant="new" /> or a custom domain). Point Stripe webhooks and Google OAuth redirect URIs at that URL. Set the web app’s <Badge text="VITE_API_BASE_URL" variant="envWeb" /> to the same backend base URL.

Example CLI prompts when running <code>npx vercel link</code> under <Badge text="backend/" variant="path" /> (your paths and names may differ):

```text
? Set up and deploy "~/Projects/.../openquok-monorepo/backend"? yes
? Which scope should contain your project? your-team
? Link to existing project? yes
? What’s the name of your existing project? openquok-backend
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

<Callout type="note" title="CLI deploy from the repo root (link stays under web)">
<p><code>npx vercel --cwd web</code> only uploads <Badge text="web/" variant="path" />, so <Badge text="web/vercel.json" variant="path" />’s <code>cd .. && pnpm install</code> lands outside your repo on Vercel and fails. <code>pnpm vercel:deploy:web</code> runs from the <strong>repository root</strong>, uses <Badge text="web/vercel.json" variant="path" />, and sets <Badge text="VERCEL_ORG_ID" variant="envRuntime" /> / <Badge text="VERCEL_PROJECT_ID" variant="envRuntime" /> from <Badge text="web/.vercel/project.json" variant="path" /> (or from your shell in CI) so you are not prompted to link the monorepo root.</p>
<p class="mt-2">Set <strong>Root Directory</strong> to <Badge text="web" variant="path" /> in the dashboard. The repo-root <Badge text="vercel.web.json" variant="path" /> is only for a project whose Root Directory is the <strong>repository root</strong> (empty); mixing Root <Badge text="web" variant="path" /> with <Badge text="vercel.web.json" variant="path" /> can resolve <code>web/.vercel/output</code> under <code>web/web/…</code> and return <strong>404 NOT_FOUND</strong> (<DocsExternalLink href="https://vercel.com/docs/errors/NOT_FOUND">docs</DocsExternalLink>).</p>
<p class="mt-2">Clear any <strong>Output Directory</strong> override that points at <code>public</code> — SvelteKit + <Badge text="@sveltejs/adapter-vercel" variant="experimental" /> emits the <DocsExternalLink href="https://vercel.com/docs/build-output-api/v3">Build Output API</DocsExternalLink> under <code>web/.vercel/output</code> when Root Directory is <Badge text="web" variant="path" />.</p>
<p class="mt-2">Link the web app once:</p>

```bash
cd web
npx vercel link
```

<p class="mt-2"><Badge text="web/.vercel" variant="path" /> is usually gitignored; on a fresh clone, run <code>vercel link</code> again or set <Badge text="VERCEL_ORG_ID" variant="envRuntime" /> and <Badge text="VERCEL_PROJECT_ID" variant="envRuntime" /> before <code>pnpm vercel:deploy:web</code> (same pattern as CI).</p>

</Callout>

**Deploy web to Vercel (preview)** — from the repo root; installs with pnpm at the monorepo root and builds the <Badge text="web" variant="experimental" /> workspace package.

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
