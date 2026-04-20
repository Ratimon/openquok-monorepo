import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

/** Suppresses interactive CLI-update prompts and confirmation when spawning `vercel` (see Vercel CLI non-interactive / update notifier). */
function envForVercelCli() {
  return {
    ...process.env,
    VERCEL_NON_INTERACTIVE: "1",
    NO_UPDATE_NOTIFIER: "1",
  };
}

function run(cmd, args, { cwd, input } = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    env: cmd === "vercel" ? envForVercelCli() : process.env,
    stdio: input !== undefined ? ["pipe", "inherit", "inherit"] : "inherit",
    input,
    encoding: "utf8",
  });
  if (res.error) {
    throw new Error(`Failed to run ${cmd}: ${res.error.message}`);
  }
  if (res.status !== 0) {
    throw new Error(`Command failed (${res.status}): ${cmd} ${args.join(" ")}`);
  }
  return res;
}

function fmtPath(p) {
  return p;
}

function isBlank(v) {
  return v === undefined || v === null || String(v).trim() === "";
}

export function parseDotenvFile(filePath) {
  const abs = resolve(process.cwd(), filePath);
  if (!existsSync(abs)) fail(`Env file not found: ${filePath}`);

  const raw = readFileSync(abs, "utf8");
  const out = {};

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

function looksSensitiveHeuristic(key) {
  const k = key.toUpperCase();
  return (
    k.includes("SECRET") ||
    k.includes("TOKEN") ||
    k.includes("PASSWORD") ||
    k.endsWith("_KEY") ||
    k.includes("PRIVATE") ||
    k.includes("SERVICE_ROLE")
  );
}

/**
 * @param {Set<string>} alwaysSensitiveKeys
 * @param {string} key
 */
function isSensitiveKey(alwaysSensitiveKeys, key) {
  return alwaysSensitiveKeys.has(key) || looksSensitiveHeuristic(key);
}

function parseArgs(argv, scriptName) {
  const args = {
    cwd: process.cwd(),
    envFile: "",
    environment: "production",
    force: true,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--cwd") {
      args.cwd = resolve(process.cwd(), argv[++i] ?? "");
      continue;
    }
    if (a === "--env-file") {
      args.envFile = argv[++i] ?? "";
      continue;
    }
    if (a === "--environment" || a === "-e") {
      args.environment = (argv[++i] ?? "").trim();
      continue;
    }
    if (a === "--force") {
      args.force = true;
      continue;
    }
    if (a === "--no-force") {
      args.force = false;
      continue;
    }
    if (a === "--help" || a === "-h") {
      process.stdout.write(
        [
          "Syncs a local .env file into Vercel project environment variables.",
          "",
          "Usage:",
          `  node scripts/${scriptName} --cwd <project-dir> --env-file <path> --environment <production|preview|development> [--force|--no-force]`,
          "",
          "Notes:",
          "- Requires the Vercel CLI to be authenticated and linked (run `vercel link` in the target directory first).",
          "- Runs with VERCEL_NON_INTERACTIVE=1 and NO_UPDATE_NOTIFIER=1 so the CLI does not prompt (e.g. update notices).",
          "- Values are provided to Vercel via stdin (not printed).",
          "- Keys that look like secrets are marked with --sensitive automatically; each entrypoint may add an explicit list.",
          "",
        ].join("\n")
      );
      process.exit(0);
    }
    fail(`Unknown arg: ${a} (use --help)`);
  }

  if (!args.envFile) fail("--env-file is required");
  if (!args.environment) fail("--environment is required");
  return args;
}

/**
 * @param {{ argv: string[]; alwaysSensitiveKeys: Set<string>; scriptName: string }} opts
 */
export function runVercelEnvSync(opts) {
  const { argv, alwaysSensitiveKeys, scriptName } = opts;

  const args = parseArgs(argv, scriptName);
  run("vercel", ["--version"], { cwd: args.cwd });

  const kv = parseDotenvFile(args.envFile);
  const allEntries = Object.entries(kv).filter(([k]) => k);
  const entries = allEntries.filter(([, v]) => !isBlank(v));
  const skipped = allEntries.length - entries.length;
  if (entries.length === 0) fail("No env vars found (empty file?)");

  process.stdout.write("🔧 Syncing Vercel environment variables\n\n");
  process.stdout.write(`📁 Project directory: ${fmtPath(args.cwd)}\n`);
  process.stdout.write(`📄 Env file: ${fmtPath(args.envFile)}\n`);
  process.stdout.write(`🌎 Target environment: ${args.environment}\n`);
  process.stdout.write(`🧾 Keys found: ${allEntries.length}\n`);
  if (skipped > 0) process.stdout.write(`⏭️  Skipped (empty values): ${skipped}\n`);
  process.stdout.write(`🚀 Will upsert: ${entries.length}\n\n`);

  let okCount = 0;
  for (const [key, value] of entries) {
    const cmd = ["env", "add", key, args.environment];
    if (args.force) cmd.push("--force");
    cmd.push("--yes");
    const sensitive = isSensitiveKey(alwaysSensitiveKeys, key);
    if (sensitive) cmd.push("--sensitive");

    process.stdout.write(`  Setting ${key}${sensitive ? " (sensitive)" : ""}...\n`);
    run("vercel", cmd, { cwd: args.cwd, input: `${value}\n` });
    okCount++;
  }

  process.stdout.write(`\n✅ Done. Updated ${okCount} key(s).\n`);
}
