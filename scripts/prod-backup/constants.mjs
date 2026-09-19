import { fail, loadBackendProdEnv } from "./lib.mjs";

/** Buckets that must be exported before cutover (DB dumps do not include object bytes). */
export const STORAGE_BUCKETS = ["avatars", "blog_images", "listing_images"];

export const DEFAULT_ENV_FILE = "backend/.env.production.local";

export const MIGRATION_OUTPUT_DIR = ".backups/migration";

/** Default manifest location when create-us-project uses --output-dir .backups/us-migration */
export const DEFAULT_REHEARSAL_MANIFEST_DIR = ".backups/us-migration";

/** Pinned CLI used by prod-backup scripts that call `npx supabase`. */
export const SUPABASE_CLI_SPEC = "supabase@2.117.0";

export const AGGREGATE_MIGRATIONS_DIR = "backend/supabase/migrations";

/** Parse the project ref from a Supabase project URL. */
export function parseProjectRefFromSupabaseUrl(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.trim().match(/https?:\/\/([a-z0-9]{15,})\.supabase\.co/i);
  return match?.[1] ?? null;
}

/** Resolve the current production (source) project ref from env or backend prod env file. */
export function resolveSourceProjectRef({ envFile = DEFAULT_ENV_FILE } = {}) {
  const explicit = process.env.SUPABASE_SOURCE_PROJECT_REF?.trim();
  if (explicit) return explicit;

  const env = loadBackendProdEnv(envFile);
  const ref = parseProjectRefFromSupabaseUrl(env.PUBLIC_SUPABASE_URL);
  if (!ref) {
    fail(
      "Could not resolve source project ref. Set SUPABASE_SOURCE_PROJECT_REF or PUBLIC_SUPABASE_URL in backend/.env.production.local."
    );
  }
  return ref;
}

export function resolveDashboardBackupsUrl(projectRef) {
  return `https://supabase.com/dashboard/project/${projectRef}/database/backups`;
}
