---
title: Supabase backup
description: Back up OpenQuok Postgres and Storage, then freeze writes before the final dump for region cutover.
order: 7
lastUpdated: 2026-09-19
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok stores user data in Supabase Postgres and in Supabase Storage buckets. A database dump does not include Storage object bytes. Run a full backup before you squash migrations, change regions, or run a maintenance cutover.

For region cutover, **freeze writes before the final dump** so users and workers cannot mutate Postgres while you copy data. Public marketing, blog, and docs pages stay live. See <a href="#cutover-freeze-runbook">Cutover freeze runbook</a>.

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
pnpm prod-backup:migrate-storage
pnpm prod-backup:rehearse
pnpm prod-backup:relink
pnpm prod-backup:smoke
```

### Copy dumps off site

Copy the dated directory to encrypted private storage. Keep backups for at least 90 days. Keep a copy past project decommission if you may need audit or rollback data.

Run a fresh backup immediately before a maintenance cutover. **Enable write-freeze first**, then use a suffix so the folder name is unique (see <a href="#cutover-freeze-runbook">Cutover freeze runbook</a>):

```bash
pnpm prod-backup:initial --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
```

</Steps>

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

## Cutover freeze runbook

Use this sequence for the live region cutover (~30–60 minutes). Flag behavior, env vars, and the operator bypass header are on <a href="/docs/installation/maintenance-mode">Maintenance mode</a>. Official restore notes: <DocsExternalLink href="https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore">Backup and Restore using the CLI</DocsExternalLink>.

<Callout type="warning" title="Freeze writes before the final dump">
<p>Set <Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" /> on the API, web, and workers, redeploy, and <strong>verify the freeze</strong> before you run the <code>-pre-cutover</code> backup. Dumping first leaves a window where users, MCP/CLI, and BullMQ jobs can still write to the source database.</p>
<p>Do not squash migrations, refactor schema, or run security SQL during this window.</p>
</Callout>

### Operator timeline

```text
T-0    MAINTENANCE_MODE=freeze_writes (Vercel backend + web + Railway workers; redeploy)
T+2m   Verify: /blog → 200; /sign-in → /maintenance; POST /api/v1/... → 503
T+5m   pnpm prod-backup:initial --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
T+10m  pnpm prod-backup:restore --backup-dir .backups/YYYYMMDD-pre-cutover
T+30m  pnpm prod-backup:migrate-storage --yes
T+35m  SQL: replace source Storage URLs in blog_posts.content (if needed)
T+40m  Env cutover (target URL + keys); Vercel/Railway redeploy
T+42m  pnpm prod-backup:relink
T+50m  pnpm prod-backup:smoke (then manual Google / scheduled post / provider OAuth)
T+55m  MAINTENANCE_MODE=off; redeploy; resume workers
```

<Callout type="note" title="Workers">
<p>The worker process exits on startup when the flag is <Badge text="freeze_writes" variant="default" />. As a backup, scale Railway worker services to 0 for the window so a missed env var cannot consume jobs.</p>
</Callout>

<Steps
	howToName="Supabase region cutover freeze runbook"
	howToDescription="Freeze writes, dump the source, restore to the target project, migrate Storage, cut over env, relink the CLI, then resume."
>

### Enable write-freeze and verify

<p>
Set{' '}
<Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" />
{' '}on the Vercel backend, Vercel web (server env, not a{' '}
<Badge text="VITE_*" variant="envWeb" />
{' '}variable), and Railway workers (or recreate self-host API, web, and worker containers). Redeploy all three.
</p>

Confirm before you dump:

| Check | Expected |
|-------|----------|
| Public blog / docs | HTTP 200 (SEO pages stay live) |
| <Badge text="/sign-in" variant="path" /> (and other auth/app routes) | Redirect to <Badge text="/maintenance" variant="path" /> |
| Mutation such as <code>POST /api/v1/...</code> | 503 with <code>Retry-After</code> |
| Worker logs | Process exits without consuming BullMQ jobs |

Optional API smoke during freeze: send <Badge text="X-Maintenance-Bypass" variant="envBackend" /> when <Badge text="MAINTENANCE_BYPASS_SECRET" variant="envBackend" /> is set. See <a href="/docs/installation/maintenance-mode">Maintenance mode</a>.

### Take the pre-cutover backup

With writes frozen, re-run Layers 1–3 into a unique directory:

```bash
pnpm prod-backup:initial --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
```

Then <code>git status</code>. Git must not list <code>.backups/*.sql</code>. Copy the dated directory to encrypted private storage.

### Restore the dump into the target

```bash
export NEW_DB_URL='postgresql://postgres.<target-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
pnpm prod-backup:restore --backup-dir .backups/YYYYMMDD-pre-cutover
```

The restore script strips <code>cli_login_postgres</code> role lines and comments <code>supabase_admin</code> owner lines. If you restore by hand with <code>psql</code>, set <code>session_replication_role = replica</code> before loading <code>data.sql</code> (see the official backup-restore guide).

### Migrate Storage and rewrite blog URLs

Source keys come from the current production env. Target keys come from <Badge text=".backups/migration/project.json" variant="path" /> (or the B0 rehearsal manifest).

```bash
export OLD_PROJECT_URL='https://<source-ref>.supabase.co'
export OLD_PROJECT_SERVICE_KEY='sb_secret_...'
export NEW_PROJECT_URL='https://<target-ref>.supabase.co'
export NEW_PROJECT_SERVICE_KEY='sb_secret_...'
pnpm prod-backup:migrate-storage --yes
```

Add <code>--dry-run</code> first to list object counts without uploading.

If blog HTML still points at the source project host, rewrite in the **target** SQL editor:

```sql
UPDATE public.blog_posts
SET content = replace(content, 'https://<source-ref>.supabase.co', 'https://<target-ref>.supabase.co')
WHERE content LIKE '%<source-ref>.supabase.co%';
```

### Cut over environment variables

Update these keys to the **target** project, then rebuild and redeploy.

| Surface | File | Keys |
|---------|------|------|
| Backend and workers | <Badge text="backend/.env.production.local" variant="envBackend" />, <Badge text="orchestrator/.env.production.local" variant="envBackend" /> | <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />, <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" />, <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> |
| Web | <Badge text="web/.env.production.local" variant="envWeb" /> | <Badge text="VITE_PUBLIC_SUPABASE_URL" variant="envWeb" /> (baked at build time) |

```bash
pnpm vercel:env:sync:backend:prod
pnpm vercel:env:sync:web:prod
pnpm vercel:deploy:backend:prod
pnpm vercel:deploy:web:prod
```

Redeploy Railway workers with the same target keys. Keep <Badge text="MAINTENANCE_MODE=freeze_writes" variant="envBackend" /> until smoke tests pass.

Point the CLI at the target and repair migration history if the aggregated date changed. The script reads the target ref from <Badge text=".backups/us-migration/project.json" variant="path" /> and the date from <Badge text="backend/supabase/migrations/*_core_structure.sql" variant="path" />. It does <strong>not</strong> run <code>db push</code> — restore already applied schema; repair only updates the history table.

```bash
pnpm prod-backup:relink
```

Add <code>--dry-run</code> to print the target ref and any versions that would be marked applied. See <a href="/docs/installation/production-deployment#supabase-production-migrations">Production — Supabase production migrations</a> for the manual <code>migration list</code> / <code>repair</code> commands.

### Smoke test, then resume writes

Run the automated Phase B4 checks against the target project (current <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />):

```bash
pnpm prod-backup:smoke
```

The script writes <Badge text=".backups/us-migration/smoke-report.json" variant="path" /> (gitignored). It verifies env alignment, user/post/integration counts, <code>cloud&#95;trial&#95;consumed&#95;at</code> and billing rows, leftover Storage hosts, <code>pg_cron</code>, Database Linter RPC exposure, publishable-key denial of <code>internal&#95;*</code> RPCs, public blog/health HTTP, and that API writes are not frozen (not 503). Add <code>--skip-http</code> for SQL-only. Add <code>--repair-cron</code> if the refresh-token job is missing after restore. Add <code>--open-dashboard</code> to open Advisors → Security.

Complete these <strong>manual</strong> checks (the script prints the same list):

| Check | How |
|-------|-----|
| Google OAuth + email signup | Existing user and a new user |
| Session refresh | Reload after login (expect one re-login; sessions invalidate) |
| Workers | Enqueue a scheduled post after freeze is off |
| Integrations | One provider OAuth |
| Stripe | Subscriptions unchanged |

When automated and manual checks pass, set <Badge text="MAINTENANCE_MODE=off" variant="envBackend" /> on API, web, and workers; redeploy; restore Railway worker replicas if you scaled them to 0.

### Pause the source project

After the target has been production for **7–14 days**:

1. Pause the source project (rollback in that window is revert env + redeploy).
2. Remove the source project Google OAuth callback URI.
3. Pause or delete the source project so you are not billed for two computes.

</Steps>

### What you do not need to change

R2 (<code>media.openquok.com</code>), Redis, Railway/Vercel **region**, Neon, Meta/Stripe/social redirect URIs, and the Google OAuth **client ID/secret** stay the same. You only add the **target** Supabase Auth callback URI (done in Phase B0).

## What not to do

- Do not take the <code>-pre-cutover</code> dump until write-freeze is live and verified on API, web, and workers.
- Do not <code>git add</code> SQL dumps or exported Storage files. Run <code>git status</code> after every dump.
- Do not skip Layer 3. Blog posts and avatars break after restore if object bytes are missing.
- Do not squash migrations, refactor schema, or apply security SQL in the same window as region cutover. Squash first, verify locally, then cut over with a frozen dump.
- Do not leave freeze mode on after smoke tests. Set <Badge text="MAINTENANCE_MODE" variant="envBackend" /> to <Badge text="off" variant="default" /> and redeploy, or public app writes stay blocked.

## Related configuration

<CardGrid>
<LinkCard title="Maintenance mode" description="MAINTENANCE_MODE write-freeze before the pre-cutover dump" href="/docs/installation/maintenance-mode" />
<LinkCard title="Production deployment" description="Vercel env sync, deploy, and production migration repair" href="/docs/installation/production-deployment" />
<LinkCard title="Database & migrations" description="Link the Supabase CLI, run migrations, and reset local Postgres" href="/docs/configuration-backend/database" />
<LinkCard title="Supabase" description="Project setup, API keys, and dashboard settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Cloudflare R2" description="S3-compatible storage for composer media (separate from Supabase Storage)" href="/docs/configuration-backend/cloudflare-r2" />
</CardGrid>
