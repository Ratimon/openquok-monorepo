---
title: Production - Railway
description: Deploy long-running BullMQ worker services on Railway with the monorepo build and Railway CLI.
order: 3
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This guide covers **orchestrator worker** deployments on **Railway**: always-on processes that consume **BullMQ** queues while your **API** may live on **Vercel** (or another host).

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
| **Start** — integration refresh | <Badge text="pnpm railway:orchestrator:start:integration-refresh" variant="default" /> |
| **Start** — notification email | <Badge text="pnpm railway:orchestrator:start:notification-email" variant="default" /> |
| **Start** — scheduled social post | <Badge text="pnpm railway:orchestrator:start:scheduled-social-post" variant="default" /> |

The repo includes <Badge text="railway.toml" variant="path" /> at the monorepo root with <code>buildCommand</code>, a restart policy, region <code>us-west2</code> (US West / Oregon), and replica limits for the lighter workers (<code>numReplicas = 1</code>, <code>1</code> vCPU, <code>1</code> GiB). <Badge text="scheduled-social-post" variant="default" /> uses <Badge text="railway.scheduled-social-post.toml" variant="path" /> (<code>1</code> vCPU, <code>2</code> GiB) — set that service’s Railway Config File to <code>/railway.scheduled-social-post.toml</code>. **Start command is not** fixed in those files so **each** worker can differ (<DocsExternalLink href="https://docs.railway.com/reference/config-as-code">config as code</DocsExternalLink>).

## Dashboard setup

<Steps>

### Create project resources

Add **Redis** (and reference its connection into worker variables as <Badge text="REDIS_*" variant="envBackend" />). Add **one Railway service per worker** you need (integration refresh, notification email, and/or scheduled social posts), or split later—each needs its own **Start Command**; set <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> to the <code>railpack</code> file for that worker at the repo root (see the callout below).

Name the services after the worker they run (recommended), but the exact service names are up to you. The CLI bootstrap uses the **linked** service (see “Railway CLI” below).

### Connect the GitHub repo

Use the same repository as the monorepo. Configure <DocsExternalLink href="https://docs.railway.com/deployments/monorepo">monorepo</DocsExternalLink> settings so install/build run from the **repository root**.

### Set variables per worker service

Set <Badge text="NODE_ENV=production" variant="envRuntime" />, Redis, Supabase, and any provider/email keys from <a href="/docs/configuration-worker">Configuration - Worker</a>.

<Callout type="tip" title="Railpack config">
Set <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> (per service) to one of: <Badge text="railpack.integration-refresh.json" variant="param" />, <Badge text="railpack.notification-email.json" variant="param" />, or <Badge text="railpack.scheduled-social-post.json" variant="param" /> (dashboard or <Badge text="railway variables set" variant="default" /> after <Badge text="railway service" variant="default" />).
</Callout>

### Set Start Command

In the service **Settings → Deploy → Start Command**, set exactly one of the following (from the monorepo root).

**Integration refresh worker** —

```bash
pnpm railway:orchestrator:start:integration-refresh
```

**Notification email worker** —

```bash
pnpm railway:orchestrator:start:notification-email
```

**Scheduled social post worker** (calendar publishes at <code>publish_date</code>) —

```bash
pnpm railway:orchestrator:start:scheduled-social-post
```

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
- <Badge text="pnpm railway:setup:notification-email" variant="default" /> (one-time: create service + set variables via CLI)
- <Badge text="pnpm railway:setup:scheduled-social-post" variant="default" /> (one-time: create service + set variables via CLI)
- <Badge text="pnpm railway:deploy:integration-refresh" variant="default" />
- <Badge text="pnpm railway:deploy:notification-email" variant="default" />
- <Badge text="pnpm railway:deploy:scheduled-social-post" variant="default" />

### Deploy a worker from your machine

<Steps>

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
pnpm railway:setup:notification-email
pnpm railway:setup:scheduled-social-post
```

These scripts create empty services (if missing) and call <code>railway variable set</code> with <code>--skip-deploys</code> so you can safely configure variables before deploying.

### Deploy

For each deploy, the **linked** service must have <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> set to the matching <code>railpack</code> file (or use the <strong>Create services and set variables</strong> setup scripts above), otherwise Railpack will report <strong>No start command detected</strong>. Switch services with <Badge text="railway service" variant="default" /> (or <Badge text="railway unlink" variant="default" /> and <Badge text="railway link" variant="default" />) when moving between workers.

**Integration refresh** —

```bash
pnpm railway:deploy:integration-refresh
```

**Notification email** —

```bash
pnpm railway:deploy:notification-email
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
