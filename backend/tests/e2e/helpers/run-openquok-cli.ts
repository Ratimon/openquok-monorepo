import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";

/** Monorepo root (…/openquok-monorepo). */
export function getMonorepoRoot(): string {
    return path.resolve(__dirname, "..", "..", "..", "..");
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
 * Runs the Openquok CLI bundle (`agent/dist/index.js`) with the same argv users type.
 * Builds once via tsup if `dist/` is missing.
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
