#!/usr/bin/env node
/**
 * Verify link_directory_saved_sites schema before/after the saved-sites rename deploy.
 *
 * Usage:
 *   pnpm prod-backup:verify-saved-sites --local     # after `supabase db reset` in backend/
 *   pnpm prod-backup:verify-saved-sites --linked   # production (backend/ linked project)
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fail, log, parseArgs, repoRoot } from "./lib.mjs";
import {
  evaluateLinkDirectorySavedSitesSchema,
  LINK_DIRECTORY_SAVED_SITES_SCHEMA_SQL,
  parseLinkedQueryJson,
} from "./smokeChecks.mjs";

const BACKEND_DIR = resolve(repoRoot, "backend");
const SUPABASE_CLI = ["--yes", "supabase@latest"];

function printHelp() {
  log(`Usage: node scripts/prod-backup/verify-link-directory-saved-sites.mjs [options]

Checks public.link_directory_saved_sites and outreach_completed_at; fails if
link_directory_bookmarks remains.

Options:
  --local     Query the local Supabase stack (default)
  --linked    Query the linked production project from backend/
  -h, --help  Show this help
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  let linked = false;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--linked") linked = true;
    else if (arg === "--local") linked = false;
    else if (arg === "-h" || arg === "--help") return { help: true };
    else fail(`Unknown argument: ${arg}`);
  }

  return { linked };
}

function runDbQuery(sql, linked) {
  const args = [...SUPABASE_CLI, "db", "query"];
  if (linked) args.push("--linked");
  args.push(sql);

  const res = spawnSync("npx", args, {
    cwd: BACKEND_DIR,
    encoding: "utf8",
    env: process.env,
  });

  if (res.status !== 0) {
    const detail = [res.stderr, res.stdout].filter(Boolean).join("\n").trim();
    fail(
      linked
        ? `Linked supabase db query failed. Link backend/ to the project first.\n${detail}`
        : `Local supabase db query failed. Run \`cd backend && supabase start\` or \`supabase db reset\`.\n${detail}`
    );
  }

  return res.stdout || "";
}

function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const mode = args.linked ? "linked" : "local";
  log(`Link directory saved sites schema check (${mode})…`);

  const stdout = runDbQuery(LINK_DIRECTORY_SAVED_SITES_SCHEMA_SQL, args.linked);
  const row = parseLinkedQueryJson(stdout);
  const { ok, checks } = evaluateLinkDirectorySavedSitesSchema(row);

  for (const check of checks) {
    log(`  ${check.ok ? "pass" : "FAIL"}  ${check.name}`);
  }

  if (!ok) {
    fail(
      "Schema check failed. For production with link_directory_bookmarks, run " +
        "backend/supabase/ops/link_directory_saved_sites_prod_cutover.sql in the SQL editor, " +
        "then repair migration history. See /docs/installation/production-deployment#link-directory-saved-sites."
    );
  }

  log("Saved → Backlinks database prerequisites OK.");
  log(
    "Manual UI smoke (signed in): /build-backlinks → Save site → /account/saved?tab=backlinks → reorder → Done → refresh."
  );
}

main();
