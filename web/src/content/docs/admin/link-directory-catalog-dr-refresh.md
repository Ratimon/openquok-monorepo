---
title: Catalog DR refresh for Backlinks Hub Page
description: Refresh domain rating on link directory sites from DataForSEO using the CLI or action from admin UI.
order: 4
lastUpdated: 2026-10-20
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What this does

The catalog refresh updates **domain rating (DR)** on <Badge text="link_directory_sites" variant="path" /> for each Build Backlinks destination. OpenQuok reads the hostname from <Badge text="site_url" variant="param" />, looks up or fetches DR through the global Directory SEO cache, then stores a rounded score on the site row.

Customers see that DR on the public hub, site detail pages, and the **My Products** directory grid. This path is separate from **Directory analytics** on a workspace (product URL and competitors).

## Before you start

Set on the machine that runs the script (usually the same env as the backend API):

| Variable | Role |
| --- | --- |
| <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> | DataForSEO credentials. When empty, the script uses an existing snapshot only. It does not call the provider. |
| <Badge text="DIRECTORY_SEO_ENABLED" variant="envBackend" /> | Must be <code>true</code> for live lookups. |

The global cache TTL is <Badge text="DIRECTORY_SEO_CACHE_TTL_HOURS" variant="envBackend" /> (default 7 days). Without <Badge text="--force" variant="param" />, the script skips a paid API call when the snapshot is still fresh.

<Callout type="warning">
<p>Each forced or stale refresh can bill DataForSEO. Test with <Badge text="--dry-run" variant="param" /> or <Badge text="--slug=…" variant="param" /> before you refresh every site.</p>
</Callout>

Editors with the **editor** role can also run **Refresh catalog DR** on <a href="/secret-admin/link-directory-manager/sites">Secret admin → Link directory → Sites</a>. That action calls the same backend service with **published sites only** and **force** enabled.

## Run the CLI script

From the repo root:

```bash
pnpm --filter ./backend run script:refresh-link-directory-catalog-dr
```

Equivalent:

```bash
pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts
```

Load <Badge text="backend/.env.development.local" variant="envBackend" /> (or production env) so the script sees DataForSEO keys.

## Command flags

| Flag | Effect |
| --- | --- |
| <Badge text="--force" variant="param" /> | Ignore the snapshot TTL. Call DataForSEO when the key is set. |
| <Badge text="--published-only" variant="param" /> | Process only rows where <Badge text="is_admin_published" variant="param" /> is true. |
| <Badge text="--slug=producthunt" variant="param" /> | Refresh one site by slug. |
| <Badge text="--site-id=&lt;uuid&gt;" variant="param" /> | Refresh one site by id. |
| <Badge text="--dry-run" variant="param" /> | Run lookups but do not write <Badge text="link_directory_sites" variant="path" />. Snapshots may still update. |

Combine flags as needed. Example:

```bash
pnpm --filter ./backend run script:refresh-link-directory-catalog-dr -- --published-only --force
```

## What the database stores

### Catalog site row

When the run succeeds and dry-run is off, each processed site updates:

| Column | Value |
| --- | --- |
| <Badge text="domain_rating" variant="param" /> | Rounded integer DR |
| <Badge text="metrics_updated_at" variant="param" /> | Time from the snapshot |
| <Badge text="metrics_source" variant="param" /> | <code>dataforseo</code> |

The script does **not** change <Badge text="domain_authority" variant="param" />, <Badge text="monthly_visits" variant="param" />, or other site copy fields. Enter DA and traffic in the site editor when you maintain them by hand.

### Global DR cache

For each hostname, <Badge text="DirectorySeoService.refreshDomain" variant="path" /> may upsert <Badge text="seo_domain_metric_snapshots" variant="path" /> when the cache is stale or you use <Badge text="--force" variant="param" />. It may append a row to <Badge text="seo_domain_metric_history" variant="path" /> after a live refresh. It does **not** run timeseries history backfill (that runs when a user opens Directory analytics charts).

## Manual DR in the editor

You can type DR on a site in secret-admin. That value stays until the next catalog refresh overwrites <Badge text="domain_rating" variant="param" />. Use manual entry when you have no DataForSEO key or you need a one-off correction.

## Related

<CardGrid>
<LinkCard title="Directory SEO & DataForSEO" description="Cache TTL, worker sweep, and API env vars" href="/docs/configuration-backend/directory-seo" />
<LinkCard title="Directory analytics (product)" description="My Products grid DR vs workspace Directory tab" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Admin overview" description="Other operator setup guides" href="/docs/admin" />
</CardGrid>
