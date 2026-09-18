import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDotenvFile } from "../vercelSyncEnvCore.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(scriptDir, "../..");

export function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

export function log(message) {
  process.stdout.write(`${message}\n`);
}

export function parseArgs(argv) {
  const args = { suffix: "", envFile: null, backupDir: null, openDashboard: true };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--suffix" && argv[i + 1]) {
      args.suffix = argv[++i];
    } else if (arg === "--env-file" && argv[i + 1]) {
      args.envFile = argv[++i];
    } else if (arg === "--backup-dir" && argv[i + 1]) {
      args.backupDir = argv[++i];
    } else if (arg === "--no-open") {
      args.openDashboard = false;
    } else if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
  }
  return args;
}

export function formatBackupDirName(suffix = "") {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return suffix ? `${date}${suffix}` : date;
}

export function resolveBackupDir({ suffix = "", backupDir = null } = {}) {
  if (backupDir) {
    return resolve(repoRoot, backupDir);
  }
  const dirName = formatBackupDirName(suffix);
  return resolve(repoRoot, ".backups", dirName);
}

export function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

export function loadBackendProdEnv(envFile) {
  const rel = envFile ?? "backend/.env.production.local";
  const abs = resolve(repoRoot, rel);
  if (!existsSync(abs)) {
    fail(`Env file not found: ${rel}`);
  }
  return parseDotenvFile(abs);
}

export function buildSessionPoolerUrl(projectRef, password, host = "aws-1-ap-northeast-2.pooler.supabase.com") {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${projectRef}:${encoded}@${host}:5432/postgres`;
}

export function sha256File(path) {
  const data = readFileSync(path);
  return createHash("sha256").update(data).digest("hex");
}

export function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
