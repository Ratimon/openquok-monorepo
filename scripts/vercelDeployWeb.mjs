import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectFile = join(root, "web", ".vercel", "project.json");
/** CLI config for Root Directory = "web" (see stderr message). Repo-root vercel.web.json is for Root Directory empty only. */
const webLocalConfig = join(root, "web", "vercel.json");

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
				`1) Link once (creates web/.vercel/, usually gitignored):\n\n` +
				`   cd web && npx vercel link\n\n` +
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
		"pnpm vercel:deploy:web uses web/vercel.json (cwd = monorepo root so the full workspace is uploaded).",
		"",
		"Required for this script: Vercel → openquok-web → Settings → General → Root Directory = \"web\" (not empty).",
		"With Root Directory empty, use vercel.web.json instead: npx vercel --local-config vercel.web.json --prod",
		"(outputDirectory web/.vercel/output). Mixing Root Directory \"web\" with vercel.web.json causes web/web/.vercel/output and 404 NOT_FOUND.",
		"",
		"Clear Settings → Build & Development → Output Directory override (not \"public\") unless you intend it.",
		""
	].join("\n")
);

const extra = process.argv.slice(2);
const result = spawnSync(
	"npx",
	["--yes", "vercel", "--local-config", webLocalConfig, "--yes", ...extra],
	{ cwd: root, env, stdio: "inherit" }
);

process.exit(result.status === null ? 1 : result.status);
