import { runVercelEnvSync } from "./vercelSyncEnvCore.mjs";

/** Always use Vercel `--sensitive` for these keys (align with agent/server env examples). */
const ALWAYS_SENSITIVE_KEYS = new Set([
  "DATABASE_URL",
  "OPENQUOK_OAUTH_CLIENT_SECRET",
]);

try {
  runVercelEnvSync({
    argv: process.argv,
    alwaysSensitiveKeys: ALWAYS_SENSITIVE_KEYS,
    scriptName: "vercelSyncAgentServerEnv.mjs",
  });
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
