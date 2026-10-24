---
title: Directory SEO & DataForSEO
description: Optional domain rating data for Directory analytics. Set DataForSEO credentials on the API and housekeeping worker.
order: 12
lastUpdated: 2026-10-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What this is

**Directory analytics** can show a **domain rating** (and history charts) for:

- The **website** on a paid workspace business profile
- **Competitor domains** the workspace adds in the app

OpenQuok loads that data from [DataForSEO](https://dataforseo.com/) and saves it in your database so the app does not call the provider on every page view.

User guide: <a href="/docs/directory-submission/directory-analytics">Directory analytics</a>.

## Do you need it?

| Goal | What to do |
| --- | --- |
| You do not use Directory analytics ratings | Leave <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> empty. The rest of OpenQuok works. |
| You want live ratings and charts | Create a DataForSEO account, set the key below, and run the **housekeeping** worker for weekly updates. |

<Callout type="warning">
<p>DataForSEO is a <strong>paid</strong> service. OpenQuok caches results to limit calls, but new domains, manual refresh, and history import can still use credits. Leave the key empty in dev unless you accept that cost.</p>
</Callout>

## Quick setup

<Steps
	howToName="Directory SEO setup"
	howToDescription="Enable domain ratings for Directory analytics"
>

### Get a DataForSEO API key

In the DataForSEO dashboard, copy your API **login** and **password**. Encode them as one Base64 string in the form <code>login:password</code> (many online Base64 encoders accept that text). That string is <Badge text="DATAFORSEO_API_KEY" variant="envBackend" />.

### Set variables on the API

Add the Directory SEO block to your **backend** env file (for example <Badge text="backend/.env.production.local" variant="envBackend" /> or your self-host <Badge text="infra/self-host/.env" variant="path" />). Names match <Badge text="backend/.env.development.example" variant="envBackend" />.

At minimum:

```bash
DATAFORSEO_API_KEY=your-base64-login-password
DIRECTORY_SEO_ENABLED=true
```

Restart the API after you change env values.

### Set the same key on the housekeeping worker

The **weekly** rating sweep runs in the **housekeeping** worker, not in the API process. Copy <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> and the <Badge text="DIRECTORY_SEO_*" variant="envBackend" /> values you use on the API into the worker env (see <Badge text="orchestrator/.env.production.example" variant="path" />). Restart the worker.

If you run Compose or Railway, use the env file or service variables for that worker. See <a href="/docs/configuration-worker">Configuration - Worker</a>.

</Steps>

## Environment variables

Set these on the **API** and on **housekeeping** (worker needs the key and weekly settings; history backfill settings are API-only).

| Variable | Default | What it does |
| --- | --- | --- |
| <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> | empty | DataForSEO credentials (Base64 <code>login:password</code>). When empty, the app shows cached data only and does not fetch new ratings. |
| <Badge text="DIRECTORY_SEO_ENABLED" variant="envBackend" /> | <code>true</code> | Turns Directory SEO API behavior on or off. |
| <Badge text="DIRECTORY_SEO_CACHE_TTL_HOURS" variant="envBackend" /> | <code>168</code> | How long to reuse a rating before calling DataForSEO again (168 hours = 7 days). |
| <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_ENABLED" variant="envBackend" /> | <code>true</code> | When <code>false</code>, housekeeping skips the weekly rating sweep. |
| <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_INTERVAL_MS" variant="envBackend" /> | <code>604800000</code> | How often housekeeping runs that sweep (default 7 days). |
| <Badge text="DIRECTORY_SEO_HISTORY_BACKFILL_MAX_DAYS" variant="envBackend" /> | <code>90</code> | Max days of chart history to import when someone opens Directory analytics history (API only). |
| <Badge text="DIRECTORY_SEO_HISTORY_BACKFILL_TTL_DAYS" variant="envBackend" /> | <code>7</code> | Min days between repeat history imports for the same domain (API only). |

## When OpenQuok calls DataForSEO

With a key set and Directory SEO enabled, paid calls can happen when:

- A domain has **no rating** or the **cache expired** (see TTL above).
- A user uses **Refresh ratings** in Directory analytics.
- Someone opens **history** or **overview** and the app imports daily rank data (up to the backfill limits).
- **Housekeeping** runs the weekly sweep for stale domains on paid workspaces.

Cached ratings stay in Postgres. Users still see old numbers if the key is missing or the provider fails; errors are logged on the server.

## Turn it off or reduce cost

- **Disable all Directory SEO API use:** <Badge text="DIRECTORY_SEO_ENABLED=false" variant="envBackend" /> on the API.
- **Keep API but stop weekly worker calls:** <Badge text="DIRECTORY_SEO_WEEKLY_REFRESH_ENABLED=false" variant="envBackend" /> on housekeeping.
- **No provider account:** leave <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> empty everywhere.

## Scheduled jobs

Weekly rating refresh runs in the **housekeeping** worker in Node. It does **not** run inside Postgres cron. Database cron jobs in OpenQuok are for other tasks only. Details: <a href="/docs/configuration-backend/database#scheduled-jobs-pg_cron-vs-housekeeping-worker">Database → Scheduled jobs</a>.

## Related

<CardGrid>
<LinkCard title="Configuration - Worker" description="Housekeeping worker env and deploy" href="/docs/configuration-worker" />
<LinkCard title="Directory analytics" description="How workspaces use ratings in the app" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Database & migrations" description="Migrations for Directory and SEO tables" href="/docs/configuration-backend/database" />
<LinkCard title="Catalog DR refresh (admin)" description="Refresh link-directory catalog ratings (admin)" href="/docs/admin/link-directory-catalog-dr-refresh" />
</CardGrid>
