---
title: Directory SEO & DataForSEO
description: Configure live domain rating cache, DataForSEO credentials, and Directory analytics entitlements on the OpenQuok backend.
order: 12
lastUpdated: 2026-10-20
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**Directory SEO** stores **global, rebuildable** domain rating snapshots for:

- The **website URL** on each paid workspace’s main business profile
- **Competitor domains** users add under Directory analytics

OpenQuok calls DataForSEO <Badge text="POST /v3/backlinks/summary/live" variant="path" /> only for those hostnames. Results land in <Badge text="seo_domain_metric_snapshots" variant="path" /> (cache) and <Badge text="seo_domain_metric_history" variant="path" /> (append-only samples). The API and housekeeping worker are **stateless**: each refresh reads TTL from Postgres and upserts idempotently — no per-pod in-memory schedule.

User-facing docs: <a href="/docs/directory-submission/directory-analytics">Directory analytics</a>.

## Environment variables

Set these on the **backend API** (manual refresh and read APIs) and on the **housekeeping** worker (weekly sweep). Names match <Badge text="backend/config/GlobalConfig.ts" variant="path" /> and <Badge text="backend/.env.development.example" variant="envBackend" />.

| Variable | Default | Role |
| --- | --- | --- |
| <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> | empty | Base64-encoded <code>login:password</code> for HTTP Basic auth. When empty, refresh endpoints no-op and return existing cache rows only. |
| <Badge text="DIRECTORY_SEO_ENABLED" variant="envBackend" /> | <code>true</code> | Master switch for Directory SEO features in the API. |
| <Badge text="DIRECTORY_SEO_CACHE_TTL_HOURS" variant="envBackend" /> | <code>168</code> | Global cache TTL per domain (7 days). Skips paid API calls while a snapshot is fresh unless <code>force</code> is added in a future tier. |
| <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_ENABLED" variant="envBackend" /> | <code>true</code> | When <code>false</code>, the housekeeping timer does not run <code>runWeeklyRefresh()</code>. |
| <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_INTERVAL_MS" variant="envBackend" /> | <code>604800000</code> | How often the housekeeping process enqueues the weekly Directory SEO sweep (default 7 days). |

<Callout type="note">
<p>Plan limits (<Badge text="directory_seo_enabled" variant="param" />, competitor caps per workspace) live in subscription catalog code — not env vars. <strong>Free</strong> tiers disable Directory analytics regardless of DataForSEO credentials.</p>
</Callout>

<Callout type="warning" title="Local dev and API credits">
<p>Leave <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> empty in <Badge text="backend/.env.development.local" variant="envBackend" /> unless you want paid <code>summary/live</code> calls. With a key set, the API still respects <Badge text="DIRECTORY_SEO_CACHE_TTL_HOURS" variant="envBackend" /> for normal Directory analytics loads, but <strong>manual refresh</strong>, <strong>new or stale domains</strong>, <strong>bulk catalog DR refresh</strong>, and the <strong>housekeeping weekly sweep</strong> can each trigger billable requests. Disable <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_ENABLED" variant="envBackend" /> when running the worker locally with a production key.</p>
</Callout>

## Data tier (operators)

| Table | Treat as |
| --- | --- |
| <Badge text="directory_seo_competitors" variant="path" /> | User config — do not truncate |
| <Badge text="seo_domain_metric_snapshots" variant="path" /> | Rebuildable cache — safe to delete and refill |
| <Badge text="seo_domain_metric_history" variant="path" /> | Audit / chart history — append-oriented |

Writes to metric tables use the backend service role; workspace members read snapshots through session APIs with RLS on competitor rows.

## Scheduled refresh vs pg_cron

**Postgres <code>pg&#95;cron</code>** stays SQL-only (for example refresh token cleanup). **DataForSEO HTTP** runs in Node on the **housekeeping** worker, not inside <code>cron.schedule</code> in SQL.

See <a href="/docs/configuration-backend/database#scheduled-jobs-pg_cron-vs-housekeeping-worker">Database → Scheduled jobs</a> and <a href="/docs/configuration-worker">Configuration - Worker</a>.

## Related

<CardGrid>
<LinkCard title="Configuration - Worker" description="Housekeeping timers, Redis, and minimal worker env surface" href="/docs/configuration-worker" />
<LinkCard title="Database & migrations" description="Aggregated migrations including auto-launch SEO tables" href="/docs/configuration-backend/database" />
<LinkCard title="Directory analytics" description="Product UI for DR charts and competitors" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Railway (workers)" description="Deploy housekeeping alongside other orchestrator workers" href="/docs/configuration-worker/railway" />
</CardGrid>
