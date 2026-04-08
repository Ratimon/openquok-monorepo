import { runVercelEnvSync } from "./vercelSyncEnvCore.mjs";

/** Always use Vercel `--sensitive` for these keys (align with backend env examples). */
const ALWAYS_SENSITIVE_KEYS = new Set([
  "THREADS_APP_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "INVITE_TOKEN_SECRET",
  "JWT_SECRET",
  "AWS_SECRET_ACCESS_KEY",
  "RESEND_SECRET_KEY",
  "SENTRY_DSN",
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
