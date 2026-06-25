import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const orchestratorRoot = resolve(scriptDir, "..");
const repoRoot = resolve(orchestratorRoot, "..");

function resolveEnvFilePath(filePath: string): string {
    const candidates = isAbsolute(filePath)
        ? [filePath]
        : [
              resolve(process.cwd(), filePath),
              resolve(orchestratorRoot, filePath),
              resolve(repoRoot, filePath),
          ];
    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(`Env file not found: ${filePath} (tried: ${candidates.join(", ")})`);
}

function stripOptionalQuotes(value: string): string {
    const v = value.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        return v.slice(1, -1);
    }
    return v;
}

export function parseDotenvFile(filePath: string): Record<string, string> {
    const abs = resolveEnvFilePath(filePath);
    const raw = readFileSync(abs, "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = stripOptionalQuotes(trimmed.slice(eq + 1));
        if (!key) continue;
        out[key] = value;
    }
    return out;
}

/**
 * Loads dotenv values into `process.env`.
 * By default we do not override variables already present in the environment.
 */
export function loadDotenvIntoProcessEnv(filePath: string, opts?: { override?: boolean }): void {
    const override = opts?.override === true;
    const vars = parseDotenvFile(filePath);
    for (const [k, v] of Object.entries(vars)) {
        if (!override && process.env[k] !== undefined) continue;
        process.env[k] = v;
    }
}

