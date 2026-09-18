#!/usr/bin/env node
/**
 * Layer 1 — record verification that Pro daily snapshots exist in the Supabase dashboard.
 *
 * Usage:
 *   node scripts/prod-backup/verify-layer1.mjs
 *   node scripts/prod-backup/verify-layer1.mjs --latest-snapshot 2026-09-17 --verified-by you@example.com
 *   node scripts/prod-backup/verify-layer1.mjs --no-open
 */

import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolveDashboardBackupsUrl, resolveSourceProjectRef } from "./constants.mjs";
import { ensureDir, log, parseArgs, repoRoot, resolveBackupDir, writeJson } from "./lib.mjs";

function printHelp() {
  log(`Usage: node scripts/prod-backup/verify-layer1.mjs [options]

Options:
  --latest-snapshot <YYYY-MM-DD>  Latest daily snapshot date (non-interactive)
  --verified-by <name>            Who verified (default: $USER)
  --backup-dir <path>             Write layer1-verification.json here (default: .backups/YYYYMMDD/)
  --suffix <text>                 Backup dir suffix (e.g. -pre-cutover)
  --no-open                       Do not open the dashboard in a browser
  -h, --help                      Show this help
`);
}

async function prompt(question, defaultValue = "") {
  const rl = createInterface({ input, output });
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  rl.close();
  return answer || defaultValue;
}

function openDashboard(dashboardUrl) {
  if (process.platform === "darwin") {
    spawnSync("open", [dashboardUrl], { stdio: "ignore" });
    return;
  }
  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", dashboardUrl], { stdio: "ignore" });
    return;
  }
  spawnSync("xdg-open", [dashboardUrl], { stdio: "ignore" });
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    latestSnapshot: null,
    verifiedBy: process.env.USER || process.env.USERNAME || "operator",
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--latest-snapshot" && argv[i + 1]) {
      out.latestSnapshot = argv[++i];
    } else if (arg === "--verified-by" && argv[i + 1]) {
      out.verifiedBy = argv[++i];
    }
  }

  return out;
}

async function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const projectRef = resolveSourceProjectRef({ envFile: args.envFile });
  const dashboardUrl = resolveDashboardBackupsUrl(projectRef);

  log("Layer 1 — Supabase Pro daily backups (dashboard)");
  log(`Project: ${projectRef}`);
  log(`Dashboard: ${dashboardUrl}`);
  log("");
  log("Confirm in the dashboard:");
  log("  - Recent daily snapshots are listed");
  log("  - Pro retention is 7 days");
  log("  - Note the latest snapshot date");
  log("");

  if (args.openDashboard) {
    openDashboard(dashboardUrl);
    log("Opened dashboard in your browser.");
  } else {
    log(`Open manually: ${dashboardUrl}`);
  }

  const latestSnapshot =
    args.latestSnapshot ??
    (await prompt("Latest daily snapshot date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10)));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(latestSnapshot)) {
    log("Invalid date format. Use YYYY-MM-DD.");
    process.exit(1);
  }

  const backupDir = resolveBackupDir(args);
  ensureDir(backupDir);

  const record = {
    layer: 1,
    projectRef,
    dashboardUrl,
    plan: "pro",
    retentionDays: 7,
    latestSnapshotDate: latestSnapshot,
    verifiedAt: new Date().toISOString(),
    verifiedBy: args.verifiedBy,
    notes: "DB-only snapshots; does not include Storage object bytes.",
  };

  const outPath = `${backupDir}/layer1-verification.json`;
  writeJson(outPath, record);

  log("");
  log(`Recorded Layer 1 verification: ${outPath.replace(repoRoot + "/", "")}`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
