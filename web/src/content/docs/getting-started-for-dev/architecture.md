---
title: Project Architecture
description: OpenQuok's architecture — project layout and key files for the social scheduler.
order: 1
lastUpdated: 2026-07-18
---

<script>
import { Badge, CardGrid, LinkCard, FileTree, Mermaid } from '$lib/ui/components/docs/mdx/index.js';

const runtimeArchitecture = `flowchart LR
    classDef ext fill:#8ED14F,color:black,stroke:#fff
    classDef svc fill:#9900e6,color:white,stroke:#fff
    classDef client fill:#e1f5fe,color:black,stroke:#fff

    web[Web]:::svc
    backend[Backend API]:::svc
    orchestrator[Orchestrator workers]:::svc
    agent[CLI / SDK / MCP]:::client
    redis[Redis / BullMQ]:::ext
    supabase[Supabase]:::ext
    storage[Storage]:::ext
    resend[Resend]:::ext

    web --> backend
    agent --> backend
    backend --> supabase
    backend --> redis
    backend --> storage
    redis --> orchestrator
    orchestrator --> supabase
    orchestrator --> storage
    orchestrator --> resend
`;
</script>

## Overview

The repository is a **pnpm monorepo**: the root holds the workspace manifest, shared tooling, and top-level packages.

The customer-facing **SvelteKit** app lives in <Badge text="web/" variant="path" />. It serves the marketing site, and authenticated product UI. The docs runtime (content loading, navigation, search) lives under <Badge text="web/src/lib/docs/" variant="path" />.

## Tech stack

- PNPM workspace
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

## Runtime architecture

OpenQuok has **three main services**, **programmatic clients**, and **four external systems**. The web app and API talk over HTTP; with `bullmq` transport the API enqueues Flowcraft runs to Redis and orchestrator workers execute them. External systems usually run outside the app process (Supabase project, Redis, storage, email).

<Mermaid string={runtimeArchitecture} />

- [Web](#web) — SvelteKit UI; talks to the backend API.
- [Backend API](#backend-api) — Express API, Supabase assets, and workflow enqueue.
- [Orchestrator](#orchestrator) — BullMQ workers for posts, email, and token refresh.
- [Programmatic clients](#programmatic-clients) — CLI, SDK, and MCP against the public API.
- **Supabase** — Postgres, Auth, and optional Storage buckets.
- **Redis / BullMQ** — Job queues and shared cache between API and workers.
- **Storage** — User media (Supabase Storage, R2, or local disk in self-host).
- **Resend** — Transactional email when <Badge text="EMAIL_ENABLED" variant="envBackend" /> is enabled.

### Web

The web app is what users see in the browser — workspace, admin, and in-app docs.

### Backend API

The backend coordinates product logic: REST API for the web and public clients, Supabase migrations and RLS, and uploads.

### Orchestrator

Orchestrator workers run Flowcraft graphs backed by BullMQ. They handle:

- Publishing scheduled content to social platforms
- Refreshing OAuth tokens for connected integrations
- Sending notification and digest email
- Reconciling missing scheduled posts

See <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>.

### Programmatic clients

The CLI (<Badge text="openquok" variant="default" />), Node SDK, and hosted MCP server call <Badge text="/api/v1/public/*" variant="path" />. The CLI may use the device-flow auth server in <Badge text="agent/server/" variant="path" /> for login — see <a href="/docs/configuration-agent/architecture">Auth server architecture</a>.

## Project Layout

Repository layout at the root:

<FileTree>

- LICENSE
- README.md
- .cursor/
  - rules/
- agent/
  - server/
  - skills/
  - src/
- backend/
- common/
- infra/
  - self-host/
  - docker-compose.yml
- orchestrator/
- web/
- sdk/
- scripts/
- package.json
- pnpm-workspace.yaml
- railway.toml
- vercel.backend.json
- vercel.web.json

</FileTree>

- <Badge text="agent/" variant="path" /> — Published as <Badge text="@openquok/auto-cli" variant="default" />: the programmatic CLI, agent skills under <Badge text="skills/" variant="path" />, and the OAuth2 device-flow auth server in <Badge text="server/" variant="path" />. See <a href="/docs/getting-started-for-cli">Getting Started - CLI</a> and <a href="/docs/configuration-agent">Configuration - Agent</a>.
- <Badge text="backend/" variant="path" /> — Supabase project assets (migrations, RLS, modules) and the Express API that talks to Supabase (database + auth, and Storage).
- <Badge text="common/" variant="path" /> — Shared workspace package (`openquok-common`): types and small utilities imported by <Badge text="backend/" variant="path" /> and <Badge text="orchestrator/" variant="path" /> (for example notification email types).
- <Badge text="infra/" variant="path" /> — Docker Compose and self-host env templates. Contributor dev dependencies live in <Badge text="infra/docker-compose.yml" variant="path" />; the full operator stack is under <Badge text="infra/self-host/" variant="path" />. See <a href="/docs/installation/docker-compose">Docker Compose</a>.
- <Badge text="orchestrator/" variant="path" /> — Workspace package: Flowcraft blueprints, BullMQ adapters, and worker entrypoints. See <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a>, <a href="/docs/configuration-worker">Configuration - Worker</a>, and <a href="/docs/configuration-worker/railway">Railway (workers)</a>.
- <Badge text="sdk/" variant="path" /> — Published as <Badge text="@openquok/node-sdk" variant="default" />: a typed Node.js client for the programmatic API.
- <Badge text="scripts/" variant="path" /> — Monorepo automation (build, codegen, migration aggregation, etc.).
- <Badge text="web/" variant="path" /> — SvelteKit frontend; public static files live under <Badge text="web/static/" variant="path" />.
- <Badge text=".cursor/" variant="path" /> — Cursor rules that encode repository conventions. Contributors and agents should follow the matching <Badge text=".cursor/rules/*.mdc" variant="path" /> files when editing code or using them as chat context in each area.

## Key Directories

### <Badge text="backend/" variant="path" />

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

- <Badge text="api/" variant="path" /> and <Badge text="handler/" variant="path" /> — HTTP entrypoints shaped or types for Vercel. Use them as the deployment shell.
- <Badge text="services/" variant="path" /> — Domain orchestration and use-cases; this layer is also where caching belongs when you need to reuse or shorten expensive work across requests (in-memory, keyed stores, or upstream cache). Services may also call `openquok-orchestrator` to enqueue Flowcraft runs.
- <Badge text="supabase/" variant="path" /> — Database source of truth: modular SQL under <Badge text="db/" variant="path" /> tables, RLS, functions, seeds, and migration files.
- <Badge text="repositories/" variant="path" />, <Badge text="controllers/" variant="path" />, <Badge text="routes/" variant="path" /> — Persistence adapters, request/response handling, and route tables; prefer Supabase clients and SQL in migrations over ad hoc SQL in the web app.
- <Badge text="middlewares/" variant="path" />, <Badge text="errors/" variant="path" />, <Badge text="connections/" variant="path" />, <Badge text="config/" variant="path" />, <Badge text="types/" variant="path" />, <Badge text="utils/" variant="path" />, <Badge text="data/" variant="path" /> — Cross-cutting behavior, Supabase/client wiring, shared types, helpers, and supporting data fixtures or reference payloads.
- <Badge text="emails/" variant="path" /> — Transactional templates and send flows.
- <Badge text="scripts/" variant="path" /> and <Badge text="tests/" variant="path" /> — One-off backend scripts and automated tests.
- **Storage** — User or system files go through <Badge text="Supabase Storage" variant="param" /> (buckets and policies live with the rest of the backend).

### <Badge text="orchestrator/" variant="path" />

<FileTree>

- orchestrator/
  - adapters/
  - activities/
  - blueprints/
  - flows/
  - nodes/
  - stores/
  - worker/
  - scripts/
  - index.ts

</FileTree>

- <Badge text="blueprints/" variant="path" /> and <Badge text="nodes/" variant="path" /> — Flowcraft graph definitions (scheduled social posts, notification email, integration token refresh).
- <Badge text="flows/" variant="path" /> — Workflow implementations and reconciliation helpers (for example missing scheduled post rescans).
- <Badge text="adapters/" variant="path" /> — BullMQ transport: enqueue helpers used from the API and worker bootstrap code.
- <Badge text="worker/" variant="path" /> — Process entrypoints plus health checks and Sentry init.
- <Badge text="activities/" variant="path" /> — Side-effecting steps invoked from flows (publish, email send, OAuth refresh).
- <Badge text="stores/" variant="path" /> — Redis-backed state for rate limits and notification digests.
- <Badge text="scripts/" variant="path" /> — Operator utilities (env validation, queue cleanup, Railway env setup).

When `config/orchestratorFlows.ts` keeps transport on `in_process`, the API runs flows inline; with `bullmq`, these workers execute jobs from Redis queues shared with the API.


### <Badge text="agent/" variant="path" />

<FileTree>

- agent/
  - src/
    - commands/
  - server/
    - app.ts
  - skills/
    - openquok-core/
  - tests/
  - package.json
  - tsup.config.ts

</FileTree>

- <Badge text="src/" variant="path" /> — CLI implementation published as <Badge text="@openquok/auto-cli" variant="default" /> (`openquok` binary): auth, posts, integrations, analytics, uploads, and config commands.
- <Badge text="server/" variant="path" /> — Standalone OAuth2 device-flow auth server (Postgres-backed device codes, token polling). Deployed separately from the main API; the web app proxies browser routes under <Badge text="web/src/routes/(public)/cli/device" variant="path" />.
- <Badge text="skills/" variant="path" /> — Agent skill packs (for example <Badge text="openquok-core" variant="default" />) with channel recipes, provider settings, and command references for MCP clients.
- <Badge text="tests/" variant="path" /> — Vitest unit tests and CLI e2e helpers.

See <a href="/docs/configuration-agent/architecture">Auth server architecture</a> for the device-login sequence and endpoint map.

### <Badge text="infra/" variant="path" />

Docker and self-host operator assets:

<FileTree>

- infra/
  - docker-compose.yml
  - self-host/
    - docker-compose.yml
    - .env.example

</FileTree>

- <Badge text="infra/docker-compose.yml" variant="path" /> — devvelopment environment only.
- <Badge text="infra/self-host/" variant="path" /> — full stack: Redis, API, web, BullMQ workers, uploads volume; optional `cli` profile for Postgres + agent server.
- <Badge text="infra/self-host/.env.example" variant="path" /> — Template for self-host env vars; operators copy to `.env` beside the Compose file.

User-facing bring-up steps live under <a href="/docs/installation">Installation</a> (especially <a href="/docs/installation/docker-compose">Docker Compose</a>).

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

- <Badge text="src/routes/" variant="path" /> — File-based routing. Route groups <Badge text="(public)" variant="path" />, <Badge text="(auth)" variant="path" />, <Badge text="(protected)" variant="path" />, <Badge text="(docs)" variant="path" />, <Badge text="(legal)" variant="path" /> share layouts and auth boundaries without affecting the URL prefix.
- <Badge text="src/data/" variant="path" /> — Small typed registries and config imported from <Badge text="$data/…" variant="path" />(e.g. `docs.ts`, `icons.ts`).
- <Badge text="src/lib/core/" variant="path" /> — HttpGateway, cookies, shared presenters that sit next to I/O. DTOs from the API are parsed here and in repositories, not in `.svelte` files.
- <Badge text="src/lib/area-admin/" variant="path" />, <Badge text="src/lib/area-protected/" variant="path" />, <Badge text="src/lib/area-public/" variant="path" /> — Page-level presenters, including admin console, signed-in app, public/marketing and etc. Routes import singletons from these indexes.
- <Badge text="src/lib/ui/" variant="path" /> — Reusable UI components (buttons, dialogs, docs chrome, DaisyUI-styled patterns). Feature routes pass view models and callbacks into these components.
- **Theming (DaisyUI)** — Styling favors **semantic DaisyUI + Tailwind** tokens (<Badge text="bg-base-100" variant="param" />, <Badge text="text-base-content" variant="param" />, <Badge text="border-base-300" variant="param" />, <Badge text="primary" variant="param" />, and  etc.) so theme presets swap via CSS variables instead of hand-maintained color pairs per component.
- <Badge text="src/content/" variant="path" /> — Markdown sources for the in-app docs site.
- <Badge text="static/" variant="path" /> — Public assets (favicon, PWA icons, README images).

#### Presenters, repositories, and tests

We keep **Svelte** focused on layout and inputs, and push behavior into layers you can test without the DOM or a real API:

| Layer | Role | Typical files |
|-------|------|----------------|
| **UI (Svelte)** | Render view models; forward user actions via callbacks. Parent routes own the **page presenter**. | <Badge text="*.svelte" variant="param" /> under <Badge text="routes/" variant="path" /> and <Badge text="$lib/ui/" variant="path" /> |
| **Presenter** | View-specific state (status, toasts and etc), actions that call repositories. | <Badge text="*.presenter.svelte.ts" variant="param" /> |
| **Repository** | Domain state as **programmer models**; maps DTOs ↔ domain; calls the gateway. | <Badge text="*.repository.svelte.ts" variant="param" /> |
| **Gateway / infrastructure** | HTTP and other I/O; DTOs at the boundary. | <Badge text="$lib/core/" variant="path" /> (e.g. <Badge text="HttpGateway" variant="param" />) |


#### Why separate repository and presenter?

Repositories encode **business rules and data shape** (what the app believes is true). Presenters encode **how a screen behaves** (loading, errors, which <Badge text="*Vm" variant="param" /> the template sees). 

Splitting them means you can **unit test** presenters with a stubbed repository and **unit test** repositories with a stubbed gateway—asserting on state and return values instead of rendering components or running end-to-end tests for every branch. That matches the goal: *test view-model and domain behavior, not the DOM*.

**Convention reference:** The full rules (page vs child components, toast wiring, <Badge text="*Pm" variant="param" /> / <Badge text="*Vm" variant="param" /> naming, <Badge text="Get*" variant="param" /> presenters) live in the repo at <Badge text=".cursor/rules/web-repository-presenter-architecture.mdc" variant="path" /> for contributors.

## Document Directories

### <Badge text="src/content/docs/" variant="path" />

This is where in-app documentation markdown lives. Each  <Badge text=".md" variant="path" /> file becomes a page; URLs follow the folder path.

Sidebar tabs and section order are declared in <Badge text="src/lib/docs/constants/config.ts" variant="path" /> (CLI, Public API, MCP, Learn more, Contributing). Each top-level folder maps to one or more autogenerated sidebar sections.

<FileTree>

- src/content/docs/
  - index.md
  - getting-started-for-cli/
  - cli-usages/
  - cli-examples/
  - agent-setup-guides/
  - getting-started-for-mcp/
  - mcp-examples/
  - mcp-references/
  - mcp-setup-guides/
  - getting-started-for-public-api/
  - apis-integrations/
  - apis-posts/
  - apis-analytics/
  - apis-notifications/
  - apis-uploads/
  - getting-started-for-dev/
  - installation/
  - configuration-backend/
  - configuration-web/
  - configuration-worker/
  - configuration-agent/
  - admin/
  - social-integration/
  - oauth2-for-apps/
  - developer-guidelines/
  - publish-listings/
  - documentation-contribution/

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

Paths below are relative to each package root unless noted. Monorepo-root files are called out explicitly.

### Root (monorepo)

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | Workspace scripts (`pnpm` filters), shared devDependencies, `packageManager` pin |
| <Badge text="pnpm-workspace.yaml" variant="path" /> | Workspace package globs |
| <Badge text="railway.toml" variant="path" /> | Railway deploy config for workers and related services |
| <Badge text="vercel.backend.json" variant="path" /> / <Badge text="vercel.web.json" variant="path" /> | Vercel project wiring templates for API and web packages |
| <Badge text=".dockerignore" variant="path" /> | Excludes local artifacts from Docker build context |

### Backend

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | Scripts, dependencies, and workspace metadata for the API package |
| <Badge text="vercel.json" variant="path" /> | Vercel deployment: routes, builds, and serverless/function wiring |
| <Badge text="tsconfig.json" variant="path" /> / <Badge text="tsconfig.build.json" variant="path" /> / <Badge text="tsconfig.tsup.json" variant="path" /> | TypeScript: editor vs production compile targets |
| <Badge text="tsup.config.ts" variant="path" /> | Bundles the deployable API surface |
| <Badge text="eslint.config.js" variant="path" /> | ESLint rules for the backend source |
| <Badge text="jest.config.js" variant="path" /> | Jest entry; see also <Badge text="jest.*.cjs" variant="path" /> / <Badge text="jest.*.js" variant="path" /> env files and <Badge text="babel.config.jest.cjs" variant="path" /> for test transforms |

### Orchestrator

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | Worker scripts and `openquok-orchestrator` package metadata |
| <Badge text="tsconfig.json" variant="path" /> / <Badge text="tsconfig.build.json" variant="path" /> | TypeScript compile targets for workers |
| <Badge text="Dockerfile" variant="path" /> | Production worker image (one image; Compose overrides `command` per queue) |
| <Badge text="railpack.*.json" variant="path" /> | Railway buildpack configs per worker flavor |
| <Badge text="jest.config.js" variant="path" /> / <Badge text="jest.bullmq.config.js" variant="path" /> | Unit and BullMQ integration test entrypoints |
| <Badge text="babel.config.jest.cjs" variant="path" /> | Jest transform config |

### Agent

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | CLI package (`@openquok/auto-cli`) scripts and dependencies |
| <Badge text="tsconfig.json" variant="path" /> | TypeScript for CLI sources |
| <Badge text="tsup.config.ts" variant="path" /> | Bundles the `openquok` CLI binary |
| <Badge text="vitest.config.mjs" variant="path" /> / <Badge text="run-vitest.mjs" variant="path" /> | Vitest runner for CLI tests |
| <Badge text="server/package.json" variant="path" /> | Auth server dependencies and start scripts |
| <Badge text="server/tsconfig.json" variant="path" /> | TypeScript for the device-flow server |
| <Badge text="server/vercel.json" variant="path" /> | Vercel deployment for the hosted auth server |
| <Badge text="server/Dockerfile" variant="path" /> | Optional self-host `cli` profile image |

### Common

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | `openquok-common` workspace package metadata |
| <Badge text="tsconfig.json" variant="path" /> | TypeScript compile settings for shared types and utilities |

### SDK

| File | Purpose |
|------|---------|
| <Badge text="package.json" variant="path" /> | `@openquok/node-sdk` publish metadata and scripts |
| <Badge text="tsconfig.json" variant="path" /> | TypeScript compile settings |
| <Badge text="tsup.config.ts" variant="path" /> | Bundles the published SDK entrypoint |

### Infra

| File | Purpose |
|------|---------|
| <Badge text="infra/docker-compose.yml" variant="path" /> | Contributor Redis (+ optional CLI Postgres) for local dev |
| <Badge text="infra/self-host/docker-compose.yml" variant="path" /> | Full self-host stack (API, web, workers, Redis; optional `cli` profile) |
| <Badge text="infra/self-host/.env.example" variant="path" /> | Operator env template (Supabase keys, Redis, OAuth apps, self-host defaults) |

### Web

| File | Purpose |
|------|---------|
| <Badge text="svelte.config.js" variant="path" /> | SvelteKit + MDSvex configuration |
| <Badge text="vite.config.ts" variant="path" /> | Vite + Tailwind CSS setup |
| <Badge text="package.json" variant="path" /> | Scripts and dependencies for the SvelteKit app |
| <Badge text="web-config.json" variant="path" /> | Web package metadata consumed by tooling |
| <Badge text="vercel.json" variant="path" /> | Vercel adapter and deployment settings |
| <Badge text="tsconfig.json" variant="path" /> | TypeScript for the SvelteKit app |
| <Badge text="eslint.config.js" variant="path" /> | ESLint rules for web sources |
| <Badge text="src/lib/docs/constants/config.ts" variant="path" /> | Docs site title, sidebar tabs/sections, social links, locales; assembles `docsConfig` |
| <Badge text="src/data/docs.ts" variant="path" /> | Docs site social URLs and shared docs data |

## Next Steps

<CardGrid>
<LinkCard title="Quick Start" description="Get started with OpenQuok installation" href="/docs/getting-started-for-dev/quick-start" />
</CardGrid>