---
title: Supabase backup
description: Back up the OpenQuok Supabase database and Storage before migrations or region cutover.
order: 7
lastUpdated: 2026-09-18
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok stores user data in Supabase Postgres and in Supabase Storage buckets. A database dump does not include Storage object bytes. Run a full backup before you squash migrations, change regions, or run a maintenance cutover.

The repo provides three backup layers:

| Layer | What it covers | Where it runs |
|-------|----------------|---------------|
| 1 | Pro daily snapshots (database only) | Supabase Dashboard |
| 2 | Logical SQL dump (roles, schema, data) | Supabase CLI on your machine |
| 3 | Storage object export | Node script on your machine |

Dump output and exported files contain PII. They live under <Badge text=".backups/" variant="path" /> and stay gitignored. Only <Badge text=".backups/README.md" variant="path" /> is tracked in git.

Scripts live in <Badge text="scripts/prod-backup/" variant="path" />.

## Prerequisites

You need these tools before you run Layer 2:

- <DocsExternalLink href="https://supabase.com/docs/guides/cli">Supabase CLI</DocsExternalLink> (use <code>npx supabase@latest</code>)
- Docker Desktop (required by <code>supabase db dump</code>)
- <code>psql</code> from PostgreSQL 17 (for restore during cutover)

For Layer 3, the export script reads <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> and <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> from <Badge text="backend/.env.production.local" variant="envBackend" />.

<Callout type="warning" title="PII and secrets">
<p>Do not commit files under <Badge text=".backups/" variant="path" />. Do not paste database passwords or connection strings into committed docs or scripts.</p>
<p><Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> bypasses Row Level Security. Use it only on a trusted machine for backup export.</p>
</Callout>

## Backup layers

<Steps
	howToName="Back up Supabase for OpenQuok"
	howToDescription="Verify dashboard snapshots, run a CLI database dump, and export Storage buckets before risky database work."
>

### Layer 1 — Verify Pro daily snapshots

1. Open <strong>Database → Backups</strong> in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> for your production project.
2. Confirm that recent daily snapshots exist. On the Pro plan, retention is 7 days.
3. Note the date of the latest snapshot.

Record the check with:

```bash
node scripts/prod-backup/verify-layer1.mjs --latest-snapshot YYYY-MM-DD
```

This writes <code>layer1-verification.json</code> into <Badge text=".backups/YYYYMMDD/" variant="path" />.

<Callout type="note" title="Dashboard backups are DB-only">
Daily snapshots do not include Storage files. They also restore in place on the same project. They do not move data to a new region by themselves.
</Callout>

### Layer 2 — CLI logical dump

Link your production project from <Badge text="backend/" variant="path" /> (see <a href="/docs/configuration-backend/database">Database &amp; migrations</a>), then run:

```bash
node scripts/prod-backup/dump-database.mjs --linked
```

The script writes these files into <Badge text=".backups/YYYYMMDD/" variant="path" />:

- <code>roles.sql</code>
- <code>schema.sql</code>
- <code>data.sql</code>
- <code>checksums.txt</code>

If <Badge text="backend/" variant="path" /> is not linked, set a session-pooler URL and run the dump without <code>--linked</code>:

```bash
export OLD_DB_URL='postgresql://postgres.your-project-ref:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres'
node scripts/prod-backup/dump-database.mjs
```

Get the password from <strong>Database → Settings</strong> in the dashboard. Get the pooler host from <strong>Connect → Session pooler</strong>.

After the dump, run <code>git status</code>. Git must not list <code>.backups/*.sql</code>.

### Layer 3 — Storage export

Export these buckets before cutover:

| Bucket | Use |
|--------|-----|
| <code>avatars</code> | Profile and integration photos |
| <code>blog_images</code> | CMS blog images |
| <code>listing_images</code> | Extensions Hub images |

Run:

```bash
node scripts/prod-backup/export-storage.mjs
```

Objects are saved under <Badge text=".backups/YYYYMMDD/storage/" variant="path" />. A <code>manifest.json</code> file lists counts per bucket.

Composer media on Cloudflare R2 (<code>media.openquok.com</code>) is separate. Back up R2 separately if you need full media parity.

### Run all three layers

To run Layers 1–3 into the same dated directory:

```bash
node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot YYYY-MM-DD
```

pnpm shortcuts:

```bash
pnpm prod-backup:verify
pnpm prod-backup:dump
pnpm prod-backup:storage
pnpm prod-backup:initial
```

### Copy dumps off site

Copy the dated directory to encrypted private storage. Keep backups for at least 90 days. Keep a copy past project decommission if you may need audit or rollback data.

Run a fresh backup immediately before a maintenance cutover. Use a suffix so the folder name is unique:

```bash
node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
```

</Steps>

## Restore and cutover

To restore a dump into a new Supabase project, follow the official guide:

<DocsExternalLink href="https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore">Backup and Restore using the CLI</DocsExternalLink>

To copy Storage objects from the old project to a new project during cutover, use:

```bash
pnpm prod-backup:migrate-storage
```

Set <code>OLD_PROJECT_URL</code>, <code>OLD_PROJECT_SERVICE_KEY</code>, <code>NEW_PROJECT_URL</code>, and <code>NEW_PROJECT_SERVICE_KEY</code> in your shell before you run the script.

## What not to do

- Do not <code>git add</code> SQL dumps or exported Storage files.
- Do not skip Layer 3. Blog posts and avatars break after restore if object bytes are missing.
- Do not run migration squash and region cutover in the same maintenance window. Squash first, verify locally, then cut over with a fresh backup.

## Related configuration

<CardGrid>
<LinkCard title="Database & migrations" description="Link the Supabase CLI, run migrations, and reset local Postgres" href="/docs/configuration-backend/database" />
<LinkCard title="Supabase" description="Project setup, API keys, and dashboard settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Cloudflare R2" description="S3-compatible storage for composer media (separate from Supabase Storage)" href="/docs/configuration-backend/cloudflare-r2" />
</CardGrid>
