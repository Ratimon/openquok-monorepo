# Production Supabase backups

Off-site exports for the current production Supabase project. **Never commit SQL dumps or storage bytes to git** — only this README is tracked; dump output under `.backups/` is gitignored.

Run backups **before** migration squash or region cutover, and again immediately before the maintenance cutover window.

**Freeze writes before the final dump.** Set `MAINTENANCE_MODE=freeze_writes` on the API, web, and workers, redeploy, and verify the freeze **before** `pnpm prod-backup:initial --suffix -pre-cutover`. Dumping first leaves a window where users and BullMQ jobs can still write. Public docs: [Cutover freeze runbook](https://www.openquok.com/docs/configuration-backend/supabase-backup#cutover-freeze-runbook).

## Quick start (all layers)

```bash
# Layer 1 — record dashboard verification (opens browser)
node scripts/prod-backup/verify-layer1.mjs --latest-snapshot YYYY-MM-DD

# Layer 2 — CLI logical dump (linked source project in backend/, or explicit URL)
node scripts/prod-backup/dump-database.mjs --linked
# Or: export OLD_DB_URL='postgresql://postgres.<source-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
#     node scripts/prod-backup/dump-database.mjs

# Layer 3 — download Storage buckets to .backups/YYYYMMDD/storage/
node scripts/prod-backup/export-storage.mjs

# Or run Layers 1–3 into the same dated directory:
node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot YYYY-MM-DD
```

pnpm shortcuts: `pnpm prod-backup:verify`, `pnpm prod-backup:dump`, `pnpm prod-backup:storage`, `pnpm prod-backup:initial`, `pnpm prod-backup:restore`, `pnpm prod-backup:migrate-storage`, `pnpm prod-backup:rehearse`, `pnpm prod-backup:relink`, `pnpm prod-backup:smoke`.

The source project ref is read from `PUBLIC_SUPABASE_URL` in `backend/.env.production.local`, or override with `SUPABASE_SOURCE_PROJECT_REF`.

## Layer 1 — Dashboard daily snapshots (Pro)

1. Open **Database → Backups** in the [Supabase Dashboard](https://supabase.com/dashboard) for your source project.
2. Confirm recent daily snapshots exist (Pro = 7 days retention).
3. Note the latest snapshot date.

DB-only; does not include Storage object bytes. Restore is in-place on the source project, not a region migration path.

Writes `layer1-verification.json` into the dated backup directory.

Reference: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups).

## Layer 2 — CLI logical dump (off-site)

**Prerequisites:** Supabase CLI (`npx supabase@latest`), Docker Desktop, `psql` (PostgreSQL 17).

Reference: [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

**1. Get DB password** — Dashboard → **Database → Settings** (reset if needed).

**2. Connection string** — Dashboard → **Connect** → **Session pooler** (do not paste passwords into committed files):

```txt
postgresql://postgres.<source-ref>:[PASSWORD]@<pooler-host>:5432/postgres
```

**3. Dump** (writes `roles.sql`, `schema.sql`, `data.sql`, `checksums.txt` under `.backups/YYYYMMDD/`):

```bash
node scripts/prod-backup/dump-database.mjs --linked
```

If `backend/` is not linked to the source project, use an explicit session-pooler URL:

```bash
export OLD_DB_URL='postgresql://postgres.<source-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
node scripts/prod-backup/dump-database.mjs
```

**4. Safety check** — `git status` must not list `.backups/*.sql`.

**5. Optional extra copy** — encrypt and copy the dated directory to private storage (encrypted disk archive, private R2/S3). Retain 90+ days; keep past source project decommission.

**When to run again:** once before migration squash; again **during the freeze** immediately before region cutover (`--suffix -pre-cutover`). Do not dump until write-freeze is live.

## Layer 3 — Supabase Storage export

Daily DB backups do not include object bytes. Export buckets used by OpenQuok:

| Bucket | Use |
|--------|-----|
| `avatars` | Profiles, integration profile photos |
| `blog_images` | CMS blog images |
| `listing_images` | Extensions Hub |

```bash
node scripts/prod-backup/export-storage.mjs
```

Reads `PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` from `backend/.env.production.local`. Objects land in `.backups/YYYYMMDD/storage/<bucket>/` with a `manifest.json` summary.

For **cutover** (old → new project), use `scripts/prod-backup/migrate-storage.mjs` with `OLD_PROJECT_*` and `NEW_PROJECT_*` env vars. Add `--dry-run` to list object counts without uploading.

### Rehearsal (optional, before cutover)

Restore a dump into the throwaway B0 target and dry-run Storage migration:

```bash
# backend/ linked to throwaway target; data load needs SUPABASE_TARGET_DB_PASSWORD or SUPABASE_ACCESS_TOKEN
pnpm prod-backup:rehearse --linked --backup-dir .backups/20260918
```

Writes `.backups/us-migration/rehearsal-report.json` (gitignored). Restore only: `pnpm prod-backup:restore`. Storage dry-run only: `pnpm prod-backup:rehearse --skip-restore`.

## Phase B0 — Target project in the new region

Create the cutover target project. This step does **not** change production environment variables.

Full operator steps: [Supabase backup — Phase B0](https://www.openquok.com/docs/configuration-backend/supabase-backup#phase-b0--target-project-in-the-new-region).

### Automated setup

Set target project env vars (create only):

```bash
export SUPABASE_ORG_ID='<org-id>'
export SUPABASE_TARGET_REGION='us-west-1'
export SUPABASE_TARGET_PROJECT_NAME='my-app-prod-us'
pnpm prod-backup:create-us-project
```

To configure an existing target project:

```bash
pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF
```

To copy source auth settings through the Management API:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF
```

If the command fails on `projects list` or `db query`, unset the token and finish without auth copy:

```bash
unset SUPABASE_ACCESS_TOKEN
pnpm prod-backup:create-us-project --project-ref YOUR_TARGET_PROJECT_REF --skip-auth
```

The script writes `.backups/migration/project.json` (gitignored). It records the project ref, API keys, and pooler host when `SUPABASE_TARGET_POOLER_HOST` is set.

### Manual verification checklist

Complete these checks in the dashboard after the script runs. Do not change `backend/.env.production.local`, `web/.env.production.local`, or Vercel until cutover (B3).

#### 1. Verify auth on the target project

Open **Authentication** for the target project in the Supabase Dashboard.

| Check | Where |
|-------|--------|
| Google is enabled. Client secret is saved. | Auth → Providers → Google |
| Site URL matches your frontend | Auth → URL Configuration |
| Redirect URLs match the source project | Auth → URL Configuration |
| Email confirmation settings match the source project | Auth → Providers → Email (or Auth → Settings) |
| Leaked password protection matches your policy | Auth → Settings |

OpenQuok sends mail through the backend Resend API (`RESEND_SECRET_KEY` in Vercel). You do not configure Resend in Supabase Auth → SMTP.

If auth is missing, copy settings from the source project or re-run with `SUPABASE_ACCESS_TOKEN` (without `--skip-auth`).

#### 2. Google Cloud Console

Add the target project **Authorized redirect URI**:

```txt
https://YOUR_TARGET_PROJECT_REF.supabase.co/auth/v1/callback
```

Keep the source project callback until decommission (B5):

```txt
https://YOUR_SOURCE_PROJECT_REF.supabase.co/auth/v1/callback
```

#### 3. Confirm API key format

OpenQuok uses the new key format: `sb_publishable_…` and `sb_secret_…`.

In the target project **Settings → API Keys**, copy the publishable key and secret key. Update `.backups/migration/project.json` if the script recorded legacy JWT keys (`eyJ…`).

#### 4. B0 done checklist

- [ ] Target project exists in the new region
- [ ] `pg_cron` is enabled (Integrations → Cron, or verified by the script)
- [ ] API keys are recorded (`sb_publishable_…` / `sb_secret_…`)
- [ ] Auth is verified (Google secret, URL config, email confirmation, leaked-password protection)
- [ ] Google OAuth redirect URI is added in Google Cloud Console
- [ ] Production env is **not** changed yet

**R2** (`media.openquok.com`) is separate — optional Cloudflare R2 export if you want full media parity.

## Cutover freeze runbook

Full operator steps: [Supabase backup — Cutover freeze runbook](https://www.openquok.com/docs/configuration-backend/supabase-backup#cutover-freeze-runbook). Flag details: [Maintenance mode](https://www.openquok.com/docs/installation/maintenance-mode).

**Order:** freeze → verify → dump → restore → Storage → env cutover → smoke → unfreeze. Do **not** squash, refactor, or run security migrations in this window.

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

### Enable freeze and verify (before any dump)

Set `MAINTENANCE_MODE=freeze_writes` on Vercel **backend**, Vercel **web** (server env, not `VITE_*`), and Railway **workers**. Redeploy. Optionally scale Railway workers to 0 as a backup.

Expected: public `/blog` stays 200; `/sign-in` redirects to `/maintenance`; API mutations return 503. Worker logs show exit without consuming jobs.

### Pre-cutover backup (while frozen)

```bash
pnpm prod-backup:initial --latest-snapshot YYYY-MM-DD --suffix -pre-cutover
git status   # must not list .backups/*.sql
```

### Restore and Storage

```bash
export NEW_DB_URL='postgresql://postgres.<target-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
pnpm prod-backup:restore --backup-dir .backups/YYYYMMDD-pre-cutover

# OLD_* from source env; NEW_* from .backups/migration/project.json
export OLD_PROJECT_URL='https://<source-ref>.supabase.co'
export OLD_PROJECT_SERVICE_KEY='sb_secret_...'
export NEW_PROJECT_URL='https://<target-ref>.supabase.co'
export NEW_PROJECT_SERVICE_KEY='sb_secret_...'
pnpm prod-backup:migrate-storage --yes
```

If blog HTML still embeds the source host, on the **target** database:

```sql
UPDATE public.blog_posts
SET content = replace(content, 'https://<source-ref>.supabase.co', 'https://<target-ref>.supabase.co')
WHERE content LIKE '%<source-ref>.supabase.co%';
```

The restore script already comments `supabase_admin` owner lines and drops `cli_login_postgres` role creates. If restoring by hand, `SET session_replication_role = replica` before `data.sql`.

### Env cutover (keep freeze on until smoke passes)

Update `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `backend/.env.production.local` and `orchestrator/.env.production.local`. Update `VITE_PUBLIC_SUPABASE_URL` in `web/.env.production.local` — rebuild required.

```bash
pnpm vercel:env:sync:backend:prod
pnpm vercel:env:sync:web:prod
pnpm vercel:deploy:backend:prod
pnpm vercel:deploy:web:prod
```

Redeploy Railway workers with the same target keys. Then:

```bash
pnpm prod-backup:relink
```

The script links `backend/` to the target in `.backups/us-migration/project.json` and marks the current `*_core_structure.sql` date applied only if remote history is missing it. It does **not** run `db push`. Add `--dry-run` first. Manual equivalent: `npx supabase@latest link --project-ref <target-ref>` then `pnpm db:production:migration-list` (repair only if the list is wrong).

Smoke (automated + manual):

```bash
pnpm prod-backup:smoke
```

Writes `.backups/us-migration/smoke-report.json`. Automated: env alignment, users/posts/integrations, `cloud_trial_consumed_at` + billing rows, leftover Storage hosts, `pg_cron`, Database Linter RPC exposure, publishable-key `internal_*` RPC denial, public blog/health HTTP, writes not frozen. If restore left `cron.job` empty, re-run with `--repair-cron`. Manual (printed by the script): Google + email auth, session reload (one re-login), scheduled post after unfreeze, one provider OAuth, Stripe unchanged.

Then `MAINTENANCE_MODE=off` on API, web, and workers; redeploy; restore worker replicas.

### After validation (7–14 days)

Pause the source project (rollback = revert env + redeploy). Remove the old Google OAuth callback. Pause or delete the source to avoid duplicate compute.

**Do not change:** R2, Redis, Railway/Vercel region, Neon, Meta/Stripe/social redirect URIs, Google OAuth client ID/secret (callback URI for the target was added in B0).

## What not to do

- Do **not** take the `-pre-cutover` dump until write-freeze is live and verified on API, web, and workers
- Do **not** `git add` `.backups/**/*.sql` or storage object files
- Do **not** paste connection strings, org ids, or passwords into committed files
- Do **not** skip Layer 3 — blog/avatar URLs break without Storage bytes after restore
- Do **not** squash, refactor, or apply security SQL during the cutover window
- Do **not** leave `MAINTENANCE_MODE=freeze_writes` on after smoke tests
