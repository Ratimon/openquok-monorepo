---
title: Catalog backfill for Building Blocks and Playbooks
description: Upsert extension and stack listings from JSON after deploy or local db reset.
order: 3.6
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What this does

The listings catalog backfill applies **Building Blocks** (<Badge text="listing_kind = extension" variant="param" />) and **Playbooks** (<Badge text="listing_kind = stack" variant="param" />) rows from versioned JSON into:

- <Badge text="listings" variant="path" />
- <Badge text="listings_listing_tags_association" variant="path" />
- <Badge text="listing_stack_members" variant="path" /> (playbooks only)

Official hub listings use owner <Badge text="openquok" variant="default" /> (see user-management catalog creator seed). The runner writes <Badge text="slug" variant="param" /> explicitly from JSON — the secret-admin API derives slug from title, so catalog JSON must stay the source of stable slugs (for example <code>openquok-core</code>, <code>viral-tiktok-carousel</code>).

New catalog-only extensions or playbooks can ship in the repo JSON without a dedicated SQL seed migration. Operators run the script with the Supabase **service role** key, the same operational model as <Badge text="pnpm backend:db:promote-platform-admin" variant="default" />.

| Hub | Catalog shards | CLI kind |
| --- | --- | --- |
| <a href="/building-blocks">Building Blocks</a> | <Badge text="backend/scripts/catalog/building-blocks/*.json" variant="path" /> (e.g. <Badge text="openquok-core.json" variant="path" />) | <Badge text="extension" variant="param" /> |
| <a href="/playbooks">Playbooks</a> | <Badge text="backend/scripts/catalog/playbooks/*.json" variant="path" /> (e.g. <Badge text="viral-tiktok-carousel.json" variant="path" />) | <Badge text="stack" variant="param" /> |

**Runner:** <Badge text="backend/scripts/backfill_listings_catalog.mjs" variant="path" />

## When to use this vs Secret admin

| Situation | Use |
| --- | --- |
| Ship a **new catalog listing** from the repo (append JSON, run backfill) | This CLI backfill |
| **One-off copy edits**, publish toggles, image upload, or stack membership tweaks on existing rows | <a href="/secret-admin/catalog-manager/building-blocks">Secret admin → Building Blocks</a> or <a href="/secret-admin/catalog-manager/playbooks">Playbooks</a> |
| Pull production editorial copy into repo JSON | <Badge text="pnpm sync:listings-building-blocks-catalog-from-prod" variant="default" /> or <Badge text="pnpm sync:listings-playbooks-catalog-from-prod" variant="default" /> |

The backfill **skips overwriting populated editorial fields** on existing rows unless you pass <Badge text="--force" variant="param" />. Secret admin remains the day-to-day editor for live copy. Image assets in JSON use HTTPS URLs only — upload new files in secret admin when needed (v1 does not upload to storage from the CLI).

<Callout type="note">
<p><strong>Run order:</strong> backfill <strong>Building Blocks</strong> before <strong>Playbooks</strong> when playbook <Badge text="stack_members" variant="param" /> reference extension slugs that are new or only exist in JSON.</p>
</Callout>

## Before you start

The script loads env from <Badge text="backend/.env.development.local" variant="envBackend" /> by default (or <Badge text="backend/.env.production.local" variant="envBackend" /> for production).

| Variable | Role |
| --- | --- |
| <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> | Supabase project URL |
| <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | Service role — required for direct table upserts |

<Callout type="warning">
<p>This path writes through the service role and <strong>does not</strong> run the API cache invalidation that secret-admin mutations trigger. Published hub and listing-detail responses may be cached for up to about five minutes. After production backfill, wait for TTL expiry or restart your cache layer before you expect every edge to show new rows immediately.</p>
</Callout>

## Local development (after db reset)

SQL migrations and legacy seeds repopulate categories, tags, and exemplar listings, but **catalog-only rows** (JSON-only entries) are not re-inserted automatically when you reset.

<Steps
	howToName="Backfill listings catalog locally"
	howToDescription="Restore script-only Building Blocks and Playbooks after supabase db reset."
>

### Reset the local database

From <Badge text="backend/" variant="path" />:

```bash
supabase db reset
```

See <a href="/docs/configuration-backend/database">Database &amp; migrations</a> for the full local workflow (CLI, env keys, optional typegen).

### Backfill Building Blocks

From the **repo root**:

```bash
pnpm backend:db:backfill-listings-building-blocks
```

Limit to one listing while testing:

```bash
pnpm backend:db:backfill-listings-building-blocks -- --dry-run --slug openquok-core
```

### Backfill Playbooks (after extensions exist)

```bash
pnpm backend:db:backfill-listings-playbooks
```

Example dry-run for the exemplar stack:

```bash
pnpm backend:db:backfill-listings-playbooks -- --dry-run --slug viral-tiktok-carousel
```

### Verify in the app

With the web and API dev servers running, open <a href="/building-blocks">Building Blocks</a>, <a href="/building-blocks/openquok-core">/building-blocks/openquok-core</a>, <a href="/playbooks">Playbooks</a>, and <a href="/playbooks/viral-tiktok-carousel">/playbooks/viral-tiktok-carousel</a>. Confirm cards, publish state, tags, and playbook stack members match the JSON catalogs.

<Callout type="note">
<p>If <Badge text="CACHE_ENABLED" variant="envBackend" /> is <code>true</code> but Redis is not running, listing API responses can hang until cache read times out. Use a running Redis instance or disable cache in <Badge text="backend/.env.development.local" variant="envBackend" /> while verifying locally.</p>
</Callout>

Idempotency: run the same backfill again without <Badge text="--force" variant="param" /> — existing rows with editorial content should log a skip; missing rows are inserted.

</Steps>

## Production rollout

Dry-run first:

```bash
pnpm backend:db:backfill-listings-building-blocks:prod -- --dry-run --slug openquok-core
pnpm backend:db:backfill-listings-playbooks:prod -- --dry-run --slug viral-tiktok-carousel
```

Apply:

```bash
pnpm backend:db:backfill-listings-building-blocks:prod -- --slug openquok-core
pnpm backend:db:backfill-listings-playbooks:prod -- --slug viral-tiktok-carousel
```

The <Badge text=":prod" variant="param" /> script aliases pass <Badge text="--env-file .env.production.local" variant="param" />.

## Command flags

| Flag | Effect |
| --- | --- |
| <Badge text="--dry-run" variant="param" /> | Log planned upserts; no writes |
| <Badge text="--force" variant="param" /> | Replace existing listing rows and **re-sync** tag associations and stack members |
| <Badge text="--slug openquok-core" variant="param" /> | Process only this listing slug (repeat the flag for multiple slugs) |
| <Badge text="--list-missing" variant="param" /> | List catalog slugs that are not yet in <Badge text="listings" variant="path" /> |
| <Badge text="--catalog &lt;path&gt;" variant="param" /> | Hub directory or a single <Badge text="&lt;slug&gt;.json" variant="path" /> (npm scripts point at each hub folder) |
| <Badge text="--kind extension\|stack" variant="param" /> | Reject entries whose <Badge text="listing_kind" variant="param" /> does not match (guardrail) |
| <Badge text="--env-file &lt;path&gt;" variant="param" /> | Env file relative to <Badge text="backend/" variant="path" /> |

Equivalent from the backend package:

```bash
pnpm --filter ./backend run db:backfill-listings-building-blocks
pnpm --filter ./backend run db:backfill-listings-playbooks
```

Pass script options after <code>--</code> when invoking from the repo root.

## Idempotency and safety

- **Second run without <Badge text="--force" variant="param" />:** Existing rows with editorial content are left intact; missing rows are inserted. Engagement counters (<Badge text="likes" variant="param" />, <Badge text="views" variant="param" />, ratings, bookmarks) are never reset on update.
- **<Badge text="--force" variant="param" />:** Overwrites catalog-shaped fields and replaces tag associations from <Badge text="tag_slugs" variant="param" /> in JSON; for stacks, replaces <Badge text="listing_stack_members" variant="path" /> from <Badge text="stack_members" variant="param" />.
- **Stable UUIDs** in the catalog keep upserts deterministic across environments. Set <Badge text="published_at" variant="param" /> when both publish flags are true on new or previously unpublished rows.

## Adding a future catalog listing

1. Add <Badge text="backend/scripts/catalog/building-blocks/&lt;slug&gt;.json" variant="path" /> or <Badge text="catalog/playbooks/&lt;slug&gt;.json" variant="path" /> with <Badge text="{ listing, stack_members }" variant="param" /> (use a new UUID; resolve <Badge text="category_slug" variant="param" /> and <Badge text="tag_slugs" variant="param" />).
2. For playbooks, add <Badge text="stack_members" variant="param" /> with <Badge text="member_listing_slug" variant="param" /> — ensure member extensions exist (backfill building blocks first).
3. Run backfill with <Badge text="--slug &lt;slug&gt;" variant="param" /> in dev, then production — no migration PR required for catalog-only listings.

## Related

<CardGrid>
<LinkCard title="Build Backlinks catalog backfill" description="Upsert link-directory hub sites from JSON" href="/docs/admin/link-directory-catalog-backfill" />
<LinkCard title="Database & migrations" description="Local supabase start, db reset, and typegen" href="/docs/configuration-backend/database" />
<LinkCard title="Admin overview" description="Other operator setup guides" href="/docs/admin" />
</CardGrid>