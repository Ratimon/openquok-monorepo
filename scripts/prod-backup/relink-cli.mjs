#!/usr/bin/env node
/**
 * Phase B3 — point the Supabase CLI at the cutover target and repair migration
 * history when the aggregated `YYYYMMDD_core_structure.sql` date is local-only.
 *
 * Does not run `db push`. Restore already applied schema; repair only updates
 * `supabase_migrations.schema_migrations`.
 *
 * Usage:
 *   pnpm prod-backup:relink
 *   pnpm prod-backup:relink --dry-run
 *   pnpm prod-backup:relink --project-ref <target-ref>
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseProjectRefFromSupabaseUrl } from "./constants.mjs";
import {
  ensureDir,
  fail,
  listLocalAggregateVersions,
  loadBackendProdEnv,
  log,
  parseArgs,
  parseSupabaseJsonOutput,
  repoRoot,
  runSupabaseCli,
  tryLoadMigrationManifest,
  versionsNeedingRepair,
  writeJson,
} from "./lib.mjs";

const DEFAULT_ENV_FILE = "backend/.env.production.local";
const LINKED_PROJECT_FILE = resolve(repoRoot, "backend/supabase/.temp/linked-project.json");

function printHelp() {
  log(`Usage: node scripts/prod-backup/relink-cli.mjs [options]

Links backend/ to the cutover target project, lists migration history, and marks
the current aggregated core_structure date as applied when remote history is behind.

Options:
  --project-ref <ref>     Target project ref (or SUPABASE_TARGET_PROJECT_REF)
  --manifest-dir <path>   Target manifest dir (default: .backups/us-migration)
  --env-file <path>       Backend prod env fallback (${DEFAULT_ENV_FILE})
  --password <password>   DB password for link (or SUPABASE_TARGET_DB_PASSWORD / manifest)
  --skip-repair           Link only; do not repair migration history
  --dry-run               Print planned link + repair; do not change remote history
  --report <path>         Write relink-cli-report.json (default: manifest dir)
  -h, --help              Show this help
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    projectRef: null,
    manifestDir: null,
    envFile: DEFAULT_ENV_FILE,
    password: null,
    skipRepair: false,
    dryRun: false,
    reportPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--project-ref" && argv[i + 1]) out.projectRef = argv[++i];
    else if (arg === "--manifest-dir" && argv[i + 1]) out.manifestDir = argv[++i];
    else if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === "--password" && argv[i + 1]) out.password = argv[++i];
    else if (arg === "--skip-repair") out.skipRepair = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--report" && argv[i + 1]) out.reportPath = argv[++i];
  }

  return out;
}

function readLinkedProjectRef() {
  if (!existsSync(LINKED_PROJECT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LINKED_PROJECT_FILE, "utf8"))?.ref?.trim() || null;
  } catch {
    return null;
  }
}

function resolveTarget(args) {
  const loaded = tryLoadMigrationManifest({ manifestDir: args.manifestDir });
  const explicit =
    args.projectRef?.trim() || process.env.SUPABASE_TARGET_PROJECT_REF?.trim();
  if (explicit) {
    return { projectRef: explicit, source: "flag-or-env", manifest: loaded?.manifest ?? null, manifestPath: loaded?.path ?? null };
  }

  const fromManifest = loaded?.manifest?.projectRef?.trim();
  if (fromManifest) {
    return {
      projectRef: fromManifest,
      source: loaded.path,
      manifest: loaded.manifest,
      manifestPath: loaded.path,
    };
  }

  const env = loadBackendProdEnv(args.envFile);
  const fromUrl = parseProjectRefFromSupabaseUrl(env.PUBLIC_SUPABASE_URL);
  if (fromUrl) {
    return { projectRef: fromUrl, source: args.envFile, manifest: null, manifestPath: null };
  }

  fail(
    "Could not resolve target project ref. Pass --project-ref, set SUPABASE_TARGET_PROJECT_REF, or run pnpm prod-backup:create-us-project."
  );
}

function resolveDbPassword(args, manifest) {
  return (
    args.password?.trim() ||
    process.env.SUPABASE_TARGET_DB_PASSWORD?.trim() ||
    manifest?.databasePassword?.trim() ||
    null
  );
}

function defaultReportPath(args, manifestPath) {
  if (args.reportPath) return resolve(repoRoot, args.reportPath);
  if (manifestPath) return resolve(manifestPath, "..", "relink-cli-report.json");
  return resolve(repoRoot, ".backups/us-migration/relink-cli-report.json");
}

function listMigrations() {
  const stdout = runSupabaseCli([
    "migration",
    "list",
    "--linked",
    "--output-format",
    "json",
  ]);
  const parsed = parseSupabaseJsonOutput(stdout);
  return Array.isArray(parsed?.migrations) ? parsed.migrations : [];
}

function linkToTarget(projectRef, password) {
  const args = ["link", "--project-ref", projectRef];
  if (password) args.push("--password", password);
  runSupabaseCli(args);
}

function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const target = resolveTarget(args);
  const localVersions = listLocalAggregateVersions();
  if (localVersions.length === 0) {
    fail("No *_core_structure.sql file found under backend/supabase/migrations/.");
  }

  const currentlyLinked = readLinkedProjectRef();
  const needsLink = currentlyLinked !== target.projectRef;
  const password = resolveDbPassword(args, target.manifest);

  log(`Target project: ${target.projectRef} (from ${target.source})`);
  log(`Currently linked: ${currentlyLinked || "(none)"}`);
  log(`Local aggregate versions: ${localVersions.join(", ")}`);

  if (args.dryRun && needsLink) {
    log("Dry run: would run `supabase link --project-ref` for the target.");
  } else if (needsLink) {
    log("Linking backend/ to the target project...");
    linkToTarget(target.projectRef, password);
  } else {
    log("CLI already linked to the target; skipping link.");
  }

  let migrations = [];
  let pendingRepair = [];
  let repaired = [];
  const skippedRepair = args.skipRepair;

  if (!args.skipRepair) {
    if (args.dryRun && needsLink) {
      log("Dry run: skipping migration list until the CLI is linked to the target.");
    } else {
      migrations = listMigrations();
      pendingRepair = versionsNeedingRepair(localVersions, migrations);
      if (pendingRepair.length === 0) {
        log("Remote migration history already includes the local aggregate date(s); no repair.");
      } else if (args.dryRun) {
        log(`Dry run: would repair as applied: ${pendingRepair.join(", ")}`);
      } else {
        log(`Marking applied (history only, no db push): ${pendingRepair.join(", ")}`);
        runSupabaseCli(["migration", "repair", "--linked", "--status", "applied", ...pendingRepair]);
        migrations = listMigrations();
        repaired = pendingRepair;
        const stillPending = versionsNeedingRepair(localVersions, migrations);
        if (stillPending.length > 0) {
          fail(`Repair did not mark applied: ${stillPending.join(", ")}`);
        }
      }
    }
  } else {
    log("Skipping migration repair (--skip-repair).");
  }

  const linkedAfter = readLinkedProjectRef();
  const report = {
    relinkedAt: new Date().toISOString(),
    dryRun: Boolean(args.dryRun),
    targetProjectRef: target.projectRef,
    linkedProjectRef: linkedAfter,
    linked: !needsLink || (!args.dryRun && linkedAfter === target.projectRef),
    localAggregateVersions: localVersions,
    remoteMigrations: migrations,
    pendingRepair,
    repaired,
    skippedRepair,
  };

  const reportPath = defaultReportPath(args, target.manifestPath);
  ensureDir(resolve(reportPath, ".."));
  writeJson(reportPath, report);
  log(`Wrote ${reportPath}`);

  if (linkedAfter && linkedAfter !== target.projectRef && !args.dryRun) {
    fail(`CLI is linked to ${linkedAfter}, expected ${target.projectRef}.`);
  }
}

main();
