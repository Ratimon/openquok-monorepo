/** Seoul production Supabase project (Phase 0 / region migration). */
export const PROD_PROJECT_REF = "ldewhviobysqevtnfznh";

export const PROD_POOLER_HOST = "aws-1-ap-northeast-2.pooler.supabase.com";

export const DASHBOARD_BACKUPS_URL =
  `https://supabase.com/dashboard/project/${PROD_PROJECT_REF}/database/backups`;

/** Buckets that must be exported before cutover (DB dumps do not include object bytes). */
export const STORAGE_BUCKETS = ["avatars", "blog_images", "listing_images"];

export const DEFAULT_ENV_FILE = "backend/.env.production.local";
