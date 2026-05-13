/**
 * Runs agent Vitest by spawning **Node** on `web/node_modules/vitest/vitest.mjs`.
 *
 * Avoids `pnpm --filter ./web exec vitest` here: when the user runs `pnpm agent:test`,
 * the process tree is already under pnpm; nesting another `pnpm exec` often **deadlocks**
 * on the content-addressable store lock (symptoms: hang right after unit tests, before e2e).
 *
 * Pattern matches the idea in https://gist.github.com/zorrodg/c349cf54a3f6d0a9ba62e0f4066f31cb
 * (integration tests: spawn `node` + script path, not a second package manager).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const agentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(agentDir);
const config = path.join(rootDir, "agent", "vitest.config.mjs");
const vitestEntry = path.join(rootDir, "web", "node_modules", "vitest", "vitest.mjs");

const passthrough = process.argv.slice(2);
let vitestArgs = passthrough.length ? passthrough : ["run"];
if (vitestArgs[0] !== "run" && vitestArgs[0] !== "--watch") {
  vitestArgs = ["run", ...vitestArgs];
}

if (!fs.existsSync(vitestEntry)) {
  console.error(
    `Missing Vitest at ${vitestEntry}. From the repo root run: pnpm install\n` +
      "(Vitest is a devDependency of web/; agent tests reuse that binary.)"
  );
  process.exit(1);
}

const r = spawnSync(
  process.execPath,
  [vitestEntry, ...vitestArgs, "--config", config],
  { cwd: rootDir, stdio: "inherit", shell: false, env: process.env }
);

process.exit(r.status === null ? 1 : r.status);
