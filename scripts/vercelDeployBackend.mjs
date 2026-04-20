import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectFile = join(root, "backend", ".vercel", "project.json");
/** CLI config when Vercel Root Directory = "backend". Repo-root vercel.backend.json is for Root Directory empty only. */
const backendLocalConfig = join(root, "backend", "vercel.json");

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
				`1) Link once (creates backend/.vercel/, usually gitignored):\n\n` +
				`   cd backend && npx vercel link\n\n` +
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
	VERCEL_PROJECT_ID: projectId
};

process.stderr.write(
	[
		"pnpm vercel:deploy:backend runs backend:build:vercel first (fail fast); Vercel still runs backend/vercel.json buildCommand on the server.",
		"pnpm vercel:deploy:backend uses backend/vercel.json (cwd = monorepo root so the full workspace is uploaded).",
		"",
		"Required: Vercel → backend project → Settings → General → Root Directory = \"backend\" (not empty).",
		"If you relink: cd backend && npx vercel link (creates backend/.vercel/project.json).",
		"With Root Directory empty, use: npx vercel --local-config vercel.backend.json --prod",
		"outputDirectory is \"public\" (built as an empty dir + a tiny placeholder; no index.html). Do not add public/index.html — that served HTML for every GET and POST 405 before Express. Mixing Root \"backend\" with vercel.backend.json can break paths.",
		"If Build & Development → Output Directory is set in the dashboard, leave it blank or set to \"public\" to match vercel.json (avoid a stale mismatch).",
		"",
		"api/[[...path]].js is emitted by tsup during the build — do not list it under vercel.json `functions` (Vercel validates",
		"patterns before the build and the deploy fails). Set memory / max duration in Project → Settings → Functions if needed.",
		""
	].join("\n")
);

const extra = process.argv.slice(2);
const result = spawnSync(
	"npx",
	["--yes", "vercel", "--local-config", backendLocalConfig, "--yes", ...extra],
	{ cwd: root, env, stdio: "inherit" }
);

process.exit(result.status === null ? 1 : result.status);
