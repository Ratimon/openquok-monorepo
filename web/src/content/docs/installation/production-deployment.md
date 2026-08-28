---
title: Production - deployment
description: Production setup for the OpenQuok web, backend, optional CLI auth server, and optional orchestrator workers.
order: 1
lastUpdated: 2026-08-28
---

<script>
import { Badge, Callout, DocsExternalLink, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

The production version (openquok.com) is set up for **Vercel**  for the **backend** (Express.js), **web** (SvelteKit), and optionally the **CLI auth server** (<Badge text="agent/server" variant="path" /> — OAuth device flow. **Supabase** remains the database and auth provider for the API.

**Orchestrator workers** (BullMQ) are **not** run on Vercel. We deploy **separate always-on processes** (for example on <a href="/docs/installation/railway">Railway</a>) that share the same **Redis** and **Supabase** credentials as the API. See <a href="/docs/configuration-worker">Configuration - Worker</a> and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>.

<Callout type="tip" title="Self-host">
<p>To run API, web, Redis, and BullMQ workers on your own host from this monorepo, follow <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. After <code>docker compose … up --build</code>, open the UI at <code>http://localhost:4007</code> (API at <code>http://localhost:3000</code>). That path still needs an operator-provided Supabase project; see <a href="/docs/installation/system-requirements">System requirements</a>.</p>
</Callout>

## What you need

- **Supabase** project (URL, anon key, service role key)
- **Vercel** projects for `backend/`, `web/`, and optionally `agent/server/` (CLI device-flow auth helper — see <a href="/docs/configuration-agent">Configuration - Agent</a>)
- **Recommended:** managed **Redis** for production OAuth flows and BullMQ orchestration. In production, OAuth connection state must be durable across instances (avoid <Badge text="CACHE_PROVIDER=memory" variant="envBackend" />).
- **Optional:** one or more **worker** hosts for BullMQ flows (see <a href="/docs/installation/railway">Railway (orchestrator workers)</a>)

## Secrets and configuration

- **Never commit** real secrets. Use <Badge text="backend/.env.development.example" variant="path" /> and <Badge text="backend/.env.production.local" variant="path" /> locally; use the **Vercel dashboard** in production. For the CLI auth server, use <Badge text="agent/server/.env.production.example" variant="envBackend" /> as a template and keep production values in <Badge text="agent/server/.env.production.local" variant="envBackend" /> — see <a href="/docs/configuration-agent">Configuration - Agent</a>.
- Mirror the same **variable names** as in <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (via `getEnv` / `getEnvBoolean` / `getEnvNumber`).
- **Public site origin:** set the **same** canonical HTTPS origin on the **backend** as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and on the **web** build as <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> (no trailing slash after the host, for example <Badge text="https://www.openquok.com" variant="new" />). Pick one hostname for “the product” (<code>www</code> or apex) and use it — OAuth redirect URIs are built only from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, and providers such as Meta require an **exact** string match in their dashboards.
- **CORS:** include apex and <code>www</code> in <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> when both hostnames serve traffic, even though OAuth uses a single canonical origin above. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> with <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> (same public API origin in production).
- **Local HTTPS dev** differs: the web app can use an empty <Badge text="VITE_API_BASE_URL" variant="envWeb" /> and same-origin <code>/api</code> through the dev server. See <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit)</a>.
- **Media publishing (Threads, etc.)**: for posts with media stored as object keys, set <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> so workers can build public HTTPS URLs for Meta to fetch. See <a href="/docs/configuration-backend/cloudflare-r2">R2 or local storage</a>.

<Callout type="warning">
<p>If you change <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> or <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" />, redeploy or restart <strong>both</strong> the API and the web app, then update third-party allow-lists (Meta Instagram or Threads redirect URIs, Stripe return URLs, etc.) so every registered URL uses the same scheme and host as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />.</p>
</Callout>

## Supabase production migrations

Run schema changes when a release adds tables or RLS under <Badge text="backend/supabase/db/" variant="path" />. Re-aggregate locally first:

```bash
pnpm backend:db:aggregate-migrations-all
```

From <Badge text="backend/" variant="path" /> (linked to your production project):

```bash
cd backend
pnpm db:production:migration-list
```

<Callout type="note" title="Two ways to apply migrations">
<p><strong>CLI push</strong> — runs the aggregated file under <Badge text="backend/supabase/migrations/" variant="path" /> (large; can time out on Supabase Cloud):</p>
</Callout>

```bash
pnpm db:production:push-db:dry-run
pnpm db:production:push-db
```

<Callout type="tip">
<p>Paste SQL from the module folder (e.g. <Badge text="backend/supabase/db/acquisition/" variant="path" />) into the <strong>Supabase Dashboard → SQL Editor</strong>. Prefer one script that includes <strong>tables, indexes, and RLS</strong> in a single <code>BEGIN … COMMIT</code> block so Row Level Security is enabled immediately. If the dashboard warns that a table is created without RLS, either run the RLS script in the same batch.</p>

<p>After the SQL succeeds, mark the matching aggregated migration as applied so <code>migration list</code> stays in sync with the remote (use the <strong>date segment</strong> from the filename, e.g. <Badge text="20260828" variant="param" /> from <Badge text="20260828_core_structure.sql" variant="path" />):</p>
</Callout>

```bash
npx supabase@latest migration repair --linked --status applied 20260828
pnpm db:production:migration-list
```

<Callout type="warning" title="Do not revert old migration rows">
<p>If production already has an earlier aggregated migration recorded, only <strong>add</strong> the new version as <code>applied</code>. Do not run <code>repair --status reverted</code> on migrations that are already live unless you are deliberately rolling back schema.</p>
</Callout>

Optional — refresh backend table types from the linked project:

```bash
pnpm db:production:typegen
```

See also <a href="/docs/configuration-backend/database">Database &amp; migrations</a> for local workflow, aggregation, and <code>pg_cron</code> notes.

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
When deploying multiple workers, you must run <code>railway service</code> to select the correct Railway service. 
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

## Optional: publish npm packages (SDK + CLI)

Skip this section when the release only changes the dashboard, API, or workers — npm users are unaffected.

When a release changes the <strong>public API</strong> (<Badge text="sdk/" variant="path" />) or the <strong>CLI</strong> (<Badge text="agent/" variant="path" />), publish <strong>after</strong> the API is live on production and <strong>after</strong> you commit the shipped code to <code>main</code>. Bump versions in the same release commits so git, tags, and npm stay aligned.


### 1. Pre-flight (feature commit)

Commit everything that Vercel already deployed (or will deploy):

```bash
git add -A
git commit -m "feat: …"
git push origin main
```

### 2. Bump versions and tag (CI publish — recommended)

Match <Badge text="version" variant="param" /> in each package to the tag you will push. CI (`.github/workflows/release.yml`) publishes on tag push via npm trusted publishing.

**SDK** (<Badge text="@openquok/node-sdk" variant="default" />) — bump <Badge text="sdk/package.json" variant="path" />, then:

```bash
git add sdk/
git commit -m "chore(sdk): release 0.0.12"
git push origin main
git tag sdk-v0.0.12
git push origin sdk-v0.0.12
```

**CLI** (<Badge text="@openquok/auto-cli" variant="default" />) — bump <Badge text="agent/package.json" variant="path" />, then:

```bash
git add agent/
git commit -m "chore(cli): release 0.0.15"
git push origin main
git tag cli-v0.0.15
git push origin cli-v0.0.15
```

Preview release notes before tagging (from repo root):

```bash
pnpm release:notes sdk-v0.0.12
pnpm release:notes cli-v0.0.15
```

Full checklists: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/PUBLISHING.md">sdk/PUBLISHING.md</DocsExternalLink> and <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/PUBLISHING.md">agent/PUBLISHING.md</DocsExternalLink>.

### 3. Manual publish (alternative)

If you are not using tag-driven CI, bump <Badge text="version" variant="param" /> in <Badge text="sdk/package.json" variant="path" /> and/or <Badge text="agent/package.json" variant="path" />, commit and push to <code>main</code>, then from the monorepo root:

```bash
pnpm publish:sdk:build
pnpm publish:sdk:manual

pnpm publish:cli:build
pnpm publish:cli:manual
```

Requires <code>npm login</code> locally. Prefer tags + CI when trusted publishing is configured.

<Callout type="warning" title="Not agent/server">
<p><Badge text="agent/server" variant="path" /> (Vercel device-flow auth) is <strong>not</strong> the npm CLI. Deploy it with <code>pnpm vercel:deploy:agent-server:prod</code> only when <Badge text="agent/server/" variant="path" /> changes — not as part of <Badge text="@openquok/auto-cli" variant="default" /> publish.</p>
</Callout>

## Next steps

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Self-host with docker compose" href="/docs/installation/docker-compose" />
<LinkCard title="Vercel" description="Separate projects for backend, web, and agent/server—matches the deploy and env sync commands above" href="/docs/installation/vercel" />
<LinkCard title="Railway (orchestrator workers)" description="CLI linking, env sync, and deploy scripts for BullMQ workers—referenced in the workers section" href="/docs/configuration-worker/railway" />
<LinkCard title="Configuration - Agent" description="CLI auth server secrets, Vercel root directory, and production OAuth callbacks" href="/docs/configuration-agent" />
<LinkCard title="Configuration - Worker" description="Redis for BullMQ, worker processes, and Railway alongside the API" href="/docs/configuration-worker" />
<LinkCard title="Database &amp; migrations" description="Local Supabase CLI, aggregation, pg_cron, and production-linked commands" href="/docs/configuration-backend/database" />
<LinkCard title="Configuration - Backend" description="GlobalConfig env vars, Redis, Supabase, and R2 public URLs for worker media links" href="/docs/configuration-backend" />
<LinkCard title="Vite (SvelteKit)" description="Canonical `VITE_FRONTEND_DOMAIN_URL`, API base URL, and CORS alignment with the backend" href="/docs/configuration-web/vite" />
</CardGrid>
