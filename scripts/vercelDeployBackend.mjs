import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectFile = join(root, "backend", ".vercel", "project.json");
/** CLI config when Vercel Root Directory = "backend". Repo-root vercel.backend.json is for Root Directory empty only. */
const backendLocalConfig = join(root, "backend", "vercel.json");
const ignoreFile = join(root, ".vercelignore");

/**
 * Sibling app sources are not needed to install/build the API, but each workspace
 * package.json must stay in the upload or `pnpm install --frozen-lockfile` fails.
 */
const extraIgnore = `
# Injected by vercelDeployBackend.mjs (keep */package.json for the pnpm workspace).
web/src
web/src/**
web/static
web/static/**
web/scripts
web/scripts/**
agent/src
agent/src/**
agent/server/src
agent/server/src/**
sdk/src
sdk/src/**
`;

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
		"",
		"Upload uses --archive=tgz (one tarball instead of thousands of parallel PUTs). That avoids CLI",
		"`Upload aborted` / `TypeError: fetch failed` on Node 24 native fetch. Retry if the network drops;",
		"npm `Unknown env config` warnings from pnpm are harmless.",
		""
	].join("\n")
);

const extra = process.argv.slice(2).filter((arg) => arg !== "--");
const hasArchive = extra.some((a) => a === "--archive" || a.startsWith("--archive="));
const args = ["--yes", "vercel", "--local-config", backendLocalConfig, "--yes"];
if (!hasArchive) {
	args.push("--archive=tgz");
}
args.push(...extra);

const originalIgnore = readFileSync(ignoreFile, "utf8");
const restoreIgnore = () => {
	try {
		writeFileSync(ignoreFile, originalIgnore);
	} catch (err) {
		process.stderr.write(`Failed to restore .vercelignore: ${err}\n`);
	}
};

process.once("SIGINT", () => {
	restoreIgnore();
	process.exit(130);
});
process.once("SIGTERM", () => {
	restoreIgnore();
	process.exit(143);
});

writeFileSync(ignoreFile, `${originalIgnore.trimEnd()}\n${extraIgnore}`);

let result;
try {
	result = spawnSync("npx", args, { cwd: root, env, stdio: "inherit" });
} finally {
	restoreIgnore();
}

process.exit(result.status === null ? 1 : result.status);
