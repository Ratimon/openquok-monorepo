---
title: Catalog backfill for Build Backlinks Hub
description: Upsert link-directory hub sites and opportunities from JSON after deploy or local db reset.
order: 3.5
lastUpdated: 2026-11-17
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What this does

The catalog backfill applies **Build Backlinks** destination rows from a versioned JSON catalog into:

- <Badge text="link_directory_sites" variant="path" />
- <Badge text="link_directory_opportunities" variant="path" />
- <Badge text="link_directory_site_tags_association" variant="path" />

After hub upserts, the runner also **relinks** <Badge text="auto_launch_destinations.link_directory_opportunity_id" variant="path" /> when an opportunity’s <Badge text="auto_launch_provider_slug" variant="param" /> matches a destination’s <Badge text="provider_slug" variant="param" /> (catalog-only sites after local <Badge text="supabase db reset" variant="default" />, where destination seed SQL ran before hub rows existed). You do not need to re-run destination seed SQL locally for that FK alone.

New hub destinations (for example <strong>Skool</strong>) can ship in the repo catalog without a dedicated SQL seed migration. Operators run the script with the Supabase **service role** key, the same operational model as <Badge text="pnpm backend:db:promote-platform-admin" variant="default" />.

**Source of truth:** <Badge text="backend/scripts/catalog/directory/*.json" variant="path" /> (one file per site slug, e.g. <Badge text="skool.json" variant="path" />, <Badge text="tinylaunch.json" variant="path" />)

**Runner:** <Badge text="backend/scripts/backfill_link_directory_catalog.mjs" variant="path" />

## When to use this vs Secret admin

| Situation | Use |
| --- | --- |
| Ship a **new catalog site** from the repo (append JSON, run backfill) | This CLI backfill |
| **One-off copy edits**, publish toggles, or opportunity tweaks on existing rows | <a href="/secret-admin/link-directory-manager/sites">Secret admin → Link directory → Sites</a> |
| Refresh **domain rating** after a site exists | <a href="/docs/admin/link-directory-catalog-dr-refresh">Catalog DR refresh</a> |

The backfill **skips overwriting populated editorial fields** on existing rows unless you pass <Badge text="--force" variant="param" />. Secret admin remains the day-to-day editor for live copy.

## Before you start

The script loads env from <Badge text="backend/.env.development.local" variant="envBackend" /> by default (or <Badge text="backend/.env.production.local" variant="envBackend" /> for production).

| Variable | Role |
| --- | --- |
| <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> | Supabase project URL |
| <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | Service role — required for direct table upserts |

<Callout type="warning">
<p>This path writes through the service role and <strong>does not</strong> run the API cache invalidation that secret-admin mutations trigger. Published hub and site-detail responses may be cached for up to about five minutes. After production backfill, wait for TTL expiry or restart your cache layer before you expect every edge to show new rows immediately.</p>
</Callout>

## Local development (after db reset)

SQL migrations and legacy seeds repopulate categories, tags, and exemplar sites, but **catalog-only destinations** (JSON-only entries) are not re-inserted automatically when you reset.

<Steps
	howToName="Backfill Build Backlinks catalog locally"
	howToDescription="Restore script-only link-directory destinations after supabase db reset."
>

### Reset the local database

From <Badge text="backend/" variant="path" />:

```bash
supabase db reset
```

See <a href="/docs/configuration-backend/database">Database &amp; migrations</a> for the full local workflow (CLI, env keys, optional typegen).

### Run the backfill

From the **repo root**:

```bash
pnpm backend:db:backfill-link-directory-catalog
```

Limit to one destination while testing:

```bash
pnpm backend:db:backfill-link-directory-catalog -- --slug skool
```

### Verify in the app

With the web and API dev servers running (local Supabase + backend on port 3000; Vite on <code>https://localhost:5173</code>), open <a href="/build-backlinks">Build Backlinks</a> and <a href="/build-backlinks/skool">/build-backlinks/skool</a>. Confirm:

- <strong>Skool</strong> appears on the hub grid with the link-directory logo.
- Two opportunities: <strong>profile-bio</strong> (Connect Skool → connect channel) and <strong>group-post</strong> (Schedule with OpenQuok).
- Step copy and effort badges match the site shard under <Badge text="backend/scripts/catalog/directory/" variant="path" />.

<Callout type="note">
<p>If <Badge text="CACHE_ENABLED" variant="envBackend" /> is <code>true</code> but Redis is not running, link-directory API responses can hang until cache read times out. Use a running Redis instance or disable cache in <Badge text="backend/.env.development.local" variant="envBackend" /> while verifying locally.</p>
</Callout>

Idempotency: run the same backfill again without <Badge text="--force" variant="param" /> — existing Skool rows should log <code>SKIP SITE (populated)</code> and <code>SKIP OPP (populated)</code>.

</Steps>

## Production rollout

Dry-run first:

```bash
pnpm backend:db:backfill-link-directory-catalog:prod -- --dry-run --slug skool
```

Apply:

```bash
pnpm backend:db:backfill-link-directory-catalog:prod -- --slug skool
```

The <Badge text=":prod" variant="param" /> script alias passes <Badge text="--env-file .env.production.local" variant="param" />.

After the site row exists in production, you can optionally replace editor-estimate <Badge text="domain_rating" variant="param" /> from JSON with a live DataForSEO value. Commands, env vars, billing, and hub cache behavior are documented on <a href="/docs/admin/link-directory-catalog-dr-refresh">Catalog DR refresh</a> — skip that step if you are fine keeping the catalog estimate.

## Command flags

| Flag | Effect |
| --- | --- |
| <Badge text="--dry-run" variant="param" /> | Log planned upserts; no writes |
| <Badge text="--force" variant="param" /> | Replace existing site/opportunity rows and **re-sync** tag associations |
| <Badge text="--slug skool" variant="param" /> | Process only this site slug (repeat the flag for multiple slugs) |
| <Badge text="--list-missing" variant="param" /> | List catalog slugs that are not yet in <Badge text="link_directory_sites" variant="path" /> |
| <Badge text="--catalog &lt;path&gt;" variant="param" /> | Override the default JSON file |
| <Badge text="--env-file &lt;path&gt;" variant="param" /> | Env file relative to <Badge text="backend/" variant="path" /> |

Equivalent from the backend package:

```bash
pnpm --filter ./backend run db:backfill-link-directory-catalog
```

Pass script options after <code>--</code> when invoking from the repo root.

## Idempotency and safety

- **Second run without <Badge text="--force" variant="param" />:** Existing rows with editorial content are left intact; missing rows are inserted.
- **<Badge text="--force" variant="param" />:** Overwrites catalog-shaped fields and replaces tag associations from <Badge text="tag_slugs" variant="param" /> in JSON.
- **Stable UUIDs** in the catalog keep upserts deterministic across environments.

## Adding a future catalog site

1. Add <Badge text="backend/scripts/catalog/directory/&lt;site-slug&gt;.json" variant="path" /> with top-level <Badge text="site" variant="param" /> and <Badge text="opportunities" variant="param" /> keys (use new UUIDs; resolve slugs for categories, opportunity types, and tags).
2. Add a self-contained hub logo at <Badge text="web/static/icons/link-directory/&lt;slug&gt;.svg" variant="path" />.
3. Run backfill with <Badge text="--slug &lt;slug&gt;" variant="param" /> in dev, then production — no migration PR required for catalog-only destinations.

## Related

<CardGrid>
<LinkCard title="Catalog DR refresh" description="Update domain rating on published link-directory sites" href="/docs/admin/link-directory-catalog-dr-refresh" />
<LinkCard title="Database & migrations" description="Local supabase start, db reset, and typegen" href="/docs/configuration-backend/database" />
<LinkCard title="Admin overview" description="Other operator setup guides" href="/docs/admin" />
</CardGrid>