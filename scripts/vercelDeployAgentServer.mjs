import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectFile = join(root, "agent", "server", ".vercel", "project.json");
const agentServerLocalConfig = join(root, "agent", "server", "vercel.json");

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
};

process.stderr.write(
  [
    "pnpm vercel:deploy:agent-server runs @openquok/cli-auth-server build first (fail fast); Vercel still builds serverless routes.",
    "pnpm vercel:deploy:agent-server uses agent/server/vercel.json (cwd = monorepo root so the full workspace is uploaded).",
    "",
    "Required: Vercel → CLI auth server project → Settings → General → Root Directory = \"agent/server\" (not empty).",
    "If you relink: cd agent/server && npx vercel link (creates agent/server/.vercel/project.json).",
    "Set SERVER_URL to the deployment’s public HTTPS origin (no trailing slash), e.g. https://cli-auth.openquok.com.",
    "Use a pooled Postgres URL suitable for serverless concurrency (Neon, Supabase, Vercel Postgres, etc.).",
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
