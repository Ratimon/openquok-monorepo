#!/usr/bin/env node
/**
 * Run Phase 0 initial production backup (Layers 1–3).
 *
 * Layer 2 requires OLD_DB_URL or --db-password (database password is not in backend env).
 *
 * Usage:
 *   node scripts/prod-backup/run-initial-backup.mjs --latest-snapshot 2026-09-17
 *   OLD_DB_URL='postgresql://...' node scripts/prod-backup/run-initial-backup.mjs --db-password '...'
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { formatBackupDirName, log, parseArgs, repoRoot } from "./lib.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));

function printHelp() {
  log(`Usage: node scripts/prod-backup/run-initial-backup.mjs [options]

Runs Layer 1 (dashboard verification record), Layer 2 (CLI dump), Layer 3 (storage export)
into the same .backups/YYYYMMDD/ directory.

Options:
  --latest-snapshot <YYYY-MM-DD>   Layer 1 snapshot date (non-interactive)
  --verified-by <name>             Layer 1 verifier
  --db-password <password>         Layer 2 database password (or set OLD_DB_URL)
  --suffix <text>                  Backup dir suffix
  --skip-layer1                    Skip dashboard verification
  --skip-layer2                    Skip CLI database dump
  --skip-layer3                    Skip storage export
  --no-open                        Do not open dashboard for Layer 1
  -h, --help                       Show this help
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    latestSnapshot: null,
    verifiedBy: null,
    dbPassword: null,
    skipLayer1: false,
    skipLayer2: false,
    skipLayer3: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--latest-snapshot" && argv[i + 1]) out.latestSnapshot = argv[++i];
    else if (arg === "--verified-by" && argv[i + 1]) out.verifiedBy = argv[++i];
    else if (arg === "--db-password" && argv[i + 1]) out.dbPassword = argv[++i];
    else if (arg === "--skip-layer1") out.skipLayer1 = true;
    else if (arg === "--skip-layer2") out.skipLayer2 = true;
    else if (arg === "--skip-layer3") out.skipLayer3 = true;
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

function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const suffixArg = args.suffix ? ["--suffix", args.suffix] : [];
  const backupDirArg = ["--backup-dir", `.backups/${formatBackupDirName(args.suffix)}`];

  log(`Phase 0 initial backup → .backups/${formatBackupDirName(args.suffix)}/`);
  log("");

  if (!args.skipLayer1) {
    const layer1Args = [...backupDirArg, ...suffixArg];
    if (args.latestSnapshot) layer1Args.push("--latest-snapshot", args.latestSnapshot);
    if (args.verifiedBy) layer1Args.push("--verified-by", args.verifiedBy);
    if (!args.openDashboard) layer1Args.push("--no-open");
    runNode("verify-layer1.mjs", layer1Args);
  }

  if (!args.skipLayer2) {
    const layer2Args = [...backupDirArg, ...suffixArg];
    if (args.dbPassword) {
      layer2Args.push("--db-password", args.dbPassword);
    } else if (!process.env.OLD_DB_URL?.trim()) {
      layer2Args.push("--linked");
    }
    runNode("dump-database.mjs", layer2Args);
  }

  if (!args.skipLayer3) {
    runNode("export-storage.mjs", [...backupDirArg, ...suffixArg]);
  }

  log("\nPhase 0 initial backup complete.");
}

main();
