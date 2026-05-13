import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Monorepo root (…/openquok-monorepo). */
export function getMonorepoRoot(): string {
  // This file: agent/tests/e2e/helpers/run-openquok-cli.ts → four `..` segments to repo root
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
}

function getAgentRoot(): string {
  return path.join(getMonorepoRoot(), "agent");
}

let didBundleCli = false;

function ensureBundledCli(agentRoot: string): void {
  const dist = path.join(agentRoot, "dist", "index.js");
  if (fs.existsSync(dist)) return;
  if (!didBundleCli) {
    const tsupCli = path.join(agentRoot, "node_modules", "tsup", "dist", "cli-default.js");
    const bundle = spawnSync(process.execPath, [tsupCli], {
      cwd: agentRoot,
      // Never `inherit` here: Vitest workers use stdio; sharing TTY with tsup can deadlock/hang.
      // Use `ignore` (not un-drained pipes): tsup can be verbose; filling pipe buffers would block the child.
      stdio: "ignore",
      env: process.env,
    });
    didBundleCli = true;
    if (bundle.status !== 0) {
      throw new Error(
        `tsup failed (status ${bundle.status}). Run pnpm --filter ./agent build from the repo root.`
      );
    }
  }
  if (!fs.existsSync(dist)) {
    throw new Error(`Expected ${dist} after tsup; run pnpm --filter ./agent build`);
  }
}

/**
 * Runs the published CLI bundle (`dist/index.js`) with the same argv users type.
 * Builds once via `node …/node_modules/tsup/dist/cli-default.js` if `dist/` is missing
 * (avoids nested `pnpm exec` while Vitest is already under `pnpm`).
 *
 * Uses async `spawn` (not `spawnSync`): synchronous child runs inside Vitest workers have been
 * observed to hang indefinitely; async I/O avoids that.
 */
export async function runOpenquokCli(
  argv: string[],
  env: Record<string, string | undefined>
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  const agentRoot = getAgentRoot();
  ensureBundledCli(agentRoot);
  const cli = path.join(agentRoot, "dist", "index.js");

  const child = spawn(process.execPath, [cli, ...argv], {
    cwd: agentRoot,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr?.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const [code] = await once(child, "close");
  return {
    status: typeof code === "number" ? code : null,
    stdout,
    stderr,
  };
}
