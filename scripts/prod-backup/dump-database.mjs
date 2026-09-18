#!/usr/bin/env node
/**
 * Layer 2 — official Supabase CLI logical dump (roles + schema + data) to .backups/YYYYMMDD/.
 *
 * Prerequisites: Docker Desktop, Supabase CLI (via npx), psql (PostgreSQL 17).
 *
 * Usage:
 *   node scripts/prod-backup/dump-database.mjs --linked
 *
 * Or with an explicit session-pooler URL / password:
 *   export OLD_DB_URL='postgresql://postgres.ldewhviobysqevtnfznh:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'
 *   node scripts/prod-backup/dump-database.mjs
 *   node scripts/prod-backup/dump-database.mjs --db-password '...'
 */

import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROD_POOLER_HOST, PROD_PROJECT_REF } from "./constants.mjs";
import {
  buildSessionPoolerUrl,
  ensureDir,
  fail,
  log,
  parseArgs,
  repoRoot,
  resolveBackupDir,
  sha256File,
} from "./lib.mjs";

const DUMP_FILES = ["roles.sql", "schema.sql", "data.sql"];

function printHelp() {
  log(`Usage: node scripts/prod-backup/dump-database.mjs [options]

Options:
  --linked                   Use \`supabase db dump --linked\` from backend/ (no password in shell)
  --db-password <password>   Database password (or set OLD_DB_URL)
  --suffix <text>            Backup dir suffix (e.g. -pre-cutover)
  --backup-dir <path>        Explicit output directory under repo root
  -h, --help                 Show this help

Environment:
  OLD_DB_URL                 Full session-pooler connection string
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = { ...base, dbPassword: null, linked: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--db-password" && argv[i + 1]) {
      out.dbPassword = argv[++i];
    } else if (arg === "--linked") {
      out.linked = true;
    }
  }
  return out;
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? repoRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (res.error) {
    fail(`Failed to run ${cmd}: ${res.error.message}`);
  }
  if (res.status !== 0) {
    fail(`Command failed (${res.status}): ${cmd} ${args.join(" ")}`);
  }
}

function resolveDbUrl(args) {
  if (args.linked) {
    return null;
  }
  if (process.env.OLD_DB_URL?.trim()) {
    return process.env.OLD_DB_URL.trim();
  }
  if (args.dbPassword) {
    return buildSessionPoolerUrl(PROD_PROJECT_REF, args.dbPassword, PROD_POOLER_HOST);
  }
  fail(
    "Pass --linked (backend project linked to Seoul), or set OLD_DB_URL, or pass --db-password."
  );
}

function assertGitCleanOfBackups() {
  const res = spawnSync("git", ["status", "--porcelain", ".backups"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (res.status !== 0) {
    log("Warning: could not run git status for .backups");
    return;
  }
  const sqlTracked = res.stdout
    .split("\n")
    .filter((line) => line.trim() && /\.sql\b/.test(line));
  if (sqlTracked.length > 0) {
    fail("git status lists .backups SQL files — dumps must stay gitignored.");
  }
  log("git status: no .backups/*.sql tracked (OK)");
}

function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const dbUrl = resolveDbUrl(args);
  const backupDir = resolveBackupDir(args);
  ensureDir(backupDir);
  const backendDir = resolve(repoRoot, "backend");

  log(`Layer 2 — CLI logical dump → ${backupDir.replace(repoRoot + "/", "")}`);
  log("Running supabase db dump (roles, schema, data)...");

  const supabaseArgs = ["supabase@latest", "db", "dump"];
  const connectionArgs = dbUrl ? ["--db-url", dbUrl] : ["--linked"];
  const dumpCwd = dbUrl ? backupDir : backendDir;

  run("npx", [...supabaseArgs, ...connectionArgs, "-f", resolve(backupDir, "roles.sql"), "--role-only"], {
    cwd: dumpCwd,
  });
  run("npx", [...supabaseArgs, ...connectionArgs, "-f", resolve(backupDir, "schema.sql")], {
    cwd: dumpCwd,
  });
  run(
    "npx",
    [
      ...supabaseArgs,
      ...connectionArgs,
      "-f",
      resolve(backupDir, "data.sql"),
      "--use-copy",
      "--data-only",
      "-x",
      "storage.buckets_vectors",
      "-x",
      "storage.vector_indexes",
    ],
    { cwd: dumpCwd }
  );

  const lineCounts = {};
  for (const file of DUMP_FILES) {
    const path = resolve(backupDir, file);
    if (!existsSync(path)) {
      fail(`Expected dump file missing: ${file}`);
    }
    const wc = spawnSync("wc", ["-l", file], { cwd: backupDir, encoding: "utf8" });
    lineCounts[file] = wc.stdout.trim();
    log(lineCounts[file]);
  }

  const checksumLines = DUMP_FILES.map((file) => {
    const path = resolve(backupDir, file);
    return `${sha256File(path)}  ${file}`;
  });
  writeFileSync(resolve(backupDir, "checksums.txt"), `${checksumLines.join("\n")}\n`, "utf8");
  log(`Wrote checksums.txt (${DUMP_FILES.length} files)`);

  assertGitCleanOfBackups();
  log("Layer 2 complete.");
}

main();
