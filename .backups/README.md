# Production Supabase backups

Off-site exports for the Seoul production project (`ldewhviobysqevtnfznh`). **Never commit SQL dumps or storage bytes to git** — only this README is tracked; dump output under `.backups/` is gitignored.

Run backups **before** migration squash or region cutover, and again immediately before the maintenance cutover window.

## Quick start (all layers)

```bash
# Layer 1 — record dashboard verification (opens browser)
node scripts/prod-backup/verify-layer1.mjs --latest-snapshot YYYY-MM-DD

# Layer 2 — CLI logical dump (linked Seoul project in backend/, or explicit URL)
node scripts/prod-backup/dump-database.mjs --linked
# Or: export OLD_DB_URL='postgresql://postgres.ldewhviobysqevtnfznh:[PASSWORD]@...'
#     node scripts/prod-backup/dump-database.mjs

# Layer 3 — download Storage buckets to .backups/YYYYMMDD/storage/
node scripts/prod-backup/export-storage.mjs

# Or run Layers 1–3 into the same dated directory:
node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot YYYY-MM-DD
```

pnpm shortcuts: `pnpm prod-backup:verify`, `pnpm prod-backup:dump`, `pnpm prod-backup:storage`, `pnpm prod-backup:initial`.

## Layer 1 — Dashboard daily snapshots (Pro)

1. Open [Database → Backups](https://supabase.com/dashboard/project/ldewhviobysqevtnfznh/database/backups).
2. Confirm recent daily snapshots exist (Pro = 7 days retention).
3. Note the latest snapshot date.

DB-only; does not include Storage object bytes. Restore is in-place on Seoul, not a US migration path.

Writes `layer1-verification.json` into the dated backup directory.

Reference: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups).

## Layer 2 — CLI logical dump (off-site)

**Prerequisites:** Supabase CLI (`npx supabase@latest`), Docker Desktop, `psql` (PostgreSQL 17).

Reference: [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

**1. Get DB password** — Dashboard → **Database → Settings** (reset if needed).

**2. Connection string** — Dashboard → **Connect** → **Session pooler** (do not paste passwords into committed files):

```txt
postgresql://postgres.ldewhviobysqevtnfznh:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**3. Dump** (writes `roles.sql`, `schema.sql`, `data.sql`, `checksums.txt` under `.backups/YYYYMMDD/`):

```bash
node scripts/prod-backup/dump-database.mjs --linked
```

If `backend/` is not linked to Seoul, use an explicit session-pooler URL:

```bash
export OLD_DB_URL='postgresql://postgres.ldewhviobysqevtnfznh:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'
node scripts/prod-backup/dump-database.mjs
```

**4. Safety check** — `git status` must not list `.backups/*.sql`.

**5. Optional extra copy** — encrypt and copy the dated directory to private storage (encrypted disk archive, private R2/S3). Retain 90+ days; keep past Seoul decommission.

**When to run again:** once before migration squash; again immediately before region cutover (e.g. `--suffix -pre-cutover`).

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

For **cutover** (old → new project), use `scripts/prod-backup/migrate-storage.mjs` with `OLD_PROJECT_*` and `NEW_PROJECT_*` env vars.

**R2** (`media.openquok.com`) is separate — optional Cloudflare R2 export if you want full media parity.

## What not to do

- Do **not** `git add` `.backups/**/*.sql` or storage object files
- Do **not** paste connection strings or passwords into committed files
- Do **not** skip Layer 3 — blog/avatar URLs break without Storage bytes after restore
