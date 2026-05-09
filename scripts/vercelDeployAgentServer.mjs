import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const agentServerRoot = join(root, "agent", "server");
const projectFile = join(agentServerRoot, ".vercel", "project.json");
/** Same pattern as backend/web deploy scripts: cwd = monorepo root (full workspace upload), config from package dir. */
const agentServerLocalConfig = join(agentServerRoot, "vercel.json");

let orgId = process.env.VERCEL_ORG_ID;
let projectId = process.env.VERCEL_PROJECT_ID;

if (!orgId || !projectId) {
  try {
    const project = JSON.parse(readFileSync(projectFile, "utf8"));
    orgId = project.orgId;
    projectId = project.projectId;
  } catch {
    process.stderr.write(
      `Missing Vercel project ids. Do one of the following:\n\n` +
        `1) Link once (creates agent/server/.vercel/, usually gitignored):\n\n` +
        `   cd agent/server && npx vercel link\n\n` +
        `2) Or set env vars (e.g. CI) before deploy:\n\n` +
        `   export VERCEL_ORG_ID=...   # team id from Vercel\n` +
        `   export VERCEL_PROJECT_ID=...   # project id (prj_...)\n\n`
    );
    process.exit(1);
  }
}

const env = {
  ...process.env,
  VERCEL_ORG_ID: orgId,
  VERCEL_PROJECT_ID: projectId,
  /** Avoid interactive prompts / update notifier stalls when spawning Vercel CLI */
  VERCEL_NON_INTERACTIVE: process.env.VERCEL_NON_INTERACTIVE ?? "1",
  NO_UPDATE_NOTIFIER: process.env.NO_UPDATE_NOTIFIER ?? "1",
  CI: process.env.CI ?? "true",
};

process.stderr.write(
  [
    "pnpm vercel:deploy:agent-server runs pnpm agent-server:build first (fail fast); Vercel still runs agent/server/vercel.json buildCommand on the server.",
    "pnpm vercel:deploy:agent-server uses agent/server/vercel.json (cwd = monorepo root so the full workspace is uploaded).",
    "",
    "Required: Vercel → CLI auth server project → Settings → General → Root Directory = \"agent/server\" (not empty).",
    "There is no repo-root vercel.agent-server.json (unlike vercel.backend.json / vercel.web.json): api/ lives only under agent/server — empty Root Directory has no top-level api/ to discover.",
    "CLI link: cd agent/server && npx vercel link (creates agent/server/.vercel/project.json).",
    "Set SERVER_URL to the deployment’s public HTTPS origin (no trailing slash), e.g. https://cli-auth.openquok.com.",
    "Use a pooled Postgres URL suitable for serverless concurrency (Neon, Supabase, Vercel Postgres, etc.).",
    "",
    "If the CLI sits on “Building…”, the remote build is still running — open the Inspect URL for live logs.",
    "Install on Vercel is standalone (agent/server only, --ignore-workspace) to avoid monorepo OOM; large root pnpm installs are not used.",
    "",
  ].join("\n")
);

const extra = process.argv.slice(2);
const result = spawnSync(
  "npx",
  ["--yes", "vercel", "--local-config", agentServerLocalConfig, "--yes", ...extra],
  { cwd: root, env, stdio: "inherit" }
);

process.exit(result.status === null ? 1 : result.status);
