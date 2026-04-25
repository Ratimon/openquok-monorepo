---
title: Development environment
description: Run Openquok's backend and web apps locally, execute tests, database scripts, and deployment commands.
order: 0
lastUpdated: 2026-04-24
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

<Callout type="note" title="HTTPS on localhost:5173">
<p>The web dev server serves <strong>HTTPS</strong> at <code>https://localhost:5173</code>. Keep <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> and the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on that exact origin, and follow <a href="/docs/configuration-web/environment#https-local-development-and-the-api-base-url">Environment variables → HTTPS local development and the API base URL</a> so API calls and auth cookies stay same-origin.</p>
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

**Workflow-style jobs** (e.g. integration refresh orchestration) run **in the API process** via Flowcraft (<Badge text="backend/flowcraft/" variant="path" />); there is no separate worker script in this repo.

### Deployment

For a **full production sequence** (backend env, web env, CORS), use <a href="/docs/Installation/production-deployment">Production deployment</a>. The commands below are quick references from the **repository root** (see root <code>package.json</code>).

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
<LinkCard title="Production deployment" description="Backend and web on Vercel, env and optional Redis" href="/docs/Installation/production-deployment" />
<LinkCard title="Project architecture" description="Monorepo layout, key directories, and how the stack fits together" href="/docs/getting-started/architecture" />
<LinkCard title="Vercel" description="Vercel CLI and project settings detail" href="/docs/Installation/vercel" />
</CardGrid>
