import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_REHEARSAL_MANIFEST_DIR, MIGRATION_OUTPUT_DIR } from "./constants.mjs";
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

export function buildSessionPoolerUrl(projectRef, password, host) {
  if (!host?.trim()) {
    fail("Pooler host is required (set SUPABASE_SOURCE_POOLER_HOST or OLD_DB_URL).");
  }
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${projectRef}:${encoded}@${host.trim()}:5432/postgres`;
}

export function sha256File(path) {
  const data = readFileSync(path);
  return createHash("sha256").update(data).digest("hex");
}

export function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function readJson(path) {
  if (!existsSync(path)) {
    fail(`JSON file not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Load Phase B0 target project manifest (project.json). */
export function loadMigrationManifest({ manifestDir = null } = {}) {
  const candidates = [
    manifestDir ? resolve(repoRoot, manifestDir, "project.json") : null,
    resolve(repoRoot, DEFAULT_REHEARSAL_MANIFEST_DIR, "project.json"),
    resolve(repoRoot, MIGRATION_OUTPUT_DIR, "project.json"),
  ].filter(Boolean);

  for (const path of candidates) {
    if (existsSync(path)) {
      return { manifest: readJson(path), path };
    }
  }

  fail(
    `Migration manifest not found. Run pnpm prod-backup:create-us-project or pass --manifest-dir.`
  );
}

/** Pick the newest dated backup directory under .backups/ that contains roles.sql. */
export function resolveLatestBackupDir() {
  const backupsRoot = resolve(repoRoot, ".backups");
  if (!existsSync(backupsRoot)) {
    fail("No .backups/ directory found. Run prod-backup:dump first.");
  }

  const dirs = readdirSync(backupsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{8}/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const name of dirs) {
    const dir = resolve(backupsRoot, name);
    if (existsSync(resolve(dir, "roles.sql"))) {
      return dir;
    }
  }

  fail("No backup directory with roles.sql found under .backups/.");
}

function readAccessTokenFile(path) {
  if (!existsSync(path)) return null;
  const value = readFileSync(path, "utf8").trim();
  return value || null;
}

function readAccessTokenFromKeychain() {
  if (process.platform !== "darwin") return null;
  const result = spawnSync(
    "security",
    ["find-generic-password", "-s", "Supabase CLI", "-w"],
    { encoding: "utf8" }
  );
  if (result.status !== 0) return null;
  const value = (result.stdout || "").trim();
  if (!value.startsWith("sbp_")) return null;
  return value;
}

/** Resolve Management API token for password reset (env, file, or macOS keychain). */
export function resolveAccessToken() {
  const fromEnv = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  const fromKeychain = readAccessTokenFromKeychain();
  if (fromKeychain) return fromKeychain;

  const home = homedir();
  const candidates = [
    resolve(home, ".supabase", "access-token"),
    resolve(home, ".config", "supabase", "access-token"),
    resolve(home, "Library", "Application Support", "supabase", "access-token"),
  ];
  for (const path of candidates) {
    const token = readAccessTokenFile(path);
    if (token) return token;
  }

  return null;
}

export function buildDirectDbUrl(projectRef, password) {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres`;
}

export function generateDbPassword() {
  return randomBytes(24).toString("base64url");
}

export async function resetTargetDbPassword(projectRef, password) {
  const token = resolveAccessToken();
  if (!token) {
    fail(
      "Cannot reset target DB password. Set SUPABASE_ACCESS_TOKEN or run `supabase login`, or pass --db-password / NEW_DB_URL."
    );
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const text = await res.text();
  if (!res.ok) {
    fail(`Failed to reset target DB password (${res.status}): ${text}`);
  }
}

export function resolveTargetDbUrl({ manifest, dbPassword = null, preferDirect = false } = {}) {
  if (process.env.NEW_DB_URL?.trim()) {
    return process.env.NEW_DB_URL.trim();
  }

  const password =
    dbPassword?.trim() ||
    process.env.SUPABASE_TARGET_DB_PASSWORD?.trim() ||
    manifest?.databasePassword?.trim();

  if (!password) {
    fail(
      "Set NEW_DB_URL, SUPABASE_TARGET_DB_PASSWORD, --db-password, or databasePassword in project.json."
    );
  }

  const projectRef = manifest?.projectRef?.trim();
  if (!projectRef) {
    fail("Migration manifest is missing projectRef.");
  }

  const useDirect =
    preferDirect ||
    process.env.SUPABASE_TARGET_USE_DIRECT_DB === "1" ||
    process.env.SUPABASE_TARGET_USE_DIRECT_DB === "true";

  if (useDirect) {
    return buildDirectDbUrl(projectRef, password);
  }

  const poolerHost = manifest?.poolerHost?.trim();
  if (!poolerHost) {
    fail("Migration manifest is missing poolerHost (or set SUPABASE_TARGET_USE_DIRECT_DB=1).");
  }

  return buildSessionPoolerUrl(projectRef, password, poolerHost);
}
