#!/usr/bin/env node
/**
 * Phase B0 rehearsal — restore a Layer 2 dump into the throwaway US target project,
 * then dry-run Storage migration (list/compare buckets without copying bytes).
 *
 * Usage:
 *   export SUPABASE_TARGET_DB_PASSWORD='...'
 *   node scripts/prod-backup/rehearse-migration.mjs
 *
 * With source credentials for storage dry-run (defaults to backend/.env.production.local):
 *   node scripts/prod-backup/rehearse-migration.mjs --backup-dir .backups/20260918
 *
 * To also copy Storage objects (not a dry run):
 *   node scripts/prod-backup/rehearse-migration.mjs --migrate-storage --yes
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_ENV_FILE, resolveSourceProjectRef } from "./constants.mjs";
import {
  ensureDir,
  fail,
  loadBackendProdEnv,
  loadMigrationManifest,
  log,
  parseArgs,
  repoRoot,
  resolveLatestBackupDir,
  writeJson,
} from "./lib.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));

function printHelp() {
  log(`Usage: node scripts/prod-backup/rehearse-migration.mjs [options]

Runs a full cutover rehearsal on the throwaway target project:
  1. Restore Layer 2 dump (roles + schema + data)
  2. Storage migration dry-run (list source/target objects; no uploads unless --migrate-storage)

Options:
  --backup-dir <path>       Backup directory (default: newest dated .backups/YYYYMMDD/)
  --manifest-dir <path>     Target manifest dir (default: .backups/us-migration)
  --env-file <path>         Source backend env for OLD_PROJECT_* (default: ${DEFAULT_ENV_FILE})
  --linked                  Use backend/ linked Supabase project for target DB restore
  --db-password <password>  Target DB password (or NEW_DB_URL / SUPABASE_TARGET_DB_PASSWORD)
  --apply-security-grants   Apply security_grants.sql after restore
  --reset-db-password       Reset target DB password for linked data restore
  --migrate-storage         Run real Storage migration (default: dry-run only)
  --yes                     Skip confirmation for Storage migration
  --skip-restore            Only run Storage dry-run / migration
  --skip-storage            Only run database restore
  -h, --help                Show this help

Environment:
  NEW_DB_URL / SUPABASE_TARGET_DB_PASSWORD   Target database
  OLD_PROJECT_URL / OLD_PROJECT_SERVICE_KEY  Override source Storage credentials
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    backupDir: null,
    manifestDir: null,
    envFile: DEFAULT_ENV_FILE,
    linked: false,
    dbPassword: null,
    applySecurityGrants: false,
    resetDbPassword: false,
    migrateStorage: false,
    autoYes: false,
    skipRestore: false,
    skipStorage: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--backup-dir" && argv[i + 1]) out.backupDir = argv[++i];
    else if (arg === "--manifest-dir" && argv[i + 1]) out.manifestDir = argv[++i];
    else if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === "--linked") out.linked = true;
    else if (arg === "--db-password" && argv[i + 1]) out.dbPassword = argv[++i];
    else if (arg === "--apply-security-grants") out.applySecurityGrants = true;
    else if (arg === "--reset-db-password") out.resetDbPassword = true;
    else if (arg === "--migrate-storage") out.migrateStorage = true;
    else if (arg === "--yes") out.autoYes = true;
    else if (arg === "--skip-restore") out.skipRestore = true;
    else if (arg === "--skip-storage") out.skipStorage = true;
  }

  return out;
}

function runNode(script, extraArgs = []) {
  const res = spawnSync(process.execPath, [resolve(scriptDir, script), ...extraArgs], {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function resolveBackupDirArg(args) {
  if (args.backupDir) {
    return ["--backup-dir", args.backupDir];
  }
  const latest = resolveLatestBackupDir();
  return ["--backup-dir", latest.replace(repoRoot + "/", "")];
}

function resolveSourceStorageEnv(args, sourceProjectRef) {
  const oldUrl = process.env.OLD_PROJECT_URL?.trim();
  const oldKey = process.env.OLD_PROJECT_SERVICE_KEY?.trim();
  if (oldUrl && oldKey) {
    return { oldUrl, oldKey };
  }

  const env = loadBackendProdEnv(args.envFile);
  const projectUrl = env.PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!projectUrl || !serviceKey) {
    fail(`Set OLD_PROJECT_* or PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY in ${args.envFile}`);
  }

  const ref = resolveSourceProjectRef({ envFile: args.envFile });
  if (ref !== sourceProjectRef && sourceProjectRef) {
    log(`Note: source env ref (${ref}) differs from manifest sourceProjectRef (${sourceProjectRef}).`);
  }

  return { oldUrl: projectUrl, oldKey: serviceKey };
}

function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const { manifest, path: manifestPath } = loadMigrationManifest({ manifestDir: args.manifestDir });
  const backupDir = args.backupDir
    ? resolve(repoRoot, args.backupDir)
    : resolveLatestBackupDir();

  const reportDir = dirname(manifestPath);
  ensureDir(reportDir);

  if (args.linked && !args.resetDbPassword && !args.dbPassword && !process.env.NEW_DB_URL?.trim()) {
    args.resetDbPassword = true;
    log("Note: --linked enables --reset-db-password when no target DB URL/password is set.");
  }

  log("Phase B0 — migration rehearsal");
  log(`Target: ${manifest.projectRef} (${manifest.region ?? "unknown"})`);
  log(`Backup: ${backupDir.replace(repoRoot + "/", "")}`);
  log("");

  const report = {
    rehearsedAt: new Date().toISOString(),
    phase: "B0-rehearsal",
    targetProjectRef: manifest.projectRef,
    targetRegion: manifest.region ?? null,
    sourceProjectRef: manifest.sourceProjectRef ?? resolveSourceProjectRef({ envFile: args.envFile }),
    backupDir: backupDir.replace(repoRoot + "/", ""),
    restore: null,
    storage: null,
    success: false,
  };

  if (!args.skipRestore) {
    log("Step 1/2 — database restore");
    const restoreArgs = [
      ...resolveBackupDirArg(args),
      "--manifest-dir",
      manifestPath.replace(repoRoot + "/", "").replace(/\/project\.json$/, ""),
      "--report",
      resolve(reportDir, "rehearsal-restore-report.json").replace(repoRoot + "/", ""),
    ];
    if (args.linked) restoreArgs.push("--linked");
    if (args.dbPassword) restoreArgs.push("--db-password", args.dbPassword);
    if (args.applySecurityGrants) restoreArgs.push("--apply-security-grants");
    if (args.resetDbPassword) restoreArgs.push("--reset-db-password");
    runNode("restore-database.mjs", restoreArgs);

    const restoreReportPath = resolve(reportDir, "rehearsal-restore-report.json");
    if (existsSync(restoreReportPath)) {
      report.restore = JSON.parse(readFileSync(restoreReportPath, "utf8"));
    }
    log("");
  } else {
    log("Step 1/2 — database restore skipped (--skip-restore)");
    log("");
  }

  if (!args.skipStorage) {
    log(`Step 2/2 — storage ${args.migrateStorage ? "migration" : "dry-run"}`);
    const { oldUrl, oldKey } = resolveSourceStorageEnv(args, report.sourceProjectRef);
    const newUrl = manifest.projectUrl || manifest.env?.PUBLIC_SUPABASE_URL;
    const newKey = manifest.apiKeys?.SUPABASE_SECRET_KEY || manifest.env?.SUPABASE_SECRET_KEY;

    if (!newUrl || !newKey) {
      fail("Target manifest is missing projectUrl or SUPABASE_SECRET_KEY.");
    }

    const storageArgs = args.migrateStorage ? ["--yes"] : ["--dry-run"];
    const childEnv = {
      ...process.env,
      OLD_PROJECT_URL: oldUrl,
      OLD_PROJECT_SERVICE_KEY: oldKey,
      NEW_PROJECT_URL: newUrl,
      NEW_PROJECT_SERVICE_KEY: newKey,
    };

    const res = spawnSync(
      process.execPath,
      [resolve(scriptDir, "migrate-storage.mjs"), ...storageArgs],
      { cwd: repoRoot, stdio: "inherit", env: childEnv }
    );
    if (res.status !== 0) {
      process.exit(res.status ?? 1);
    }

    const storageReportPath = resolve(reportDir, "storage-dry-run-report.json");
    if (existsSync(storageReportPath)) {
      report.storage = JSON.parse(readFileSync(storageReportPath, "utf8"));
    } else if (args.migrateStorage) {
      report.storage = { mode: "migrate", completed: true };
    }
    log("");
  } else {
    log("Step 2/2 — storage skipped (--skip-storage)");
    log("");
  }

  report.success = true;
  const reportPath = resolve(reportDir, "rehearsal-report.json");
  writeJson(reportPath, report);
  log(`Rehearsal complete. Report: ${reportPath.replace(repoRoot + "/", "")}`);
}

main();
