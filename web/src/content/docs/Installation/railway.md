---
title: Railway
description: Deploy long-running BullMQ worker services on Railway with the monorepo build and Railway CLI.
order: 3
lastUpdated: 2026-04-23
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This guide covers **orchestrator worker** deployments on **Railway**: always-on processes that consume **BullMQ** queues while your **API** may live on **Vercel** (or another host).

Railway treats these as <DocsExternalLink href="https://docs.railway.com/services#persistent-services">persistent services</DocsExternalLink> (containers that keep running). See also <a href="/docs/configuration-worker">Orchestrator workers</a> for env vars and <a href="/docs/developer-guidelines/orchestrator-workflows">Orchestrator workflows</a> for when to use <code>bullmq</code> transport.

## Prerequisites

- Railway account and <DocsExternalLink href="https://docs.railway.com/develop/cli">Railway CLI</DocsExternalLink> on your <code>PATH</code>. This guide uses the global <code>railway</code> command.
- Worker environment variables set on each Railway service (applies to **dashboard deploys** and **CLI deploys**):
  - <Badge text="REDIS_*" variant="envBackend" /> (shared with your API). See <a href="/docs/configuration-backend/redis">Redis cache</a>.
  - Supabase keys (at minimum <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> and <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />; in production also <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" />). See <a href="/docs/configuration-worker">Orchestrator workers</a>.
  - <code>RAILPACK_CONFIG_FILE</code> set per worker service (see “Set variables per worker service” below).

## Build and start (summary)

| Phase | Command / setting |
|-------|-------------------|
| **Build** (repo root) | <code>pnpm install && pnpm railway:orchestrator:build</code> |
| **Start** — integration refresh | <code>pnpm railway:orchestrator:start:integration-refresh</code> |
| **Start** — notification email | <code>pnpm railway:orchestrator:start:notification-email</code> |
| **Start** — scheduled social post | <code>pnpm railway:orchestrator:start:scheduled-social-post</code> |

The repo includes <Badge text="railway.toml" variant="path" /> at the monorepo root with <code>buildCommand</code> and a restart policy; **start command is not** fixed in that file so **each** Railway **worker** service can use the **same image/build** with a different start line (<DocsExternalLink href="https://docs.railway.com/reference/config-as-code">config as code</DocsExternalLink>).

## Dashboard setup

<Steps>

### Create project resources

Add **Redis** (and reference its connection into worker variables as <Badge text="REDIS_*" variant="envBackend" />). Add **one Railway service per worker** you need (integration refresh, notification email, and/or scheduled social posts), or split later—each needs its own **Start Command**; set <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> to the <code>railpack</code> file for that worker at the repo root (see the callout below).

Name the services after the worker they run (recommended), but the exact service names are up to you. The CLI bootstrap uses the **linked** service (see “Railway CLI” below).

### Connect the GitHub repo

Use the same repository as the monorepo. Configure <DocsExternalLink href="https://docs.railway.com/deployments/monorepo">monorepo</DocsExternalLink> settings so install/build run from the **repository root**.

### Set variables per worker service

Set <Badge text="NODE_ENV=production" variant="envRuntime" />, Redis, Supabase, and any provider/email keys from <a href="/docs/configuration-worker">Orchestrator workers</a>.

<Callout type="tip" title="Railpack config">
Set <code>RAILPACK_CONFIG_FILE</code> (per service) to one of: <code>railpack.integration-refresh.json</code>, <code>railpack.notification-email.json</code>, or <code>railpack.scheduled-social-post.json</code> (dashboard or <code>railway variables set</code> after <code>railway service</code>).
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

- <code>pnpm railway:setup:integration-refresh</code> (one-time: create service + set variables via CLI)
- <code>pnpm railway:setup:notification-email</code> (one-time: create service + set variables via CLI)
- <code>pnpm railway:setup:scheduled-social-post</code> (one-time: create service + set variables via CLI)
- <code>pnpm railway:deploy:integration-refresh</code>
- <code>pnpm railway:deploy:notification-email</code>
- <code>pnpm railway:deploy:scheduled-social-post</code>

### Deploy a worker from your machine

<Steps>

### Authenticate and link

Choose your Railway **project** and the **worker service**. Run <code>railway link</code> again only if you need a fresh link.

From the **repository root**:

```bash
railway login
railway init
railway link
railway service
```

If you see <strong>No service linked</strong>, run <code>railway service</code> to link a service for this directory.

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

For each deploy, the **linked** service must have <Badge text="RAILPACK_CONFIG_FILE" variant="envRuntime" /> set to the matching <code>railpack</code> file (or use the <strong>Create services and set variables</strong> setup scripts above), otherwise Railpack will report <strong>No start command detected</strong>. Switch services with <code>railway service</code> (or <code>railway unlink</code> and <code>railway link</code>) when moving between workers.

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
To deploy multiple workers from one project, link the CLI to a service, run <code>railway up</code>, then <code>railway service</code> (or <code>railway unlink</code> + <code>railway link</code>) to target the next service before deploying again.
</Callout>


## Related

<CardGrid>
<LinkCard title="Orchestrator workers (config)" description="Env tables and script reference" href="/docs/configuration-worker" />
<LinkCard title="Production deployment" description="Vercel API and overall production picture" href="/docs/Installation/production-deployment" />
<LinkCard title="Orchestrator workflows" description="Flowcraft, queues, and transport flags" href="/docs/developer-guidelines/orchestrator-workflows" />
</CardGrid>
