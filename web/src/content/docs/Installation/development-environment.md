---
title: Development environment
description: Run the backend and web apps locally, execute tests, database scripts, and deployment commands.
order: 0
lastUpdated: 2026-03-30
---

<script>
import { Callout, Tabs, TabItem, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
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

### Deployment

These commands are run from the **repository root** (they are defined in the root `package.json` and delegate into `backend/` or `web/`).

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
<LinkCard title="Project architecture" description="Monorepo layout, key directories, and how the stack fits together" href="/docs/getting-started/architecture" />
<LinkCard title="Vercel" description="Vercel-focused deployment notes for this project" href="/docs/Installation/vercel" />
</CardGrid>
