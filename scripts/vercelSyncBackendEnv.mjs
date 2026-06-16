import { runVercelEnvSync } from "./vercelSyncEnvCore.mjs";

/** Always use Vercel `--sensitive` for these keys (align with backend env examples). */
const ALWAYS_SENSITIVE_KEYS = new Set([
  // Stripe
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  // Auth
  "SECURITY_SECRET",
  // Supabase
  "SUPABASE_SECRET_KEY",
  // Cloudflare R2
  "STORAGE_R2_ACCESS_KEY_ID",
  "STORAGE_R2_SECRET_ACCESS_KEY",
  // AWS
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  // Resend
  "RESEND_SECRET_KEY",
  // Sentry
  "SENTRY_DSN",
  // Redis
  "REDIS_PASSWORD",
  // Meta
  "FACEBOOK_APP_SECRET",
  "INSTAGRAM_APP_SECRET",
  "THREADS_APP_SECRET",
  "TIKTOK_CLIENT_SECRET",
  "FACEBOOK_PIXEL_ACCESS_TOKEN",
]);

try {
  runVercelEnvSync({
    argv: process.argv,
    alwaysSensitiveKeys: ALWAYS_SENSITIVE_KEYS,
    scriptName: "vercelSyncBackendEnv.mjs",
  });
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
