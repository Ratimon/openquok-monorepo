---
title: Development environment
description: Run Openquok's agent, backend, workers and web apps locally, execute tests, database scripts, and deployment commands.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, Tabs, TabItem, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

<Callout type="warning">
Use this page once prerequisites (see <a href="/docs/getting-started-for-dev/quick-start">Quick start</a>) and <a href="/docs/configuration-backend">backend</a> / <a href="/docs/configuration-web">web</a> configurations are in place. The sections below assume you run commands from the <strong>repository root</strong> unless noted.
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

<Callout type="note" title="Optional: connectivity smoke tests">
<p>Some integration tests are designed to verify connectivity for third-party services (for example R2 or Redis). These tests are <strong>disabled by default</strong> to avoid accidental calls to production.</p>
<p>To enable them, set the flags below when running the test:</p>
<ul>
  <li><Badge text="THIRD_PARTY_TESTS_REDIS=true" variant="envBackend" /></li>
  <li><Badge text="THIRD_PARTY_TESTS_R2=true" variant="envBackend" /></li>
</ul>
<p>Run the third-party suite directly (recommended):</p>
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
<p>The web dev server serves <strong>HTTPS</strong> at <code>https://localhost:5173</code>. Keep <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> and the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on that exact origin, and follow <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit) → HTTPS local development and the API base URL</a> so API calls and auth cookies stay same-origin.</p>
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
<p>Use <a href="/docs/getting-started-for-cli">CLI</a> and <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a> to install the CLI, run <code>openquok auth:login</code>, and set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" />. Server-side env (<Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, OAuth keys) is covered under <a href="/docs/configuration-agent">Configuration - Agent</a>.</p>
</Callout>


- Creating / rotating client ID + secret (operator/admin): <a href="/docs/admin/oauth-server">Admin — OAuth Server</a>

**Run local Postgres (auth server state)** — the auth server stores device-flow state in Postgres:

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d postgres
```

Then set <Badge text="DATABASE_URL" variant="envBackend" /> in <Badge text="agent/server/.env.development.local" variant="envBackend" /> to match (defaults to <code>postgresql://openquok:openquok@localhost:5432/openquok_cli_auth</code>).

**Run the CLI auth server locally**:

```bash
# From repo root
pnpm agent-server:dev
```

Once running, point the CLI at it via <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> or <code>--authServer</code> — see <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.


### Running the CLI from the monorepo (unpublished)

Published installs use the global <code>openquok</code> command — see <a href="/docs/getting-started-for-cli">CLI</a>. If <Badge text="@openquok/auto-cli" variant="experimental" /> is **not** installed from npm yet, three monorepo-local paths are available. Pick based on whether you want to skip the build step:

<Callout type="note" title="The pnpm `--` separator">
<p>pnpm consumes flags it recognizes (<code>--help</code>, <code>--filter</code>, <code>--recursive</code>, …) <strong>before</strong> running your script. To forward arguments to the underlying command, put a bare <code>--</code> between the pnpm script name and your arguments. Without it, <code>pnpm --filter ./agent cli --help</code> prints pnpm's help, not the CLI's.</p>
</Callout>

**Run from source (recommended for daily dev)** — uses the <code>cli</code> script (`tsx src/index.ts`); no build needed, picks up source changes on every invocation:

```bash
pnpm --filter ./agent cli -- --help
pnpm --filter ./agent cli -- integrations:trigger --help
pnpm --filter ./agent cli -- auth:login --authServer http://localhost:3111
```

Per-command <code>--help</code> shows the <code>Examples:</code> section with copy-pasteable invocations for non-obvious payloads (JSON `--data`, ISO timestamps, etc.).

**Run the compiled binary** — useful when you want to confirm the published bundle behaves the same:

```bash
pnpm --filter ./agent build
node agent/dist/index.js auth:login --authServer http://localhost:3111
```

**Run the compiled binary via the `start` script** — same end result, slightly tidier:

```bash
pnpm --filter ./agent build
pnpm --filter ./agent start -- auth:login --authServer http://localhost:3111
```

**Smoke-test the CLI surface** — after adding or renaming commands under <Badge text="agent/src/commands/" variant="path" />, verify every group is wired into <code>registerAllCommands</code> and responds to <code>--help</code>:

```bash
# 1. Top-level groups: should list integrations, posts, analytics, notifications,
#    upload, upload-from-url, and auth verbs
pnpm --filter ./agent cli -- --help

# 2. Each group must respond to --help with its yargs Examples: block
pnpm --filter ./agent cli -- analytics:platform --help
pnpm --filter ./agent cli -- analytics:post --help
pnpm --filter ./agent cli -- notifications:list --help
pnpm --filter ./agent cli -- posts:delete --help
pnpm --filter ./agent cli -- posts:missing --help
pnpm --filter ./agent cli -- posts:connect --help
pnpm --filter ./agent cli -- upload-from-url --help
```

**Connectivity smoke** — requires a valid API key or stored credentials. Confirms auth + workspace plumbing end-to-end against a running backend:

```bash
pnpm --filter ./agent cli -- auth:status
pnpm --filter ./agent cli -- integrations:list | jq '.[] | {id, identifier}'
pnpm --filter ./agent cli -- notifications:list --page 0 | jq '.total'
```

Every command emits machine-readable JSON on stdout, so piping into <code>jq</code> is the recommended way to assert on shape during smoke runs and CI.

<Callout type="note" title="Iterating on yargs definitions">
<p>If you're changing positional descriptions or <code>.example()</code> calls in <Badge text="agent/src/commands/" variant="path" />, run <code>pnpm --filter ./agent dev</code> — it watches the source and re-prints <code>--help</code> on every save, which is the fastest feedback loop for tweaking help text.</p>
</Callout>

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
<LinkCard title="Production deployment" description="Full production sequence: backend and web env, CORS, Vercel deploy commands from this page" href="/docs/installation/production-deployment" />
<LinkCard title="Configuration - Backend" description="Database migrations, pg_cron, Redis cache, and production-linked Supabase commands referenced above" href="/docs/configuration-backend" />
<LinkCard title="Vite & web env" description="HTTPS on localhost, Vite variables, and aligning the API base URL with the backend" href="/docs/configuration-web/vite" />
<LinkCard title="Docker (local services)" description="Redis and Postgres via Compose—matches the optional Redis, worker, and auth-server sections" href="/docs/configuration-backend/docker" />
<LinkCard title="Configuration - Agent" description="CLI auth server env, OAuth callbacks, and `SERVER_URL` for local device flow" href="/docs/configuration-agent" />
<LinkCard title="Configuration - Worker" description="BullMQ workers, orchestrator processes, and Redis queues beyond the API" href="/docs/configuration-worker" />
<LinkCard title="Admin — OAuth Server" description="Create or rotate OAuth client ID and secret for the device-flow auth server" href="/docs/admin/oauth-server" />
</CardGrid>
