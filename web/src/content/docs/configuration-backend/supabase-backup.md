---
title: Supabase backup
description: Back up the OpenQuok Supabase database and Storage before migrations or region cutover.
order: 7
lastUpdated: 2026-09-19
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
pnpm prod-backup:restore
pnpm prod-backup:rehearse
```

### Copy dumps off site

Copy the dated directory to encrypted private storage. Keep backups for at least 90 days. Keep a copy past project decommission if you may need audit or rollback data.

Run a fresh backup immediately before a maintenance cutover. **Enable write-freeze first** (see <a href="/docs/installation/maintenance-mode">Maintenance mode</a>), then use a suffix so the folder name is unique:

```bash
node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
```

</Steps>

## Maintenance window (write-freeze)

Before the pre-cutover backup and restore, set <Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" /> on the **Vercel backend**, **Vercel web**, and **Railway workers** (or self-host API, web, and worker containers). Redeploy so API mutations return 503, auth/app routes redirect to <Badge text="/maintenance" variant="path" />, and workers stop consuming BullMQ jobs.

<Callout type="warning" title="Enable freeze before the final dump">
<p>Turn on <Badge text="freeze_writes" variant="default" /> <strong>before</strong> you run the <code>-pre-cutover</code> backup — not after restore. Otherwise users and workers can still write to Postgres while you copy data.</p>
</Callout>

Full behavior, env vars, and smoke-test bypass: <a href="/docs/installation/maintenance-mode">Maintenance mode</a>.


## Phase B0 — Target project in the new region

Create the cutover target project in the new region before you run the maintenance restore. The source (current production) project stays live until cutover. This phase does not change production environment variables.

Pick a region close to your API and workers. Enable <strong>Integrations → Cron</strong> (<code>pg_cron</code>) on the target project before you restore data.

### Automated setup

Run from the repo root:

```bash
pnpm prod-backup:create-us-project
```

Pass the target project ref when the project already exists:

```bash
pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF
```

To copy auth settings from the source project through the Management API, set a <DocsExternalLink href="https://supabase.com/dashboard/account/tokens">Personal Access Token</DocsExternalLink> with auth config read and write permissions:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF
```

<Callout type="note" title="Personal Access Token and the CLI">
<p>If the command fails with a privileges error, the token may not list projects or run SQL. Unset the token and finish keys and <code>pg_cron</code> only:</p>
<p><code>unset SUPABASE_ACCESS_TOKEN</code></p>
<p><code>pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF --skip-auth</code></p>
<p>Then complete auth in the dashboard, or create a token with broader project read access.</p>
</Callout>

The script writes a migration manifest under <Badge text=".backups/" variant="path" /> (gitignored). It records the target project ref, pooler host, and API keys.

### Manual verification checklist

Complete these checks after the script runs. Do not update <Badge text="backend/.env.production.local" variant="envBackend" />, <Badge text="web/.env.production.local" variant="envWeb" />, or Vercel until cutover.

<Steps
	howToName="Verify target Supabase project (Phase B0)"
	howToDescription="Manual dashboard checks after creating the cutover target project in a new region."
>

### Verify auth on the target project

Open <strong>Authentication</strong> in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> for the target project.

| Check | Where |
|-------|--------|
| Google is enabled. Client secret is saved. | Auth → Providers → Google |
| Site URL matches your frontend | Auth → URL Configuration |
| Redirect URLs match the source project | Auth → URL Configuration |
| Email confirmation settings match the source project | Auth → Providers → Email (or Auth → Settings) |
| Leaked password protection matches your policy | Auth → Settings |

<Callout type="note" title="Resend is not Supabase SMTP">
<p>OpenQuok sends mail through the backend Resend HTTPS API (<Badge text="RESEND_SECRET_KEY" variant="envBackend" />, <Badge text="SENDER_EMAIL_ADDRESS" variant="envBackend" />). See <a href="/docs/configuration-backend/resend">Email (Resend)</a>. You do not configure Resend under Supabase Auth → SMTP.</p>
</Callout>

If auth settings are missing, copy them from the source project dashboard or re-run the script with <Badge text="SUPABASE_ACCESS_TOKEN" variant="envBackend" /> (without <code>--skip-auth</code>).

### Add the Google Cloud redirect URI

In <DocsExternalLink href="https://console.cloud.google.com/">Google Cloud Console</DocsExternalLink> → OAuth client → <strong>Authorized redirect URIs</strong>, add the target project callback:

```txt
https://YOUR_TARGET_PROJECT_REF.supabase.co/auth/v1/callback
```

Keep the source project callback until you decommission the old project:

```txt
https://YOUR_SOURCE_PROJECT_REF.supabase.co/auth/v1/callback
```

See <a href="/docs/configuration-backend/google-oauth">Google OAuth</a>.

### Confirm API key format

OpenQuok expects <Badge text="sb_publishable_…" variant="envBackend" /> and <Badge text="sb_secret_…" variant="envBackend" />, not legacy JWT keys. Copy both from <strong>target project → Settings → API Keys</strong>. Update the migration manifest if the script stored legacy <code>eyJ…</code> keys.

### Complete the B0 checklist

- Target project exists in the new region (correct plan and compute size)
- <code>pg_cron</code> is enabled on the target project
- API keys are recorded (<code>sb_publishable_…</code> / <code>sb_secret_…</code>)
- Auth is verified (Google secret, URL config, email confirmation, leaked-password protection)
- Google OAuth redirect URI for the target project is added in Google Cloud Console
- Production env still points at the source project

### Optional — redirect URL wildcard

The target project may list a wildcard redirect URL (for example <code>https://YOUR_BACKEND_DOMAIN/**</code>) in addition to the exact callback path. The source project may list only the exact URL. You can remove the wildcard to match the source project. Add it back if OAuth redirects fail. See <a href="/docs/configuration-backend/google-oauth">Google OAuth</a>.

</Steps>

### Optional — rehearsal on the throwaway target

Before the maintenance window, restore a Layer 2 dump into the B0 target project and dry-run Storage migration (list source/target object counts without uploading bytes):

```bash
# backend/ must be linked to the throwaway target project
pnpm prod-backup:rehearse --linked --backup-dir .backups/20260918
```

Roles and schema restore through the linked Supabase CLI. <code>data.sql</code> loads through <code>psql</code> (COPY format). Without <Badge text="NEW_DB_URL" variant="envBackend" /> or <Badge text="SUPABASE_TARGET_DB_PASSWORD" variant="envBackend" />, the script resets the target database password via the Management API (requires <Badge text="SUPABASE_ACCESS_TOKEN" variant="envBackend" /> with <code>database_config_write</code>).

The script writes <Badge text=".backups/us-migration/rehearsal-report.json" variant="path" /> (gitignored). To copy Storage objects during rehearsal (not recommended on production source), add <code>--migrate-storage --yes</code>.

Restore only:

```bash
export NEW_DB_URL='postgresql://postgres.<target-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
pnpm prod-backup:restore --backup-dir .backups/20260918 --manifest-dir .backups/us-migration
```

Storage dry-run only:

```bash
pnpm prod-backup:rehearse --skip-restore
```

## Restore and cutover

To restore a dump into a new Supabase project, follow the official guide:

<DocsExternalLink href="https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore">Backup and Restore using the CLI</DocsExternalLink>

During cutover, use <code>pnpm prod-backup:restore</code> with the pre-cutover backup directory, then copy Storage objects:

```bash
pnpm prod-backup:migrate-storage
```

Set <code>OLD_PROJECT_URL</code>, <code>OLD_PROJECT_SERVICE_KEY</code>, <code>NEW_PROJECT_URL</code>, and <code>NEW_PROJECT_SERVICE_KEY</code> in your shell before you run the script. Add <code>--dry-run</code> to list object counts without uploading.

After smoke tests pass, set <Badge text="MAINTENANCE_MODE=off" variant="envBackend" /> on API, web, and workers and redeploy. See <a href="/docs/installation/maintenance-mode">Maintenance mode</a>.

## What not to do

- Do not <code>git add</code> SQL dumps or exported Storage files.
- Do not skip Layer 3. Blog posts and avatars break after restore if object bytes are missing.
- Do not run migration squash and region cutover in the same maintenance window. Squash first, verify locally, then cut over with a fresh backup.

## Related configuration

<CardGrid>
<LinkCard title="Maintenance mode" description="MAINTENANCE_MODE write-freeze before pre-cutover backup and restore" href="/docs/installation/maintenance-mode" />
<LinkCard title="Database & migrations" description="Link the Supabase CLI, run migrations, and reset local Postgres" href="/docs/configuration-backend/database" />
<LinkCard title="Supabase" description="Project setup, API keys, and dashboard settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Cloudflare R2" description="S3-compatible storage for composer media (separate from Supabase Storage)" href="/docs/configuration-backend/cloudflare-r2" />
</CardGrid>
