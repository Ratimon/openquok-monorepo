---
title: Quick Start
description: Openquok's quick start — install dependencies, configure env, and run the social scheduler locally.
order: 2
lastUpdated: 2026-04-24
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- **Node.js** 24.x or higher
- **Corepack** — enables the pinned **pnpm** version and avoids Node’s `url.parse` deprecation during installs. Run `corepack enable`. The repo pins **pnpm** via the root `packageManager` field (e.g. `pnpm@10.30.3`) so installs stay consistent and avoid mixed-tooling issues.
- A **Supabase** account (for backend / local development against the project)

```bash
nvm use 24.14.0
corepack enable
```

## Quickstart

1. **Clone** this repository.

2. **Install dependencies** — use **pnpm** only; npm/yarn are blocked in this repo to avoid mixed installs:

```bash
pnpm install
```

3. **Set up environment variables** — follow the configuration guides for each package:

<CardGrid>
<LinkCard title="Backend configuration" description="Env files and variables for the backend / Supabase workspace" href="/docs/configuration-backend" />
<LinkCard title="Frontend configuration" description="Environment variables for the SvelteKit app in web/" href="/docs/configuration-web" />
</CardGrid>

## Development environment

Commands for running **`backend/`** and **`web/`**, tests, database scripts, and deployment live on the **Development environment** page so this quick start stays focused on first-time setup.

<CardGrid>
<LinkCard title="Development environment" description="Local dev servers, tests, DB tasks, and deployment commands" href="/docs/Installation/development-environment" />
</CardGrid>

## Orchestrator workers (BullMQ) and cleanup

For BullMQ-backed workflows, run the worker processes from <code>orchestrator/</code>. The orchestrator guide covers **commands**, the **Redis cleanup** script, and what to do when Flowcraft run state in Redis is stale.

<CardGrid>
<LinkCard title="Backend orchestrator workflows" description="BullMQ transport, workers, and clearing stale Flowcraft runs in Redis" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Orchestrator workers" description="Env, Railway deploy notes, and worker-related scripts" href="/docs/configuration-worker" />
</CardGrid>

## Next steps

Explore the architecture, installation, contributor guidelines, and how to author this documentation site:

<CardGrid>
<LinkCard title="Project architecture" description="Monorepo layout, key directories, and how the stack fits together" href="/docs/getting-started/architecture" />
<LinkCard title="Installation" description="Development environment, deployment on Vercel, and related setup guides" href="/docs/Installation" />
<LinkCard title="Developer guidelines" description="Conventions and practices for working in this repository" href="/docs/developer-guidelines" />
<LinkCard title="How to write docs" description="Configure, write, and extend the documentation area in web/" href="/docs/how-to-write-docs" />
</CardGrid>
