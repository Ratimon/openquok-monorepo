---
title: Quick Start
description: Quick start — install dependencies, configure env, and run the Openquok's social scheduler locally.
order: 2
lastUpdated: 2026-07-14
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- **Node.js** 24.x or higher
- **Corepack** — enables the pinned **pnpm** version. Run `corepack enable`. The repo pins **pnpm** via the root `packageManager` field (e.g. `pnpm@10.30.3`) so installs stay consistent and avoid mixed-tooling issues.
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

## Development and Production environments

Commands for running **`backend/`** and **`web/`**, tests, database scripts, and deployment live on the **Development environment** page so this quick start stays focused on first-time setup.

<CardGrid>
<LinkCard title="Development environment" description="Local dev servers, tests, DB tasks, and deployment commands" href="/docs/installation/development-environment" />
<LinkCard title="Production environment" description="Deploy on production" href="/docs/installation/development-environment" />
</CardGrid>

## Orchestrator workers (BullMQ) and cleanup

For BullMQ-backed workflows, run the worker processes from <code>orchestrator/</code>. The orchestrator guide covers **commands**, the **Redis cleanup** script, and what to do when Flowcraft run state in Redis is stale.

<CardGrid>
<LinkCard title="Backend orchestrator workflows" description="BullMQ transport, workers, and clearing stale Flowcraft runs in Redis" href="/docs/developer-guidelines/orchestrator-workflows" />
<LinkCard title="Configuration - Worker" description="Env, Railway deploy notes, and worker-related scripts" href="/docs/configuration-worker" />
</CardGrid>

## CLI auth server (device flow)

For CLI device-flow login, run the auth server from <code>agent/server/</code>. The agent configuration guide covers **env vars**, the **API / browser origin split**, Postgres (including Neon), and Vercel deploy notes.

<CardGrid>
<LinkCard title="Configuration - Agent" description="CLI auth server secrets, BROWSER_ORIGIN, and production OAuth callbacks" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Split topology, endpoints, and Postgres device-flow state" href="/docs/configuration-agent/architecture" />
</CardGrid>

## Next steps

Explore the architecture, social channel setup, OAuth apps, admin roles, and how to contribute to the project:

<CardGrid>
<LinkCard title="Project architecture" description="Monorepo layout, key directories, and how the stack fits together" href="/docs/getting-started-for-dev/architecture" />
<LinkCard title="Installation" description="Development environment, deployment on Vercel, and related setup guides" href="/docs/installation" />
<LinkCard title="Developer guidelines" description="Conventions and practices for working in this repository" href="/docs/developer-guidelines" />
<LinkCard title="Social integrations" description="Connect channels — OAuth, backend env, and provider dashboard settings" href="/docs/social-integration" />
<LinkCard title="OAuth2 for apps" description="Authorization Code flow for third-party apps acting on behalf of users" href="/docs/oauth2-for-apps" />
<LinkCard title="Admin setup" description="Platform admin, OAuth apps, security secrets, and post-deployment setup" href="/docs/admin" />
<LinkCard title="Documentation contribution" description="Configure, write, and extend the documentation area in web/" href="/docs/documentation-contribution" />
</CardGrid>
