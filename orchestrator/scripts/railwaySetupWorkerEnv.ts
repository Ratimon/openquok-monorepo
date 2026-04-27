import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type Args = {
    serviceName: string;
    railpackConfigFile: string;
    envFile: string;
    extraVars: string[];
    createIfMissing: boolean;
    skipDeploys: boolean;
};

function fail(msg: string): never {
    process.stderr.write(`${msg}\n`);
    process.exit(1);
}

function runCapture(cmd: string, args: string[]) {
    const res = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8" });
    if (res.error) fail(`Failed to run ${cmd}: ${res.error.message}`);
    return res;
}

function run(cmd: string, args: string[]) {
    const res = spawnSync(cmd, args, { stdio: "inherit" });
    if (res.error) fail(`Failed to run ${cmd}: ${res.error.message}`);
    if (res.status !== 0) fail(`Command failed (${res.status}): ${cmd} ${args.join(" ")}`);
}

function parseDotenvFile(filePath: string): Record<string, string> {
    const abs = resolve(process.cwd(), filePath);
    if (!existsSync(abs)) fail(`Env file not found: ${filePath}`);
    const raw = readFileSync(abs, "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (!key) continue;
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        out[key] = value;
    }
    return out;
}

function parseArgs(argv: string[]): Args {
    const args: Args = {
        serviceName: "",
        railpackConfigFile: "",
        envFile: "",
        extraVars: [],
        createIfMissing: true,
        skipDeploys: true,
    };

    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        // pnpm/tsx may forward a standalone `--` separator; ignore it.
        if (a === "--") {
            continue;
        }
        if (a === "--service-name") {
            args.serviceName = argv[++i] ?? "";
            continue;
        }
        if (a === "--railpack-config-file") {
            args.railpackConfigFile = argv[++i] ?? "";
            continue;
        }
        if (a === "--env-file") {
            args.envFile = argv[++i] ?? "";
            continue;
        }
        if (a === "--var") {
            args.extraVars.push(argv[++i] ?? "");
            continue;
        }
        if (a === "--create-if-missing") {
            args.createIfMissing = true;
            continue;
        }
        if (a === "--no-create-if-missing") {
            args.createIfMissing = false;
            continue;
        }
        if (a === "--skip-deploys") {
            args.skipDeploys = true;
            continue;
        }
        if (a === "--no-skip-deploys") {
            args.skipDeploys = false;
            continue;
        }
        if (a === "--help" || a === "-h") {
            process.stdout.write(
                [
                    "Sets Railway variables for an orchestrator worker service from a dotenv file.",
                    "",
                    "Usage:",
                    "  pnpm --filter openquok-orchestrator script:railway:setup-worker-env -- --service-name <name> --railpack-config-file <file> --env-file <path> [--var KEY=VALUE ...]",
                    "",
                    "Notes:",
                    "- Requires the repo to be linked to a Railway project/environment (`railway link`).",
                    "- Creates a service when missing via `railway add --service <name>` (unless --no-create-if-missing).",
                    "- Sets variables via `railway variable set --service <name>`.",
                    "",
                ].join("\n") + "\n"
            );
            process.exit(0);
        }
        fail(`Unknown arg: ${a} (use --help)`);
    }

    return args;
}

const args = parseArgs(process.argv);
if (!args.serviceName) fail("--service-name is required");
if (!args.railpackConfigFile) fail("--railpack-config-file is required");
if (!args.envFile) fail("--env-file is required");

run("railway", ["--version"]);

const vars = parseDotenvFile(args.envFile);
vars.RAILPACK_CONFIG_FILE = args.railpackConfigFile;

for (const kv of args.extraVars) {
    const eq = kv.indexOf("=");
    if (eq === -1) fail(`Invalid --var value (expected KEY=VALUE): ${kv}`);
    const key = kv.slice(0, eq).trim();
    const value = kv.slice(eq + 1).trim();
    if (!key) fail(`Invalid --var value (empty key): ${kv}`);
    vars[key] = value;
}

const pairs = Object.entries(vars)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${v}`);
if (pairs.length === 0) fail("No variables to set (empty env file?)");

let hasService = false;
const status = runCapture("railway", ["service", "status", "--all", "--json"]);
if (status.status === 0) {
    try {
        const parsed = JSON.parse(status.stdout);
        const services = Array.isArray((parsed as any)?.services)
            ? (parsed as any).services
            : Array.isArray(parsed)
              ? parsed
              : [];
        hasService = services.some((s: any) => s?.name === args.serviceName || s?.id === args.serviceName);
    } catch {
        // ignore
    }
}

if (!hasService && args.createIfMissing) {
    process.stdout.write(`Creating service (if missing): ${args.serviceName}\n`);
    const add = runCapture("railway", ["add", "--service", args.serviceName, "--json"]);
    if (add.status !== 0) {
        const combined = `${add.stdout}\n${add.stderr}`.trim();
        if (!/already exists|duplicate|taken/i.test(combined)) {
            process.stderr.write(combined + "\n");
            fail(`Failed to create service: ${args.serviceName}`);
        }
    }
}

process.stdout.write(`Setting ${pairs.length} variable(s) on service "${args.serviceName}"\n`);
const cmd = ["variable", "set", "--service", args.serviceName];
if (args.skipDeploys) cmd.push("--skip-deploys");

const CHUNK_SIZE = 25;
for (let i = 0; i < pairs.length; i += CHUNK_SIZE) {
    run("railway", [...cmd, ...pairs.slice(i, i + CHUNK_SIZE)]);
}

process.stdout.write("Done.\n");

