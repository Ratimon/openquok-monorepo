#!/usr/bin/env node
/**
 * Rewrite embedded Supabase Storage URLs in blog_posts.content after region migration.
 *
 * Usage:
 *   export SUPABASE_SOURCE_PROJECT_REF='ldewhviobysqevtnfznh'
 *   pnpm prod-backup:fix-blog-urls --linked
 *
 * Or with explicit refs / target DB URL:
 *   pnpm prod-backup:fix-blog-urls --source-ref <source> --target-ref <target> --db-password '...'
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseProjectRefFromSupabaseUrl } from "./constants.mjs";
import {
  fail,
  loadBackendProdEnv,
  loadMigrationManifest,
  log,
  parseArgs,
  repoRoot,
  resolveTargetDbUrl,
  writeJson,
} from "./lib.mjs";

const BACKEND_DIR = resolve(repoRoot, "backend");
const DEFAULT_ENV_FILE = "backend/.env.production.local";

function printHelp() {
  log(`Usage: node scripts/prod-backup/fix-blog-urls.mjs [options]

Rewrites blog_posts.content URLs from the source Supabase project host to the target host.
Skips the UPDATE when no rows match the source host.

Options:
  --source-ref <ref>      Source project ref (or SUPABASE_SOURCE_PROJECT_REF / OLD_PROJECT_URL)
  --target-ref <ref>      Target project ref (default: migration manifest or prod env)
  --manifest-dir <path>   Target manifest dir (default: .backups/us-migration)
  --env-file <path>       Backend prod env for target URL fallback (${DEFAULT_ENV_FILE})
  --linked                Run via backend/ linked Supabase project (default when no NEW_DB_URL)
  --db-password <password> Target DB password (or NEW_DB_URL / SUPABASE_TARGET_DB_PASSWORD)
  --dry-run               Count matching rows only; do not UPDATE
  --report <path>         Write fix-blog-urls-report.json (default: manifest dir)
  -h, --help              Show this help

Environment:
  SUPABASE_SOURCE_PROJECT_REF   Source project ref during cutover
  OLD_PROJECT_URL               Source project URL (ref parsed from host)
  NEW_DB_URL                    Target session-pooler URL for psql mode
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    sourceRef: null,
    targetRef: null,
    manifestDir: null,
    envFile: DEFAULT_ENV_FILE,
    linked: false,
    dbPassword: null,
    dryRun: false,
    reportPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--source-ref" && argv[i + 1]) out.sourceRef = argv[++i];
    else if (arg === "--target-ref" && argv[i + 1]) out.targetRef = argv[++i];
    else if (arg === "--manifest-dir" && argv[i + 1]) out.manifestDir = argv[++i];
    else if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === "--linked") out.linked = true;
    else if (arg === "--db-password" && argv[i + 1]) out.dbPassword = argv[++i];
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--report" && argv[i + 1]) out.reportPath = argv[++i];
  }

  if (!out.linked && !process.env.NEW_DB_URL?.trim()) {
    out.linked = true;
  }

  return out;
}

function readCutoverSourceRef() {
  const backupsRoot = resolve(repoRoot, ".backups");
  if (!existsSync(backupsRoot)) return null;

  const candidates = [
    resolve(backupsRoot, "20260918-pre-cutover", "cutover-report.json"),
    resolve(backupsRoot, "migration", "cutover-report.json"),
  ];

  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      const report = JSON.parse(readFileSync(path, "utf8"));
      const ref = report?.sourceProjectRef?.trim();
      if (ref) return ref;
    } catch {
      // ignore malformed report
    }
  }

  return null;
}

function resolveSourceRef(args) {
  const explicit =
    args.sourceRef?.trim() ||
    process.env.SUPABASE_SOURCE_PROJECT_REF?.trim() ||
    parseProjectRefFromSupabaseUrl(process.env.OLD_PROJECT_URL) ||
    readCutoverSourceRef();

  if (!explicit) {
    fail(
      "Could not resolve source project ref. Pass --source-ref, set SUPABASE_SOURCE_PROJECT_REF, OLD_PROJECT_URL, or add sourceProjectRef to .backups/*/cutover-report.json."
    );
  }

  return explicit;
}

function resolveTargetRef(args, manifest) {
  const explicit =
    args.targetRef?.trim() ||
    manifest?.projectRef?.trim() ||
    parseProjectRefFromSupabaseUrl(process.env.NEW_PROJECT_URL) ||
    parseProjectRefFromSupabaseUrl(loadBackendProdEnv(args.envFile).PUBLIC_SUPABASE_URL);

  if (!explicit) {
    fail(
      "Could not resolve target project ref. Pass --target-ref, use a migration manifest, or set NEW_PROJECT_URL / PUBLIC_SUPABASE_URL."
    );
  }

  return explicit;
}

function supabaseHost(projectRef) {
  return `https://${projectRef}.supabase.co`;
}

function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}

function parseScalar(stdout) {
  const match = stdout.match(/"count"\s*:\s*"?(\d+)"?/i) || stdout.match(/\b(\d+)\b/);
  return Number.parseInt(match?.[1] ?? "0", 10);
}

function runLinkedQuery(sql) {
  const res = spawnSync("npx", ["--yes", "supabase@latest", "db", "query", "--linked", sql], {
    cwd: BACKEND_DIR,
    encoding: "utf8",
    env: process.env,
  });
  if (res.status !== 0) {
    const detail = [res.stderr, res.stdout].filter(Boolean).join("\n").trim();
    fail(`Linked supabase db query failed.\n${detail}`);
  }
  return res.stdout || "";
}

function runPsql(dbUrl, sql) {
  const res = spawnSync("psql", ["--dbname", dbUrl, "--tuples-only", "--no-align", "--command", sql], {
    encoding: "utf8",
    env: process.env,
  });
  if (res.status !== 0) {
    const detail = [res.stderr, res.stdout].filter(Boolean).join("\n").trim();
    fail(`psql query failed.\n${detail}`);
  }
  return res.stdout || "";
}

function countAffectedRows({ linked, dbUrl, sourceRef }) {
  const sql = `SELECT count(*)::int AS count FROM public.blog_posts WHERE content LIKE '%${escapeSqlLiteral(sourceRef)}.supabase.co%';`;
  const stdout = linked ? runLinkedQuery(sql) : runPsql(dbUrl, sql);
  return parseScalar(stdout);
}

function updateBlogUrls({ linked, dbUrl, sourceHost, targetHost, sourceRef }) {
  const sql = `UPDATE public.blog_posts SET content = replace(content, '${escapeSqlLiteral(sourceHost)}', '${escapeSqlLiteral(targetHost)}') WHERE content LIKE '%${escapeSqlLiteral(sourceRef)}.supabase.co%';`;
  if (linked) {
    runLinkedQuery(sql);
    return;
  }
  runPsql(dbUrl, sql);
}

async function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const { manifest, path: manifestPath } = loadMigrationManifest({ manifestDir: args.manifestDir });
  const sourceRef = resolveSourceRef(args);
  const targetRef = resolveTargetRef(args, manifest);
  const sourceHost = supabaseHost(sourceRef);
  const targetHost = supabaseHost(targetRef);

  if (sourceRef === targetRef) {
    fail(`Source and target project refs are the same (${sourceRef}). Nothing to rewrite.`);
  }

  const dbUrl = args.linked
    ? null
    : resolveTargetDbUrl({
        manifest,
        dbPassword: args.dbPassword,
        preferDirect: true,
      });

  log("Blog URL rewrite (blog_posts.content)");
  log(`Source: ${sourceHost}`);
  log(`Target: ${targetHost}`);
  log(`Mode: ${args.linked ? "linked supabase db query" : "psql"}`);

  const affectedBefore = countAffectedRows({ linked: args.linked, dbUrl, sourceRef });
  log(`Rows with source host: ${affectedBefore}`);

  let rowsUpdated = 0;
  if (affectedBefore > 0) {
    if (args.dryRun) {
      log("Dry run — skipping UPDATE.");
    } else {
      updateBlogUrls({ linked: args.linked, dbUrl, sourceHost, targetHost, sourceRef });
      const affectedAfter = countAffectedRows({ linked: args.linked, dbUrl, sourceRef });
      rowsUpdated = affectedBefore - affectedAfter;
      if (affectedAfter > 0) {
        fail(`UPDATE completed but ${affectedAfter} row(s) still reference ${sourceHost}.`);
      }
      log(`Updated ${rowsUpdated} row(s).`);
    }
  } else {
    log("No rows to update.");
  }

  const reportPath =
    args.reportPath?.trim() ||
    resolve(manifestPath.replace(/\/project\.json$/, ""), "fix-blog-urls-report.json");

  const report = {
    fixedAt: new Date().toISOString(),
    sourceProjectRef: sourceRef,
    targetProjectRef: targetRef,
    sourceHost,
    targetHost,
    dryRun: args.dryRun,
    rowsMatched: affectedBefore,
    rowsUpdated: args.dryRun ? 0 : rowsUpdated,
    success: true,
  };

  writeJson(resolve(repoRoot, reportPath.replace(repoRoot + "/", "")), report);
  log(`Report: ${reportPath.replace(repoRoot + "/", "")}`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
