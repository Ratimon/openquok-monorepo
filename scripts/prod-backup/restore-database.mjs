#!/usr/bin/env node
/**
 * Restore a Layer 2 CLI dump (roles + schema + data) into a target Supabase project.
 *
 * Usage:
 *   export NEW_DB_URL='postgresql://postgres.<target-ref>:[PASSWORD]@<pooler-host>:5432/postgres'
 *   node scripts/prod-backup/restore-database.mjs --backup-dir .backups/20260918
 *
 * Or with migration manifest + password:
 *   export SUPABASE_TARGET_DB_PASSWORD='...'
 *   node scripts/prod-backup/restore-database.mjs --manifest-dir .backups/us-migration
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  ensureDir,
  fail,
  generateDbPassword,
  loadMigrationManifest,
  log,
  parseArgs,
  repoRoot,
  resetTargetDbPassword,
  resolveLatestBackupDir,
  resolveTargetDbUrl,
  writeJson,
} from "./lib.mjs";

const RESTORE_FILES = ["roles.sql", "schema.sql", "data.sql"];

function printHelp() {
  log(`Usage: node scripts/prod-backup/restore-database.mjs [options]

Restores roles.sql, schema.sql, and data.sql into the target database via psql.

Options:
  --backup-dir <path>     Backup directory (default: newest dated .backups/YYYYMMDD/)
  --manifest-dir <path>   Target project manifest dir (default: .backups/us-migration)
  --linked                Use backend/ linked Supabase project for target DB URL
  --db-password <password> Target DB password (or set NEW_DB_URL / SUPABASE_TARGET_DB_PASSWORD)
  --apply-security-grants Apply security_grants.sql when present in the backup dir
  --reset-db-password     Reset target DB password via Management API (linked/data restore)
  --data-only             Load data.sql only (schema already restored)
  --skip-prepare          Skip schema/roles preprocessing for known restore issues
  --report <path>         Write restore-report.json (default: <backup-dir>/restore-report.json)
  -h, --help              Show this help

Environment:
  NEW_DB_URL                    Full session-pooler connection string for the target
  SUPABASE_TARGET_DB_PASSWORD   Used with manifest projectRef + poolerHost
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    backupDir: null,
    manifestDir: null,
    linked: false,
    dbPassword: null,
    applySecurityGrants: false,
    resetDbPassword: false,
    dataOnly: false,
    skipPrepare: false,
    reportPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--backup-dir" && argv[i + 1]) out.backupDir = argv[++i];
    else if (arg === "--manifest-dir" && argv[i + 1]) out.manifestDir = argv[++i];
    else if (arg === "--linked") out.linked = true;
    else if (arg === "--db-password" && argv[i + 1]) out.dbPassword = argv[++i];
    else if (arg === "--apply-security-grants") out.applySecurityGrants = true;
    else if (arg === "--reset-db-password") out.resetDbPassword = true;
    else if (arg === "--data-only") out.dataOnly = true;
    else if (arg === "--skip-prepare") out.skipPrepare = true;
    else if (arg === "--report" && argv[i + 1]) out.reportPath = argv[++i];
  }

  return out;
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? repoRoot,
    encoding: opts.encoding ?? "utf8",
    stdio: opts.stdio ?? "pipe",
    env: process.env,
  });
  if (res.error) {
    fail(`Failed to run ${cmd}: ${res.error.message}`);
  }
  if (res.status !== 0) {
    const detail = [res.stderr, res.stdout].filter(Boolean).join("\n").trim();
    fail(`Command failed (${res.status}): ${cmd} ${args.join(" ")}\n${detail}`);
  }
  return res;
}

function prepareRolesSql(sourcePath, destPath) {
  let sql = readFileSync(sourcePath, "utf8");
  const lines = sql.split("\n").filter((line) => !/^\s*CREATE ROLE\s+"cli_login_postgres"/i.test(line));
  writeFileSync(destPath, lines.join("\n"), "utf8");
}

function prepareSchemaSql(sourcePath, destPath, { skipPgCronBootstrap = false } = {}) {
  let sql = readFileSync(sourcePath, "utf8");
  sql = sql.replace(/^ALTER .* OWNER TO "supabase_admin";?\s*$/gm, "-- skipped: supabase_admin owner line");
  if (skipPgCronBootstrap) {
    sql = sql.replace(
      /^CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";?\s*$/gm,
      "-- skipped: pg_cron already enabled on target (B0)"
    );
  }
  writeFileSync(destPath, sql, "utf8");
}

function resolveBackupDir(args) {
  if (args.backupDir) {
    const abs = resolve(repoRoot, args.backupDir);
    if (!existsSync(resolve(abs, "roles.sql"))) {
      fail(`Backup directory missing roles.sql: ${args.backupDir}`);
    }
    return abs;
  }
  return resolveLatestBackupDir();
}

const BACKEND_DIR = resolve(repoRoot, "backend");

function runLinkedQuery({ sql = null, file = null } = {}) {
  const args = ["--yes", "supabase@latest", "db", "query", "--linked"];
  if (file) args.push("-f", file);
  else if (sql) args.push(sql);
  else fail("runLinkedQuery requires sql or file");

  const res = spawnSync("npx", args, {
    cwd: BACKEND_DIR,
    encoding: "utf8",
    env: process.env,
    stdio: "inherit",
  });
  if (res.status !== 0) {
    fail(`Linked supabase db query failed${file ? ` for ${file}` : ""}.`);
  }
}

function verifyDumpFiles(backupDir) {
  for (const file of RESTORE_FILES) {
    const path = resolve(backupDir, file);
    if (!existsSync(path)) {
      fail(`Missing dump file: ${path}`);
    }
  }
}

function runPsqlRestore(dbUrl, files) {
  const dataIndex = files.findIndex((file) => file.endsWith("data.sql"));
  const args = ["--single-transaction", "--variable", "ON_ERROR_STOP=1", "--dbname", dbUrl];

  for (const file of files.slice(0, dataIndex)) {
    args.push("--file", file);
  }
  if (dataIndex >= 0) {
    args.push("--command", "SET session_replication_role = replica");
    for (const file of files.slice(dataIndex)) {
      args.push("--file", file);
    }
  }

  return run("psql", args, { stdio: "inherit" });
}

function queryScalarPsql(dbUrl, sql) {
  const res = run("psql", ["--dbname", dbUrl, "--tuples-only", "--no-align", "--command", sql]);
  return (res.stdout || "").trim();
}

function queryScalarLinked(sql) {
  const res = spawnSync("npx", ["--yes", "supabase@latest", "db", "query", "--linked", sql], {
    cwd: BACKEND_DIR,
    encoding: "utf8",
    env: process.env,
  });
  if (res.status !== 0) {
    fail(`Verification query failed: ${sql}`);
  }
  const stdout = (res.stdout || "").trim();
  const match = stdout.match(/"count"\s*:\s*"?(\d+)"?/i) || stdout.match(/\b(\d+)\b/);
  return match?.[1] ?? "0";
}

function collectVerification({ linked, dbUrl }) {
  const tables = [
    "users",
    "organizations",
    "blog_posts",
    "integrations",
    "refresh_tokens",
    "listings",
  ];
  const counts = {};
  for (const table of tables) {
    const sql = `select count(*)::text as count from public.${table};`;
    const value = linked ? queryScalarLinked(sql) : queryScalarPsql(dbUrl, sql);
    counts[table] = Number.parseInt(value, 10);
  }
  return counts;
}

async function resolveDataDbUrl({ args, manifest }) {
  if (process.env.NEW_DB_URL?.trim()) {
    return process.env.NEW_DB_URL.trim();
  }

  const explicitPassword =
    args.dbPassword?.trim() ||
    process.env.SUPABASE_TARGET_DB_PASSWORD?.trim() ||
    manifest?.databasePassword?.trim();

  if (explicitPassword) {
    return resolveTargetDbUrl({ manifest, dbPassword: explicitPassword, preferDirect: true });
  }

  if (args.resetDbPassword) {
    const password = generateDbPassword();
    log("Resetting target database password for data restore...");
    await resetTargetDbPassword(manifest.projectRef, password);
    manifest.databasePassword = password;
    return resolveTargetDbUrl({ manifest, dbPassword: password, preferDirect: true });
  }

  if (args.linked) {
    fail(
      "Linked restore needs psql for data.sql (COPY format). Pass --db-password, set NEW_DB_URL / SUPABASE_TARGET_DB_PASSWORD, or add --reset-db-password."
    );
  }

  return resolveTargetDbUrl({ manifest, dbPassword: args.dbPassword });
}

async function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const backupDir = resolveBackupDir(args);
  verifyDumpFiles(backupDir);

  const { manifest } = loadMigrationManifest({ manifestDir: args.manifestDir });
  const dataDbUrl = await resolveDataDbUrl({ args, manifest });

  log(`Restore → ${manifest.projectRef} (${manifest.region ?? "unknown region"})${args.linked ? " [linked]" : ""}`);
  log(`Backup: ${backupDir.replace(repoRoot + "/", "")}`);

  const workDir = mkdtempSync(join(tmpdir(), "openquok-restore-"));
  const restoreFiles = [];
  const filesToRestore = args.dataOnly ? ["data.sql"] : RESTORE_FILES;

  try {
    for (const file of filesToRestore) {
      const source = resolve(backupDir, file);
      const dest = join(workDir, file);
      if (!args.skipPrepare && file === "roles.sql") {
        prepareRolesSql(source, dest);
      } else if (!args.skipPrepare && file === "schema.sql") {
        prepareSchemaSql(source, dest, { skipPgCronBootstrap: args.linked || manifest.pgCronEnabled });
      } else {
        copyFileSync(source, dest);
      }
      restoreFiles.push(dest);
    }

    if (args.linked) {
      log("Running linked restore (roles + schema via Management API, data via psql)...");
      for (const file of restoreFiles) {
        if (file.endsWith("data.sql")) {
          log("Loading data.sql via psql (COPY format)...");
          runPsqlRestore(dataDbUrl, [file]);
          continue;
        }
        runLinkedQuery({ file });
      }
    } else {
      log("Running psql restore (roles → schema → data)...");
      runPsqlRestore(dataDbUrl, restoreFiles);
    }

    if (args.applySecurityGrants) {
      const grantsPath = resolve(backupDir, "security_grants.sql");
      if (existsSync(grantsPath)) {
        log("Applying security_grants.sql...");
        if (args.linked) {
          runLinkedQuery({ file: grantsPath });
        } else {
          run("psql", ["--single-transaction", "--variable", "ON_ERROR_STOP=1", "--dbname", dataDbUrl, "--file", grantsPath], {
            stdio: "inherit",
          });
        }
      } else {
        log("security_grants.sql not found — skipped.");
      }
    }

    log("Verifying row counts...");
    const counts = collectVerification({ linked: args.linked, dbUrl: dataDbUrl });
    for (const [table, count] of Object.entries(counts)) {
      log(`  ${table}: ${count}`);
    }

    if (manifest.databasePassword) {
      const { path: manifestPath, manifest: stored } = loadMigrationManifest({
        manifestDir: args.manifestDir,
      });
      if (!stored.databasePassword) {
        stored.databasePassword = manifest.databasePassword;
        writeJson(manifestPath, stored);
        log(`Recorded databasePassword in ${manifestPath.replace(repoRoot + "/", "")}`);
      }
    }

    const report = {
      restoredAt: new Date().toISOString(),
      targetProjectRef: manifest.projectRef,
      targetRegion: manifest.region ?? null,
      backupDir: backupDir.replace(repoRoot + "/", ""),
      files: filesToRestore,
      securityGrantsApplied: args.applySecurityGrants && existsSync(resolve(backupDir, "security_grants.sql")),
      tableCounts: counts,
      success: true,
    };

    const reportPath =
      args.reportPath
        ? resolve(repoRoot, args.reportPath)
        : resolve(backupDir, "restore-report.json");
    ensureDir(resolve(reportPath, ".."));
    writeJson(reportPath, report);
    log(`Wrote ${reportPath.replace(repoRoot + "/", "")}`);
    log("Restore complete.");
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
});
