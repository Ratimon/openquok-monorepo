---
title: Project Architecture
description: OpenQuok's architecture — project layout and key files for the social scheduler.
order: 1
lastUpdated: 2026-04-07
---

<script>
import { Badge, CardGrid, LinkCard, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The repository is a **pnpm monorepo**: the root holds the workspace manifest, shared tooling, and top-level packages.

The customer-facing **SvelteKit** app lives in <Badge text="web/" variant="path" />. It serves the marketing site, authenticated product UI, and the **`/docs`** documentation area. The docs runtime (content loading, navigation, search) lives under <Badge text="web/src/lib/docs/" variant="path" />.

## Tech stack

- Supabase DB & Auth
- Express.js
- Svelte 5
- Tailwind CSS
- DaisyUI
- Redis
- Stripe
- Resend
- Sentry
- Vercel

Repository layout at the root:

<FileTree>

- LICENSE
- README.md
- agent/
  - server/
- backend/
- common/
- orchestrator/
- web/
- sdk/
- scripts/
- package.json
- pnpm-workspace.yaml


</FileTree>

- <Badge text="backend/" variant="path" /> — Supabase project assets (migrations, RLS, modules) and the Express API that talks to **Supabase** (database + auth patterns, and **Storage** where applicable).
- <Badge text="common/" variant="path" /> — Shared workspace package (`openquok-common`): types and small utilities imported by <Badge text="backend/" variant="path" /> and <Badge text="orchestrator/" variant="path" /> (for example notification email types).
- <Badge text="orchestrator/" variant="path" /> — Workspace package (`openquok-orchestrator`): Flowcraft blueprints, BullMQ adapters, **long-running worker** entrypoints, and enqueue helpers used from the API when distributed transport is enabled. See <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>, <a href="/docs/configuration-worker">Configuration - Worker</a>, and <a href="/docs/configuration-worker/railway">Railway (workers)</a>.
- <Badge text="scripts/" variant="path" /> — Monorepo automation (build, codegen, migration aggregation, etc.).
- <Badge text="web/" variant="path" /> — SvelteKit frontend; public static files live under <Badge text="web/static/" variant="path" />.

## Key Directories

### <Badge text="backend/" variant="path" />

Backend code and the **Supabase** project live together under <Badge text="backend/" variant="path" />:

<FileTree>

- backend/
  - api/
  - handler/
  - app.ts
  - config/
  - connections/
  - controllers/
  - data/
  - emails/
  - errors/
  - middlewares/
  - repositories/
  - routes/
  - scripts/
  - services/
  - supabase/
  - tests/
  - types/
  - utils/

</FileTree>

- <Badge text="api/" variant="path" /> and <Badge text="handler/" variant="path" /> — HTTP entrypoints shaped for **Vercel** (serverless-style functions and the handler surface that connects routing to your app). Use them as the deployment shell; keep business rules in <Badge text="services/" variant="path" /> and data access in <Badge text="repositories/" variant="path" />.
- <Badge text="services/" variant="path" /> — Domain orchestration and use-cases; this layer is also where **caching** belongs when you need to reuse or shorten expensive work across requests (in-memory, keyed stores, or upstream cache semantics—depending on what you wire in). Services may call **`openquok-orchestrator`** to enqueue Flowcraft runs or use **in-process** orchestration when `config/orchestratorFlows.ts` keeps transport on `in_process`.
- <Badge text="supabase/" variant="path" /> — Database source of truth: modular SQL under <Badge text="db/" variant="path" /> (tables, RLS, functions, seeds), migrations, and config targeting **Supabase Postgres**.
- <Badge text="repositories/" variant="path" />, <Badge text="controllers/" variant="path" />, <Badge text="routes/" variant="path" /> — Persistence adapters, request/response handling, and route tables; prefer Supabase clients and SQL in migrations over ad hoc SQL in the web app.
- <Badge text="middlewares/" variant="path" />, <Badge text="errors/" variant="path" />, <Badge text="connections/" variant="path" />, <Badge text="config/" variant="path" />, <Badge text="types/" variant="path" />, <Badge text="utils/" variant="path" />, <Badge text="data/" variant="path" /> — Cross-cutting behavior, Supabase/client wiring, shared types, helpers, and supporting data fixtures or reference payloads.
- <Badge text="emails/" variant="path" /> — Transactional templates and send flows.
- <Badge text="scripts/" variant="path" /> and <Badge text="tests/" variant="path" /> — One-off backend scripts and automated tests.
- **Storage** — User or system files go through **Supabase Storage** (buckets and policies live with the rest of the backend), not a separate blob store reached only from the frontend.

Root-level config files for this package are listed under **Configuration Files** → **Backend** below.

### <Badge text="web/" variant="path" />

The SvelteKit app root:

<FileTree>

- web/
  - package.json
  - web-config.json
  - static/
  - src/
    - content/
    - data/
      - docs.ts
      - icons.ts
    - lib/
      - area-admin/
      - area-protected/
      - area-public/
      - core/
      - ui/
      - …
    - params/
    - routes/
      - (auth)/
      - (docs)/
      - (legal)/
      - (protected)/
      - (public)/
      - …
    - styles/
    - tests/

</FileTree>

- <Badge text="src/routes/" variant="path" /> — File-based routing. **Route groups** `(public)`, `(auth)`, `(protected)`, `(docs)`, `(legal)` share layouts and auth boundaries without affecting the URL prefix. Pages stay thin: compose UI, own or call **page presenters**, and avoid direct **repository** or **gateway** imports (see **Presenters, repositories, and tests**).
- <Badge text="src/data/" variant="path" /> — Small **typed registries and config** imported from `$data/…` (e.g. **`docs.ts`**, **`icons.ts`**). Keeps sidebar and icon keys out of feature modules.
- <Badge text="src/lib/core/" variant="path" /> — **Infrastructure**: HTTP **`HttpGateway`**, cookies, shared presenters that sit next to I/O. DTOs from the API are parsed here and in repositories, not in `.svelte` files.
- <Badge text="src/lib/area-admin/" variant="path" />, <Badge text="src/lib/area-protected/" variant="path" />, <Badge text="src/lib/area-public/" variant="path" /> — **Page-level presenters** and exports for each surface: admin console, signed-in app, and public/marketing. Routes import singletons from these indexes instead of pulling every feature presenter separately.
- <Badge text="src/lib/ui/" variant="path" /> — Reusable **UI primitives and composites** (buttons, dialogs, docs chrome, **DaisyUI**-styled patterns). Feature routes pass view models and callbacks into these components; children under `$lib/ui` do not import **`area-*`** page presenters.
- **Theming (DaisyUI)** — Styling favors **semantic DaisyUI + Tailwind** tokens (`bg-base-100`, `text-base-content`, `border-base-300`, `primary`, `data-theme`, etc.) so **light and dark** (and theme presets like **forest** on docs) swap via CSS variables instead of hand-maintained color pairs per component.
- <Badge text="src/content/" variant="path" /> — Markdown sources for the in-app docs site.
- <Badge text="static/" variant="path" /> — Public assets (favicon, PWA icons, README images).
- **Full tooling list** — **Configuration Files** → **Web** below.

#### Presenters, repositories, and tests

We keep **Svelte** focused on layout and inputs, and push behavior into layers you can test without the DOM or a real API:

| Layer | Role | Typical files |
|-------|------|----------------|
| **UI (Svelte)** | Render view models; forward user actions via callbacks. Parent routes own the **page presenter**; children avoid importing repositories or gateways. | `*.svelte` under <Badge text="routes/" variant="path" /> and <Badge text="$lib/ui/" variant="path" /> |
| **Presenter** | View-specific state (status, toasts, `*Vm`), actions that call repositories. No `goto`, no direct gateway usage. | `*.presenter.svelte.ts` |
| **Repository** | Domain state as **programmer models**; maps DTOs ↔ domain; calls the gateway. | `*.repository.svelte.ts` |
| **Gateway / infrastructure** | HTTP and other I/O; DTOs at the boundary. | <Badge text="$lib/core/" variant="path" /> (e.g. `HttpGateway`) |

**Why separate repository and presenter?** Repositories encode **business rules and data shape** (what the app believes is true). Presenters encode **how a screen behaves** (loading, errors, which `*Vm` the template sees). Splitting them means you can **unit test** presenters with a stubbed repository and **unit test** repositories with a stubbed gateway—asserting on state and return values instead of rendering components or running end-to-end tests for every branch. That matches the goal: *test view-model and domain behavior, not the DOM*.

**Convention reference:** The full rules (page vs child components, toast wiring, `*Pm` / `*Vm` naming, `Get*` presenters) live in the repo at `.cursor/rules/web-repository-presenter-architecture.mdc` for contributors.

## Document Directories

The sections below describe structure **inside** <Badge text="web/" variant="path" /> (paths are relative to that folder unless noted).

### <Badge text="src/content/docs/" variant="path" />

This is where in-app documentation markdown lives. Each `.md` file becomes a page; URLs follow the folder path. Sidebar sections are declared in <Badge text="$lib/docs/constants/config.ts" variant="path" /> (`autogenerate.directory` must match these folder names).

<FileTree>

- src/content/docs/
  - index.md
  - developer-guidelines/
    - index.md
  - getting-started-for-cli/
    - index.md
    - authentication.md
  - getting-started-for-public-api/
    - index.md
  - apis-integrations/
    - connect.md
    - social-connect-callback.md
  - getting-started-for-dev/
    - index.md
    - architecture.md
    - quick-start.md
  - how-to-write-docs/
    - index.md
    - configuration.md
    - writing-content.md
    - components.md
    - versioning.md

</FileTree>

### <Badge text="src/lib/docs/" variant="path" />

The documentation engine:

- <Badge text="constants/config.ts" variant="path" /> — Defines docs site metadata, sidebar, i18n, and assembles `docsConfig`
- <Badge text="content.ts" variant="path" /> — Content loader that discovers and parses markdown files
- <Badge text="navigation.ts" variant="path" /> — Generates sidebar navigation from the file structure
- <Badge text="types.ts" variant="path" /> — TypeScript types for docs, navigation, and config
- <Badge text="utils/toc-state.svelte.ts" variant="path" /> — Table of contents state management

### <Badge text="src/lib/ui/components/docs/" variant="path" />

Documentation UI (layouts, MDX helpers, search, nav):

- <Badge text="layout/" variant="path" /> — Header, footers, sidebars
- <Badge text="nav/" variant="path" /> — Breadcrumbs, keyboard nav, social links
- <Badge text="search/" variant="path" /> — Command palette search
- <Badge text="mdx/" variant="path" /> — Callout, tabs, cards, and other markdown components

## Configuration Files

Paths below are relative to each package root (<Badge text="backend/" variant="path" />, <Badge text="web/" variant="path" />, <Badge text="common/" variant="path" />, or <Badge text="orchestrator/" variant="path" /> where noted).

### Backend

| File | Purpose |
|------|---------|
| `package.json` | Scripts, dependencies, and workspace metadata for the API package |
| `vercel.json` | Vercel deployment: routes, builds, and serverless/function wiring |
| `tsconfig.json` / `tsconfig.build.json` | TypeScript: editor vs production compile targets |
| `tsup.config.ts` | Bundles the deployable API surface |
| `eslint.config.js` | ESLint rules for the backend source |
| `jest.config.js` | Jest entry; see also `jest.*.cjs` env files and `babel.config.jest.cjs` for test transforms |

### Web

| File | Purpose |
|------|---------|
| `svelte.config.js` | SvelteKit + MDSvex configuration |
| `vite.config.ts` | Vite + Tailwind CSS setup |
| `package.json` | Scripts and dependencies for the SvelteKit app |
| `$lib/docs/constants/config.ts` | Docs site title, sidebar sections, social links, locales |
| `src/lib/docs/constants/config.ts` | Assembled `docsConfig` consumed by the docs runtime |

## Next Steps

<CardGrid>
<LinkCard title="Quick Start" description="Get started with OpenQuok installation" href="/docs/getting-started-for-dev/quick-start" />
</CardGrid>