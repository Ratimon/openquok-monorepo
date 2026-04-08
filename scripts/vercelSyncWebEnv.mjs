import { runVercelEnvSync } from "./vercelSyncEnvCore.mjs";

/**
 * Explicit sensitive keys for the web app (Vite/SvelteKit). Most `VITE_*` values are
 * public at build time; add keys here if a name does not match the core heuristics
 * (e.g. a client DSN you still want marked sensitive in Vercel).
 */
const ALWAYS_SENSITIVE_KEYS = new Set();

try {
  runVercelEnvSync({
    argv: process.argv,
    alwaysSensitiveKeys: ALWAYS_SENSITIVE_KEYS,
    scriptName: "vercelSyncWebEnv.mjs",
  });
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}
