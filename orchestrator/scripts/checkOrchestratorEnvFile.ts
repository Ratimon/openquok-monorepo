import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDotenvFile } from "./dotenvFile.js";

type CheckResult = { ok: true } | { ok: false; missing: string[] };

function uniqSorted(xs: string[]): string[] {
    return [...new Set(xs)].sort((a, b) => a.localeCompare(b));
}

function extractEnvKeysFromText(text: string): string[] {
    const out: string[] = [];
    // Matches getEnv("FOO"), getEnvTrimmed("FOO"), getEnvNumber("FOO"), getEnvBoolean("FOO")
    for (const m of text.matchAll(/\bgetEnv(?:Trimmed|Number|Boolean)?\(\s*["']([A-Z0-9_]+)["']/g)) {
        out.push(m[1]!);
    }
    // Matches requireEnv("FOO")
    for (const m of text.matchAll(/\brequireEnv\(\s*["']([A-Z0-9_]+)["']/g)) {
        out.push(m[1]!);
    }
    // Matches process.env.FOO
    for (const m of text.matchAll(/\bprocess\.env\.([A-Z0-9_]+)/g)) {
        out.push(m[1]!);
    }
    // Matches process.env["FOO"]
    for (const m of text.matchAll(/\bprocess\.env\[\s*["']([A-Z0-9_]+)["']\s*\]/g)) {
        out.push(m[1]!);
    }
    return out;
}

function isOrchestratorRelevantEnvKey(key: string): boolean {
    // Policy: only enforce keys that the orchestrator can realistically need.
    // If orchestrator starts depending on additional namespaces, expand this list.
    const prefixes = [
        "REDIS_",
        "ORCHESTRATOR_",
        "PUBLIC_SUPABASE_",
        "SUPABASE_",
        "STORAGE_",
        "EMAIL_",
        "RESEND_",
        "AWS_",
        "SENTRY_",
        "BULLMQ_",
    ];
    if (prefixes.some((p) => key.startsWith(p))) return true;
    return key === "NODE_ENV" || key === "SITE_NAME" || key === "SENDER_EMAIL_ADDRESS";
}

function parseArgValue(argv: string[], flag: string): string | undefined {
    const idx = argv.findIndex((x) => x === flag);
    if (idx !== -1) return argv[idx + 1];
    const byEq = argv.find((x) => x.startsWith(`${flag}=`));
    return byEq ? byEq.slice(`${flag}=`.length) : undefined;
}

function check(envFilePath: string): CheckResult {
    // This script is executed from within the `orchestrator/` package (pnpm filter).
    // Resolve repo-root files relative to this script location to avoid cwd assumptions.
    const here = dirname(fileURLToPath(import.meta.url));
    const orchestratorRoot = resolve(here, "..");
    const repoRoot = resolve(orchestratorRoot, "..");

    const envVars = parseDotenvFile(envFilePath);
    const envKeys = new Set(Object.keys(envVars));

    const globalConfig = readFileSync(resolve(repoRoot, "backend/config/GlobalConfig.ts"), "utf8");
    const orchestratorRedisScripts = [
        readFileSync(resolve(orchestratorRoot, "scripts/clearFlowcraftRuns.ts"), "utf8"),
        readFileSync(resolve(orchestratorRoot, "scripts/freeOpenquokRedisMemory.ts"), "utf8"),
    ].join("\n");

    const referenced = uniqSorted(
        [...extractEnvKeysFromText(globalConfig), ...extractEnvKeysFromText(orchestratorRedisScripts)].filter(
            isOrchestratorRelevantEnvKey
        )
    );

    const missing = referenced.filter((k) => !envKeys.has(k));
    if (missing.length) return { ok: false, missing };
    return { ok: true };
}

const here = dirname(fileURLToPath(import.meta.url));
const orchestratorRoot = resolve(here, "..");
const defaultEnvFile = resolve(orchestratorRoot, ".env.production.example");
const envFile = parseArgValue(process.argv, "--env-file") ?? defaultEnvFile;

const res = check(envFile);
if (!res.ok) {
    process.stderr.write(
        [
            `Missing env keys in ${envFile} (referenced by backend/orchestrator code):`,
            ...res.missing.map((k) => `- ${k}`),
            "",
            "Add them to the env file (even if blank/commented) to avoid drifting config.",
            "",
        ].join("\n")
    );
    process.exit(1);
}

process.stdout.write(`OK: ${envFile} contains all referenced env keys.\n`);

