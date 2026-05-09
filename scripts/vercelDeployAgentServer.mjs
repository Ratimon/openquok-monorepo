import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const agentServerRoot = join(root, "agent", "server");

const env = {
  ...process.env,
  VERCEL_NON_INTERACTIVE: process.env.VERCEL_NON_INTERACTIVE ?? "1",
  NO_UPDATE_NOTIFIER: process.env.NO_UPDATE_NOTIFIER ?? "1",
};

process.stderr.write(
  [
    "Deploy CLI auth server: Vercel CLI cwd is agent/server (vercel.json + .vercel/project.json live there).",
    "",
    "Link once: cd agent/server && npx vercel link",
    "Vercel project → Settings → General → Root Directory = \"agent/server\".",
    "Environment: set SERVER_URL to the deployment HTTPS origin (no trailing slash). Use pooled Postgres for serverless.",
    "",
  ].join("\n")
);

/** Drop `--` so `pnpm … -- --force` does not confuse the CLI. */
const extra = process.argv.slice(2).filter((arg) => arg !== "--");
const result = spawnSync(
  "npx",
  ["--yes", "vercel", "--yes", ...extra],
  { cwd: agentServerRoot, env, stdio: "inherit" }
);

process.exit(result.status === null ? 1 : result.status);
