---
title: Development environment
description: Run Openquok's backend and web apps locally, execute tests, database scripts, and deployment commands.
order: 0
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, Tabs, TabItem, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

<Callout type="warning">
Use this page once prerequisites (see <a href="/docs/getting-started/quick-start">Quick start</a>) and <a href="/docs/configuration-backend">backend</a> / <a href="/docs/configuration-web">web</a> configurations are in place. The sections below assume you run commands from the <strong>repository root</strong> unless noted.
</Callout>

### Backend local development

You can work from the **monorepo root** (using scripts defined in the root `package.json` that delegate to `backend/`) or **change into `backend/`** and run the same scripts locally. Pick one style and stick with it.

<Callout type="note" title="Cron jobs (expired refresh tokens)">
Some backend features rely on scheduled jobs backed by <code>pg&#95;cron</code> on Supabase.
For example, the `user-auth` module periodically removes expired rows from `public.refresh_tokens` (every Saturday at **3:30 AM GMT**).
If you deploy to Supabase Cloud and cron is not enabled, those jobs won’t run even if migrations are pushed.
See <a href="/docs/configuration-backend/database">Database & migrations</a> for pg_cron setup and migration-push commands.
</Callout>

<Tabs items={["Repository root", "In backend"]}>
<TabItem label="Repository root">

**Start the API** — runs the backend dev server (`tsx watch` on `app.ts` with `NODE_ENV=development`).

```bash
pnpm backend:dev
```

**Tests** — Jest unit, integration, and e2e suites for the backend package.

```bash
pnpm backend:test:unit
pnpm backend:test:integration
pnpm backend:test:e2e
```

<Callout type="note" title="Optional: third-party connectivity smoke tests (opt-in)">
<p>Some integration tests are designed to verify connectivity to managed third-party services (for example Cloudflare R2 or managed Redis). These tests are <strong>disabled by default</strong> to avoid accidental calls to production services during everyday local development or CI.</p>
<p>To enable them, set the opt-in flags below when running the test file:</p>
<ul>
  <li><Badge text="THIRD_PARTY_TESTS_REDIS=true" variant="envBackend" /></li>
  <li><Badge text="THIRD_PARTY_TESTS_R2=true" variant="envBackend" /></li>
</ul>
<p>Run the third-party suite directly (recommended) instead of the full integration folder:</p>
</Callout>

```bash
pnpm --filter ./backend test:integration:third-parties:r2
```

**Aggregate SQL migrations** — builds the combined migration output used by the repo (see `backend/scripts/aggregate_migrations_all.mjs`).

```bash
pnpm backend:db:aggregate-migrations-all
```

**Generate TypeScript types from local Supabase** — writes generated table types for the backend (local `supabase` CLI).

```bash
pnpm backend:db:typegen
```

**Production-linked Supabase** — there is no root alias for these; call the backend package from the root with `pnpm --filter`:

```bash
pnpm --filter ./backend db:production:typegen
pnpm --filter ./backend db:production:push-db
```

</TabItem>
<TabItem label="In backend">

**Change directory** — run the following from `backend/` after installing dependencies from the repo root (`pnpm install` at the root).

```bash
cd backend
```

**Start the API** — same behavior as `pnpm backend:dev` from the root.

```bash
pnpm dev
```

**Tests** — Jest unit, integration, and e2e suites.

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

**Aggregate SQL migrations**

```bash
pnpm db:aggregate-migrations-all
```

**Generate TypeScript types from local Supabase** — equivalent to `pnpm backend:db:typegen` at the root.

```bash
pnpm db:local:typegen
```

**Production-linked Supabase** — generate types against the linked remote project and push schema changes.

```bash
pnpm db:production:typegen
pnpm db:production:push-db
```

</TabItem>
</Tabs>

### Frontend local development

<Callout type="warning">
Run the <strong>backend API</strong> before the web app so local pages can call your API. In a <strong>separate terminal</strong>, start the API from the repository root with <code>pnpm backend:dev</code> (or <code>cd backend</code> then <code>pnpm dev</code>), then use the commands below for the frontend.
</Callout>

<Callout type="note" title="HTTPS on localhost">
<p>The web dev server serves <strong>HTTPS</strong> at <code>https://localhost:5173</code>. Keep <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> and the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on that exact origin, and follow <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit env) → HTTPS local development and the API base URL</a> so API calls and auth cookies stay same-origin.</p>
</Callout>

You can work from the **monorepo root** (using `web:*` and `pnpm --filter ./web …` scripts) or **change into `web/`** and run package scripts there.

<Tabs items={["Repository root", "In web"]}>
<TabItem label="Repository root">

**Start the SvelteKit app** — runs icon generation then the Vite dev server (`pnpm web:dev` in the root `package.json`).

```bash
pnpm web:dev
```

**Tests** — Vitest unit tests for the `web` package.

```bash
pnpm --filter ./web test:unit
```

**Preview production build** — serves the last `vite build` output locally (build from `web/` first if you need a fresh bundle).

```bash
pnpm --filter ./web preview
```

</TabItem>
<TabItem label="In web">

**Change directory** — run the following from `web/` after installing dependencies from the repo root.

```bash
cd web
```

**Start the app** — same behavior as `pnpm web:dev` from the root.

```bash
pnpm dev
```

**Tests**

```bash
pnpm test:unit
```

**Preview production build**

```bash
pnpm preview
```

</TabItem>
</Tabs>

### Optional Redis (cache)

If you use <code>CACHE_PROVIDER=redis</code>, run Redis locally or use a managed instance and set <code>REDIS_HOST</code>, <code>REDIS_PORT</code>, and password fields to match.

- Local Docker: <a href="/docs/configuration-backend/docker">Docker (local services)</a>
- Full Redis config: <a href="/docs/configuration-backend/redis">Redis cache</a>

**Workflow-style jobs** can run in the API process (Flowcraft), but the repo also ships **long-running workers** under <Badge text="orchestrator/" variant="path" /> for BullMQ-backed queues. See the worker section below if you enable BullMQ transport.

### Optional worker processes (BullMQ / orchestrator)

If you configure orchestrator flows to use BullMQ, the API enqueues jobs to Redis and **separate worker processes** execute them.

<Callout type="note" title="When you need this">
Enable workers when you want long-running background work (for example scheduled social post publishing) to run outside the API process. In production, run workers on an always-on host (see <a href="/docs/configuration-worker">Configuration - Worker</a>).
</Callout>

**Run local Redis (BullMQ)** — quickest path is Docker Compose:

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d redis
```

**Start a worker locally** — each worker is its own process:

```bash
# From repo root
pnpm orchestrator:dev:worker:integration-refresh-bullmq
pnpm orchestrator:dev:worker:notification-email-bullmq
pnpm orchestrator:dev:worker:scheduled-social-post-bullmq
```

Worker env and Redis queue details live in <a href="/docs/configuration-worker/docker">Configuration → Worker → Docker (local Redis)</a>.

### Optional CLI auth server (device flow)

The CLI auth server (<Badge text="agent/server" variant="path" />) implements the OAuth2 device flow used by <code>openquok auth:login</code>. Most developers can use the hosted server by default, but you can run it locally for end-to-end testing.

<Callout type="note" title="CLI and auth server docs">
<p>Use <a href="/docs/cli">CLI</a> and <a href="/docs/cli/authentication">CLI authentication</a> to install the CLI, run <code>openquok auth:login</code>, and set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" />. Server-side env (<Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, OAuth keys) is covered under <a href="/docs/configuration-agent">Configuration - Agent</a>.</p>
</Callout>


- Creating / rotating client ID + secret (operator/admin): <a href="/docs/admin/oauth-server">Admin — OAuth Server</a>

**Run local Postgres (auth server state)** — the auth server stores device-flow state in Postgres:

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d postgres
```

Then set <Badge text="DATABASE_URL" variant="envBackend" /> in <Badge text="agent/server/.env.development.local" variant="envFile" /> to match (defaults to <code>postgresql://openquok:openquok@localhost:5432/openquok_cli_auth</code>).

**Run the CLI auth server locally**:

```bash
# From repo root
pnpm agent-server:dev
```

Once running, point the CLI at it via <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> or <code>--authServer</code> — see <a href="/docs/cli/authentication">CLI authentication</a>.


### Running the CLI from the monorepo (unpublished)

Published installs use the global <code>openquok</code> command — see <a href="/docs/cli">CLI</a>. If <Badge text="@openquok/auto-cli" variant="experimental" /> is **not** installed from npm yet, build the CLI package and run the compiled entrypoint **from the repository root**:

```bash
pnpm --filter ./agent build
node agent/dist/index.js auth:login --authServer http://localhost:3111
```

Same flow using the package <code>start</code> script (arguments after <code>--</code> are forwarded to the CLI):

```bash
pnpm --filter ./agent build
pnpm --filter ./agent start -- auth:login --authServer http://localhost:3111
```

<Callout type="note" title="Local auth server">
<p>Run the CLI auth server (<Badge text="agent/server" variant="path" />) so <Badge text="http://localhost:3111" variant="default" /> is reachable — from the repo root, <code>pnpm agent-server:dev</code> is typical. Match your OAuth app callback to <Badge text="http://localhost:3111/device/callback" variant="default" /> and keep <Badge text="SERVER_URL" variant="envBackend" /> aligned — see <a href="/docs/configuration-agent#environment-variables">Configuration → Agent → Environment variables</a>.</p>
</Callout>

### Deployment

For a **full production sequence** (backend env, web env, CORS), use <a href="/docs/installation/production-deployment">Production deployment</a>. The commands below are quick references from the **repository root** (see root <code>package.json</code>).

**Backend JS bundle** — runs `tsup` in `backend/` to produce the bundled API output used for deploys.

```bash
pnpm --filter ./backend build:js
```

**Deploy backend to Vercel** — invokes the Vercel CLI with `backend/` as the working directory.

```bash
pnpm vercel:deploy:backend
```

**Deploy web to Vercel** — invokes the Vercel CLI with `web/` as the working directory.

```bash
pnpm vercel:deploy:web
```

## Next Steps

<CardGrid>
<LinkCard title="Production deployment" description="Backend and web on Vercel, env and optional Redis" href="/docs/installation/production-deployment" />
<LinkCard title="CLI" description="Install the CLI, authentication, and programmatic commands" href="/docs/cli" />
<LinkCard title="Configuration - Agent" description="Deploy and configure the CLI auth server (agent/server)" href="/docs/configuration-agent" />
<LinkCard title="Configuration - Worker" description="Redis/BullMQ workers, Bull Board, and Railway" href="/docs/configuration-worker" />
<LinkCard title="Project architecture" description="Monorepo layout, key directories, and how the stack fits together" href="/docs/getting-started/architecture" />
<LinkCard title="Vercel" description="Vercel CLI and project settings detail" href="/docs/installation/vercel" />
</CardGrid>
