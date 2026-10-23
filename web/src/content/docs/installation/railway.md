---
title: Production - Railway
description: Deploy long-running BullMQ worker services on Railway
order: 3
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This guide covers **orchestrator worker** deployments on **Railway**: always-on processes that consume **BullMQ** queues while your **API** may live on **Vercel**.

Railway treats these as <DocsExternalLink href="https://docs.railway.com/services#persistent-services">persistent services</DocsExternalLink> (containers that keep running). See also <a href="/docs/configuration-worker">Configuration - Worker</a> for env vars and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a> for when to use <code>bullmq</code> transport.

## Prerequisites

- Railway account and <DocsExternalLink href="https://docs.railway.com/develop/cli">Railway CLI</DocsExternalLink> on your <code>PATH</code>. This guide uses the global <code>railway</code> command.
- Worker environment variables set on each Railway service (applies to **dashboard deploys** and **CLI deploys**):
  - <Badge text="REDIS_*" variant="envBackend" /> (shared with your API). See <a href="/docs/configuration-backend/redis">Redis cache</a>.
  - Supabase keys — <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" />, and <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" />. Legacy JWT keys are not accepted; see <a href="/docs/configuration-backend/supabase">Supabase</a> and <a href="/docs/configuration-worker">Configuration - Worker</a>.
  - Storage public URL for media publishing (recommended if you schedule posts with images/videos): <Badge text="STORAGE_PROVIDER" variant="envBackend" /> and <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> (no trailing slash). See <a href="/docs/configuration-backend/cloudflare-r2">R2 or local storage</a>.
  - <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> set per worker service (see “Set variables per worker service” below).

## Build and start (summary)

| Phase | Command / setting |
|-------|-------------------|
| **Build** (repo root) | <Badge text="pnpm install && pnpm railway:orchestrator:build" variant="default" /> |
| **Build / start / limits** | <Badge text=".railway/railway.ts" variant="path" /> (Infrastructure as Code) — apply with <Badge text="railway config apply" variant="default" /> |
| **Start** (Railpack + monorepo scripts) | <Badge text="pnpm railway:orchestrator:start:*" variant="default" /> in each <Badge text="orchestrator/railpack.*.json" variant="path" /> |

Worker services use <Badge text=".railway/railway.ts" variant="path" /> for <code>build</code>, <code>start</code>, health check, region <code>us-west2</code>, and replica limits (<code>1</code> vCPU / <code>1</code> GiB for integration-refresh and housekeeping; <code>2</code> GiB for scheduled-social-post). Repo-root <Badge text="railway.toml" variant="path" /> is not used (<DocsExternalLink href="https://docs.railway.com/infrastructure-as-code">Infrastructure as Code</DocsExternalLink> replaces deprecated Config as Code).

After you change <Badge text=".railway/railway.ts" variant="path" />, sync Railway from the **monorepo root** (requires a CLI that supports <code>railway config</code> — run <code>railway upgrade</code> if needed):

```bash
railway config plan
railway config apply
```

## Dashboard setup

<Steps
	howToName="Railway Dashboard setup"
	howToDescription="Deploy long-running BullMQ worker services on Railway with the monorepo build and Railway CLI."
>

### Create project resources

Add **Redis** (and reference its connection into worker variables as <Badge text="REDIS_*" variant="envBackend" />). Add **one Railway service per worker** you need (integration refresh, housekeeping, and/or scheduled social posts), or split later—each needs its own **Start Command**; set <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> to the <code>railpack</code> file for that worker at the repo root (see the callout below).

Name the services after the worker they run (recommended), but the exact service names are up to you. The CLI bootstrap uses the **linked** service (see “Railway CLI” below).

### Connect the GitHub repo

Use the same repository as the monorepo. Configure <DocsExternalLink href="https://docs.railway.com/deployments/monorepo">monorepo</DocsExternalLink> settings so install/build run from the **repository root**.

### Set variables per worker service

Set <Badge text="NODE_ENV=production" variant="envRuntime" />, Redis, Supabase, and any provider/email keys from <a href="/docs/configuration-worker">Configuration - Worker</a>.

<Callout type="tip" title="Railpack config">
Set <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> (per service) to one of: <Badge text="orchestrator/railpack.integration-refresh.json" variant="param" />, <Badge text="orchestrator/railpack.housekeeping.json" variant="param" />, or <Badge text="orchestrator/railpack.scheduled-social-post.json" variant="param" /> (setup scripts or <Badge text="railway variables set" variant="default" />). Each Railpack file copies compiled <code>*/dist</code> into the runtime image and starts via <code>pnpm railway:orchestrator:start:*</code>. Retire legacy <code>openquok-worker-notification-email</code> — use <strong>housekeeping</strong> only.
</Callout>

### Start command (one per worker service)

Each Railway worker runs **one** start command from the **monorepo root** (<code>/app</code> in the container). The repo wires these in <Badge text=".railway/railway.ts" variant="path" /> (<code>start</code>) and the matching <Badge text="orchestrator/railpack.*.json" variant="path" /> (<code>deploy.startCommand</code>). After <Badge text="railway config apply" variant="default" />, leave **Settings → Deploy → Start Command** empty on each service so deploys use that code-defined command—do not paste a different command in the dashboard unless you are intentionally overriding. Clear any **Config file path** still pointing at removed <Badge text="railway.toml" variant="path" /> files.

Use **exactly one** of the following per service (match <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> to the same worker):

**Integration refresh** — service e.g. <code>openquok-worker-integration-refresh</code>, <Badge text="orchestrator/railpack.integration-refresh.json" variant="param" /> —

```bash
pnpm railway:orchestrator:start:integration-refresh
```

**Housekeeping** (notification email digest + Directory SEO weekly refresh) — service e.g. <code>openquok-worker-housekeeping</code>, <Badge text="orchestrator/railpack.housekeeping.json" variant="param" /> —

```bash
pnpm railway:orchestrator:start:housekeeping
```

**Scheduled social post** (calendar publishes at <code>publish_date</code>) — service e.g. <code>openquok-worker-scheduled-social-post</code>, <Badge text="orchestrator/railpack.scheduled-social-post.json" variant="param" /> —

```bash
pnpm railway:orchestrator:start:scheduled-social-post
```

Local smoke (with pnpm installed): <code>railway run pnpm railway:orchestrator:start:&lt;worker&gt;</code> after <Badge text="railway link" variant="default" /> to that service.

Avoid scale-to-zero if it would **stop** a process during long integration-refresh sleeps.

</Steps>

## Railway CLI

### Prerequisite: install the Railway CLI

Install the CLI so the <code>railway</code> command is available globally (or on your <code>PATH</code>). Follow <DocsExternalLink href="https://docs.railway.com/develop/cli#installing-the-cli">Installing the Railway CLI</DocsExternalLink> — for example:

```bash
npm i -g @railway/cli
```

**You can also deploy each worker with the Railway CLI** instead of (or in addition to) GitHub-triggered deploys from the dashboard. To avoid deploying the wrong worker, prefer the repo scripts that set the correct Railpack config for you:

- <Badge text="pnpm railway:setup:integration-refresh" variant="default" /> (one-time: create service + set variables via CLI)
- <Badge text="pnpm railway:setup:housekeeping" variant="default" /> (one-time: create service + set variables via CLI)
- <Badge text="pnpm railway:setup:scheduled-social-post" variant="default" /> (one-time: create service + set variables via CLI)
- <Badge text="pnpm railway:deploy:integration-refresh" variant="default" />
- <Badge text="pnpm railway:deploy:housekeeping" variant="default" />
- <Badge text="pnpm railway:deploy:scheduled-social-post" variant="default" />

### Deploy a worker from your machine

<Steps
	howToName="Railway CLI"
	howToDescription="Railway CLI: Deploy long-running BullMQ worker services on Railway with the monorepo build and Railway CLI."
>

### Authenticate and link

Choose your Railway **project** and the **worker service**. Run <Badge text="railway link" variant="default" /> again only if you need a fresh link.

From the **repository root**:

```bash
railway login
railway init
railway link
railway service
```

If you see <strong>No service linked</strong>, run <code>railway service</code> to link a service for this directory.

<Callout type="warning">
When deploying multiple workers, you must run <code>railway service</code> to select the correct Railway service. The deploy scripts (<code>pnpm railway:deploy:…</code>) run <code>railway up</code> and will deploy to the <strong>currently linked</strong> service—if you forget to switch, you may deploy the wrong worker to the wrong service.
</Callout>

<Callout type="tip">
If <code>railway link</code> fails with <strong>Available options can not be empty</strong>, the CLI could not find any projects to link in the selected workspace.
</Callout>

### Create services and set variables (recommended once)

If this is the first time setting up a worker service, create the services and set variables via the setup scripts:

```bash
pnpm railway:setup:integration-refresh
pnpm railway:setup:housekeeping
pnpm railway:setup:scheduled-social-post
```

These scripts create empty services (if missing) and call <code>railway variable set</code> with <code>--skip-deploys</code> so you can safely configure variables before deploying.

### Deploy

For each deploy, the **linked** service must have <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> set to the matching <code>railpack</code> file (or use the <strong>Create services and set variables</strong> setup scripts above), otherwise Railpack will report <strong>No start command detected</strong>. Switch services with <Badge text="railway service" variant="default" /> (or <Badge text="railway unlink" variant="default" /> and <Badge text="railway link" variant="default" />) when moving between workers.

**Integration refresh** —

```bash
pnpm railway:deploy:integration-refresh
```

**Housekeeping** —

```bash
pnpm railway:deploy:housekeeping
```

**Scheduled social post** —

```bash
pnpm railway:deploy:scheduled-social-post
```

Each command ships the current directory to the **currently linked** service. Full CLI reference: <DocsExternalLink href="https://docs.railway.com/develop/cli">Railway CLI</DocsExternalLink>.

</Steps>

<Callout type="tip">
To deploy multiple workers from one project, link the CLI to a service, run <Badge text="railway up" variant="default" />, then <Badge text="railway service" variant="default" /> (or <Badge text="railway unlink" variant="default" /> + <Badge text="railway link" variant="default" />) to target the next service before deploying again.
</Callout>


## Related

<CardGrid>
<LinkCard title="Configuration - Worker" description="Env tables and script reference" href="/docs/configuration-worker" />
<LinkCard title="Production deployment" description="Vercel API and overall production picture" href="/docs/installation/production-deployment" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, queues, and transport flags" href="/docs/developer-guidelines/orchestrator-workflows" />
</CardGrid>
