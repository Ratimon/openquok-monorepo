---
title: Maintenance mode
description: Tiered write-freeze across backend, web, and workers — for Supabase region cutover and other maintenance windows.
order: 6
lastUpdated: 2026-09-19
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Badge text="MAINTENANCE_MODE" variant="envBackend" /> controls a **tiered** maintenance flag shared by the **API** (<Badge text="/backend" variant="path" />), **web** (<Badge text="/web" variant="path" />), and **BullMQ workers** (<Badge text="/orchestrator" variant="path" />). Use it to stop database writes during a Supabase region cutover or other short ops window without taking down public marketing pages, docs, or blog content.

| Mode | API | Web UI | Workers |
| --- | --- | --- | --- |
| <Badge text="off" variant="default" /> | Normal | Normal | Normal |
| <Badge text="banner" variant="default" /> | Normal | Optional notice on public layouts | Normal |
| <Badge text="freeze_writes" variant="default" /> | Block mutations (503) | Redirect auth/app routes to <Badge text="/maintenance" variant="path" /> | Exit on startup (no job consumption) |

Example templates:

- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.production.example"><Badge text="web/.env.production.example" variant="envWeb" /></DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/orchestrator/.env.production.example"><Badge text="orchestrator/.env.production.example" variant="path" /></DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/.env.example"><Badge text="infra/self-host/.env.example" variant="path" /></DocsExternalLink>

<Callout type="warning">
<p>During a cutover, deploy <Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" /> on <strong>all three</strong> surfaces — Vercel backend, Vercel web, and Railway workers (or self-host API, web, and worker containers). If workers keep running while the API is frozen, scheduled posts and notification jobs can still mutate Postgres.</p>
</Callout>

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| <Badge text="MAINTENANCE_MODE" variant="envBackend" /> | Backend, web (server), workers | <Badge text="off" variant="default" />, <Badge text="banner" variant="default" />, or <Badge text="freeze_writes" variant="default" /> |
| <Badge text="MAINTENANCE_RETRY_AFTER_SECONDS" variant="envBackend" /> | Backend only | <code>Retry-After</code> header on blocked API mutations (default <code>3600</code>) |
| <Badge text="MAINTENANCE_BYPASS_SECRET" variant="envBackend" /> | Backend only | Optional operator header <Badge text="X-Maintenance-Bypass" variant="envBackend" /> for smoke tests during <Badge text="freeze_writes" variant="default" /> |

On the **web** app, <Badge text="MAINTENANCE_MODE" variant="envBackend" /> is **server-only** (not a <Badge text="VITE_*" variant="envWeb" /> variable). Set it in <Badge text="web/.env.production.local" variant="envWeb" />.

Workers read the same keys through <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (orchestrator imports backend config). Keep worker env aligned with the API.

## What stays live during <Badge text="freeze_writes" variant="default" />

**Public SEO and CMS reads**

- Marketing pages under <Badge text="(public)/" variant="path" />, docs, legal, pricing, blog, channels, tools, and similar routes
- API <Badge text="GET" variant="default" />, <Badge text="HEAD" variant="default" />, and <Badge text="OPTIONS" variant="default" /> — including public CMS catalog routes (<Badge text="/company/*" variant="path" />, <Badge text="/blog-system/*" variant="path" />, <Badge text="/listings/*" variant="path" />)

**Operational endpoints**

- <Badge text="/health" variant="path" /> and <Badge text="/sitemap.xml" variant="path" />
- Stripe webhooks under <Badge text="/webhooks/" variant="path" /> (small billing writes during a short window are acceptable; Stripe retries on 503)

**Frozen surfaces**

- API mutations (auth, public API writes, MCP POST, uploads, and anonymous public writes)
- Web auth and app routes — sign-in, account, editor, admin, OAuth approve, join-org, CLI device pages → <Badge text="/maintenance" variant="path" />
- BullMQ workers — process exits immediately without consuming queues

## Operator bypass (optional)

When <Badge text="MAINTENANCE_BYPASS_SECRET" variant="envBackend" /> is set on the API, send the same value in the <Badge text="X-Maintenance-Bypass" variant="envBackend" /> request header to allow a single mutation during <Badge text="freeze_writes" variant="default" /> (for example a smoke-test POST). Do not share the secret publicly.

## Cutover timeline (region migration)

Use with <a href="/docs/configuration-backend/supabase-backup">Supabase backup</a>. Typical sequence:

<Steps
	howToName="Maintenance window for Supabase cutover"
	howToDescription="Enable write-freeze, take a fresh backup, restore, migrate Storage, cut over env, then resume."
>

### Enable write-freeze on all services

Set <Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" /> on the Vercel **backend** and **web** projects and on every Railway **worker** service (or recreate self-host API, web, and worker containers). Redeploy.

Verify: public blog returns 200; <Badge text="/sign-in" variant="path" /> redirects to <Badge text="/maintenance" variant="path" />; a test POST to the API returns 503 with <code>Retry-After</code>.

### Run a fresh pre-cutover backup

With writes frozen, run Layer 2 and Layer 3 again using a <code>-pre-cutover</code> suffix (see Supabase backup docs).

### Restore, migrate Storage, and cut over env

Follow <a href="/docs/configuration-backend/supabase-backup#cutover-freeze-runbook">Cutover freeze runbook</a>. Update Supabase URLs and keys in production env only after restore and Storage migration succeed.

### Smoke test and resume

Run <code>pnpm prod-backup:smoke</code> (see <a href="/docs/configuration-backend/supabase-backup#smoke-test-then-resume-writes">Supabase backup — smoke test</a>), then finish the printed manual checks (Google login, scheduled post, provider OAuth). Set <Badge text="MAINTENANCE_MODE=off" variant="envBackend" /> on API, web, and workers; redeploy and resume worker processes.

</Steps>

<Callout type="note" title="Order matters">
<p>Enable <Badge text="freeze_writes" variant="default" /> <strong>before</strong> the final Layer 2 dump — not after. Workers should not consume jobs while the database is being restored.</p>
</Callout>

## Example (production cutover)

Backend (<Badge text="backend/.env.production.local" variant="envBackend" />):

```bash
MAINTENANCE_MODE=freeze_writes
MAINTENANCE_RETRY_AFTER_SECONDS=3600
MAINTENANCE_BYPASS_SECRET=your-operator-secret
```

Web server env (<Badge text="web/.env.production.local" variant="envWeb" /> — sync to Vercel, no <Badge text="VITE_" variant="envWeb" /> prefix):

```bash
MAINTENANCE_MODE=freeze_writes
```

Workers (<Badge text="orchestrator/.env.production.local" variant="envBackend" /> — same values as API):

```bash
MAINTENANCE_MODE=freeze_writes
MAINTENANCE_RETRY_AFTER_SECONDS=3600
MAINTENANCE_BYPASS_SECRET=your-operator-secret
```

Self-host Compose: set the same keys in <Badge text="infra/self-host/.env" variant="path" /> (API and workers load the full file; the web service receives <Badge text="MAINTENANCE_MODE" variant="envBackend" /> at runtime). Recreate containers after changes.

## Related configuration

<CardGrid>
<LinkCard title="Supabase backup" description="Layers 1–3, Phase B0 target project, and restore cutover" href="/docs/configuration-backend/supabase-backup" />
<LinkCard title="Production deployment" description="Vercel API, web, and optional Railway workers" href="/docs/installation/production-deployment" />
<LinkCard title="Docker Compose (self-host)" description="MAINTENANCE_MODE in infra/self-host/.env" href="/docs/installation/docker-compose" />
<LinkCard title="Configuration - Backend" description="API env vars and GlobalConfig" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Worker" description="BullMQ workers and orchestrator env" href="/docs/configuration-worker" />
<LinkCard title="Configuration - Web" description="Server-only env on the web project" href="/docs/configuration-web" />
</CardGrid>
