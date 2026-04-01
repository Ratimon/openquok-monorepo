---
title: Project Architecture
description: OpenQuok architecture — project layout and key files for the social scheduler.
order: 1
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The repository is a **pnpm monorepo**: the root holds the workspace manifest, shared tooling, and top-level packages. **Data and files go through Supabase** (Postgres for relational data, **Supabase Storage** for objects when the product needs them).

The customer-facing **SvelteKit** app lives in **`web/`**. It serves the marketing site, authenticated product UI, and the **`/docs`** documentation area. The docs runtime (content loading, navigation, search) lives under `web/src/lib/docs/`.

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

```
.
├── LICENSE
├── README.md
├── backend
├── package.json
├── pnpm-workspace.yaml
├── scripts
└── web
```

- **`backend/`** — Supabase project assets (migrations, RLS, modules) and the API layer that talks to **Supabase** (database + auth patterns, and **Storage** where applicable).
- **`scripts/`** — Monorepo automation (build, codegen, migration aggregation, etc.).
- **`web/`** — SvelteKit frontend; public static files live under `web/static/`.

## Key Directories

### `backend/`

Backend code and the **Supabase** project live together under `backend/`:

```
backend/
├── api
├── handler
├── app.ts
├── config
├── connections
├── controllers
├── data
├── emails
├── errors
├── middlewares
├── repositories
├── routes
├── scripts
├── services
├── supabase
├── tests
├── types
└── utils
```

- **`api/`** and **`handler/`** — HTTP entrypoints shaped for **Vercel** (serverless-style functions and the handler surface that connects routing to your app). Use them as the deployment shell; keep business rules in **services** and data access in **repositories**.
- **`services/`** — Domain orchestration and use-cases; this layer is also where **caching** belongs when you need to reuse or shorten expensive work across requests (in-memory, keyed stores, or upstream cache semantics—depending on what you wire in).
- **`supabase/`** — Database source of truth: modular SQL under `db/` (tables, RLS, functions, seeds), migrations, and config targeting **Supabase Postgres**.
- **`repositories/`**, **`controllers/`**, **`routes/`** — Persistence adapters, request/response handling, and route tables; prefer Supabase clients and SQL in migrations over ad hoc SQL in the web app.
- **`middlewares/`**, **`errors/`**, **`connections/`**, **`config/`**, **`types/`**, **`utils/`**, **`data/`** — Cross-cutting behavior, Supabase/client wiring, shared types, helpers, and supporting data fixtures or reference payloads.
- **`emails/`** — Transactional templates and send flows.
- **`scripts/`** and **`tests/`** — One-off backend scripts and automated tests.
- **Storage** — User or system files go through **Supabase Storage** (buckets and policies live with the rest of the backend), not a separate blob store reached only from the frontend.

Root-level config files for this package are listed under **Configuration Files** → **Backend** below.

### `web/`

The SvelteKit app root:

```
web/
├── package.json
├── web-config.json
├── static
└── src
    ├── content/                # docs markdown (see Document Directories)
    ├── data/
    │   ├── docs.ts             # docs site + sidebar config consumed by $lib/docs
    │   └── icon.ts             # icon registry for AbstractIcon / MDX
    ├── lib/
    │   ├── area-admin/         # admin-area page presenters + wiring
    │   ├── area-protected/     # signed-in app: settings, account, …
    │   ├── area-public/        # marketing / public blog presenters
    │   ├── core/               # HttpGateway, shared infra, cross-cutting presenters
    │   ├── ui/                 # design-system components (DaisyUI + Tailwind)
    │   └── …                   # feature modules: account, blog, user-auth, docs, …
    ├── params/
    ├── routes/
    │   ├── (auth)/             # sign-in, sign-up, password flows
    │   ├── (docs)/             # /docs layout + localized slugs
    │   ├── (legal)/            # policy pages
    │   ├── (protected)/        # authenticated product + editor surfaces
    │   ├── (public)/           # landing, public blog, …
    │   └── …                   # root +layout, feeds, robots.txt, sitemap, …
    ├── styles/
    └── tests/
```

- **`src/routes/`** — File-based routing. **Route groups** `(public)`, `(auth)`, `(protected)`, `(docs)`, `(legal)` share layouts and auth boundaries without affecting the URL prefix. Pages stay thin: compose UI, own or call **page presenters**, and avoid direct **repository** or **gateway** imports (see **Presenters, repositories, and tests**).
- **`src/data/`** — Small **typed registries and config** imported from `$data/…` (e.g. **`docs.ts`**, **`icon.ts`**). Keeps sidebar and icon keys out of feature modules.
- **`src/lib/core/`** — **Infrastructure**: HTTP **`HttpGateway`**, cookies, shared presenters that sit next to I/O. DTOs from the API are parsed here and in repositories, not in `.svelte` files.
- **`src/lib/area-admin`**, **`area-protected`**, **`area-public/`** — **Page-level presenters** and exports for each surface: admin console, signed-in app, and public/marketing. Routes import singletons from these indexes instead of pulling every feature presenter separately.
- **`src/lib/ui/`** — Reusable **UI primitives and composites** (buttons, dialogs, docs chrome, **DaisyUI**-styled patterns). Feature routes pass view models and callbacks into these components; children under `$lib/ui` do not import **`area-*`** page presenters.
- **Theming (DaisyUI)** — Styling favors **semantic DaisyUI + Tailwind** tokens (`bg-base-100`, `text-base-content`, `border-base-300`, `primary`, `data-theme`, etc.) so **light and dark** (and theme presets like **forest** on docs) swap via CSS variables instead of hand-maintained color pairs per component.
- **`src/content/`** — Markdown sources for the in-app docs site.
- **`static/`** — Public assets (favicon, PWA icons, README images).
- **Full tooling list** — **Configuration Files** → **Web** below.

#### Presenters, repositories, and tests

We keep **Svelte** focused on layout and inputs, and push behavior into layers you can test without the DOM or a real API:

| Layer | Role | Typical files |
|-------|------|----------------|
| **UI (Svelte)** | Render view models; forward user actions via callbacks. Parent routes own the **page presenter**; children avoid importing repositories or gateways. | `*.svelte` under `routes/` and `$lib/ui/` |
| **Presenter** | View-specific state (status, toasts, `*Vm`), actions that call repositories. No `goto`, no direct gateway usage. | `*.presenter.svelte.ts` |
| **Repository** | Domain state as **programmer models**; maps DTOs ↔ domain; calls the gateway. | `*.repository.svelte.ts` |
| **Gateway / infrastructure** | HTTP and other I/O; DTOs at the boundary. | `$lib/core/` (e.g. `HttpGateway`) |

**Why separate repository and presenter?** Repositories encode **business rules and data shape** (what the app believes is true). Presenters encode **how a screen behaves** (loading, errors, which `*Vm` the template sees). Splitting them means you can **unit test** presenters with a stubbed repository and **unit test** repositories with a stubbed gateway—asserting on state and return values instead of rendering components or running end-to-end tests for every branch. That matches the goal: *test view-model and domain behavior, not the DOM*.

**Convention reference:** The full rules (page vs child components, toast wiring, `*Pm` / `*Vm` naming, `Get*` presenters) live in the repo at `.cursor/rules/web-repository-presenter-architecture.mdc` for contributors.

## Document Directories

The sections below describe structure **inside `web/`** (paths are relative to that folder unless noted).

### `src/content/docs/`

This is where in-app documentation markdown lives. Each `.md` file becomes a page; URLs follow the folder path. Sidebar sections are declared in **`$lib/docs/constants/config.ts`** (`autogenerate.directory` must match these folder names).

```
src/content/docs/
├── index.md                    # /docs
├── developer-guidelines/
│   └── index.md                # /docs/developer-guidelines/
├── getting-started/
│   ├── index.md                # /docs/getting-started/
│   ├── architecture.md         # /docs/getting-started/architecture
│   └── quick-start.md          # /docs/getting-started/quick-start
└── how-to-write-docs/
    ├── index.md                # /docs/how-to-write-docs/
    ├── configuration.md        # /docs/how-to-write-docs/configuration
    ├── writing-content.md      # /docs/how-to-write-docs/writing-content
    ├── components.md           # /docs/how-to-write-docs/components
    └── versioning.md           # /docs/how-to-write-docs/versioning
```

### `src/lib/docs/`

The documentation engine:

- **`constants/config.ts`** — Defines docs site metadata, sidebar, i18n, and assembles `docsConfig`
- **`content.ts`** — Content loader that discovers and parses markdown files
- **`navigation.ts`** — Generates sidebar navigation from the file structure
- **`types.ts`** — TypeScript types for docs, navigation, and config
- **`utils/toc-state.svelte.ts`** — Table of contents state management

### `src/lib/ui/components/docs/`

Documentation UI (layouts, MDX helpers, search, nav):

- **`layout/`** — Header, footers, sidebars
- **`nav/`** — Breadcrumbs, keyboard nav, social links
- **`search/`** — Command palette search
- **`mdx/`** — Callout, tabs, cards, and other markdown components

## Configuration Files

Paths below are relative to each package root (`backend/` or `web/`).

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
<LinkCard title="Quick Start" description="Get started with OpenQuak Installation" href="/docs/getting-started/quick-start" />
</CardGrid>