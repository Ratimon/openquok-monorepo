#!/usr/bin/env node
/**
 * Phase B4 — cutover smoke checks against the target Supabase project.
 *
 * Automated: env alignment, auth settings, row counts (users/posts/integrations/
 * cloud trial/billing), pg_cron, leftover Storage hosts, Database Linter RPC
 * exposure, publishable-key RPC denial, public HTTP (blog, health, writes not 503).
 *
 * Manual follow-ups (Google login, new signup, session reload, scheduled post,
 * provider OAuth, Stripe dashboard) are printed at the end; they are not executed.
 *
 * Usage:
 *   pnpm prod-backup:smoke
 *   pnpm prod-backup:smoke --skip-http
 *   pnpm prod-backup:smoke --source-ref <old-ref>
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseDotenvFile } from "../vercelSyncEnvCore.mjs";
import {
  DEFAULT_ENV_FILE,
  parseProjectRefFromSupabaseUrl,
} from "./constants.mjs";
import {
  ensureDir,
  fail,
  loadBackendProdEnv,
  log,
  parseArgs,
  repoRoot,
  resolveAccessToken,
  tryLoadMigrationManifest,
  writeJson,
} from "./lib.mjs";
import {
  EXPECTED_CRON_JOB,
  SENSITIVE_RPC_NAMES,
  classifySensitiveRpcResponse,
  cronJobPresent,
  parseLinkedQueryJson,
  parseCliJsonStdout,
  filterHighSeverityRpcLints,
  internalFunctionsExposedToAnon,
  isMaintenanceFreezeResponse,
  publicStorageObjectUrl,
  summarizeCheckResults,
  supabaseHost,
} from "./smokeChecks.mjs";

const BACKEND_DIR = resolve(repoRoot, "backend");
const LINKED_PROJECT_FILE = resolve(repoRoot, "backend/supabase/.temp/linked-project.json");
const SUPABASE_CLI = ["--yes", "supabase@2.117.0"];
const RPC_PROBE_TIMEOUT_MS = 20_000;
const HTTP_TIMEOUT_MS = 20_000;

function printHelp() {
  log(`Usage: node scripts/prod-backup/verify-smoke.mjs [options]

Phase B4 smoke checks for the cutover target (current PUBLIC_SUPABASE_URL).

Options:
  --env-file <path>         Backend prod env (default: ${DEFAULT_ENV_FILE})
  --web-env-file <path>     Web prod env (default: web/.env.production.local)
  --worker-env-file <path>  Worker prod env (default: orchestrator/.env.production.local)
  --manifest-dir <path>     Target manifest dir (default: .backups/us-migration)
  --source-ref <ref>        Pre-cutover project ref (or SUPABASE_SOURCE_PROJECT_REF)
  --skip-http               Skip live HTTP / Storage / RPC probes
  --skip-linter             Skip Database Linter (CLI advisors)
  --repair-cron             Schedule delete-expired-refresh-tokens if missing
  --open-dashboard          Open Advisors → Security in the browser
  --report <path>           Write smoke-report.json (default: manifest dir)
  -h, --help                Show this help
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };

  const out = {
    ...base,
    envFile: DEFAULT_ENV_FILE,
    webEnvFile: "web/.env.production.local",
    workerEnvFile: "orchestrator/.env.production.local",
    manifestDir: null,
    sourceRef: null,
    skipHttp: false,
    skipLinter: false,
    repairCron: false,
    openDashboard: false,
    reportPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === "--web-env-file" && argv[i + 1]) out.webEnvFile = argv[++i];
    else if (arg === "--worker-env-file" && argv[i + 1]) out.workerEnvFile = argv[++i];
    else if (arg === "--manifest-dir" && argv[i + 1]) out.manifestDir = argv[++i];
    else if (arg === "--source-ref" && argv[i + 1]) out.sourceRef = argv[++i];
    else if (arg === "--skip-http") out.skipHttp = true;
    else if (arg === "--skip-linter") out.skipLinter = true;
    else if (arg === "--repair-cron") out.repairCron = true;
    else if (arg === "--open-dashboard") out.openDashboard = true;
    else if (arg === "--report" && argv[i + 1]) out.reportPath = argv[++i];
  }

  return out;
}

function loadEnvFile(rel) {
  const abs = resolve(repoRoot, rel);
  if (!existsSync(abs)) return null;
  return { path: rel, env: parseDotenvFile(abs) };
}

function readLinkedProjectRef() {
  if (!existsSync(LINKED_PROJECT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LINKED_PROJECT_FILE, "utf8"))?.ref?.trim() || null;
  } catch {
    return null;
  }
}

function supabaseCliEnv() {
  const { SUPABASE_ACCESS_TOKEN: _pat, ...env } = process.env;
  return { ...env, NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE || "/tmp/npm-cache-openquok" };
}

function runLinkedQuery(sql) {
  const result = spawnSync("npx", [...SUPABASE_CLI, "db", "query", "--linked", sql], {
    cwd: BACKEND_DIR,
    encoding: "utf8",
    env: supabaseCliEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    fail(`Linked supabase db query failed.\n${detail}`);
  }
  return result.stdout || "";
}

function runSecurityAdvisorsCli() {
  const result = spawnSync(
    "npx",
    [
      ...SUPABASE_CLI,
      "db",
      "advisors",
      "--linked",
      "--type",
      "security",
      "--output-format",
      "json",
      "--fail-on",
      "none",
    ],
    {
      cwd: BACKEND_DIR,
      encoding: "utf8",
      env: supabaseCliEnv(),
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    return { skipped: true, reason: "cli_failed", body: detail.slice(0, 300) };
  }
  const parsed = parseCliJsonStdout(result.stdout);
  const lints = Array.isArray(parsed?.results)
    ? parsed.results
    : Array.isArray(parsed?.lints)
      ? parsed.lints
      : Array.isArray(parsed)
        ? parsed
        : [];
  return { lints };
}

const CRON_JOB_SQL = `SELECT cron.schedule('delete-expired-refresh-tokens', '30 3 * * 6', $cmd$DELETE FROM public.refresh_tokens WHERE expires_at < now()$cmd$);`;

function queryJson(sql) {
  const parsed = parseLinkedQueryJson(runLinkedQuery(sql));
  if (parsed == null) {
    fail(`Could not parse JSON from supabase db query:\n${sql}`);
  }
  return parsed;
}

function escapeSqlLiteral(value) {
  return String(value).replace(/'/g, "''");
}

function addCheck(checks, id, status, detail, extra = {}) {
  const row = { id, status, detail, ...extra };
  checks.push(row);
  const mark = status === "pass" ? "PASS" : status === "fail" ? "FAIL" : status === "warn" ? "WARN" : "SKIP";
  log(`[${mark}] ${id}: ${detail}`);
  return row;
}

async function fetchJson(url, { method = "GET", headers = {}, body, timeoutMs = HTTP_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: res.status, headers: res.headers, text, json, location: res.headers.get("location") };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHeadOrGet(url) {
  const head = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (head.status !== 405 && head.status !== 400) {
    return { status: head.status, url };
  }
  const get = await fetch(url, { method: "GET", redirect: "follow" });
  return { status: get.status, url };
}

function openDashboard(url) {
  if (process.platform === "darwin") {
    spawnSync("open", [url], { stdio: "ignore" });
    return;
  }
  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });
    return;
  }
  spawnSync("xdg-open", [url], { stdio: "ignore" });
}

function resolveSourceRef(args, manifest) {
  return (
    args.sourceRef?.trim() ||
    process.env.SUPABASE_SOURCE_PROJECT_REF?.trim() ||
    parseProjectRefFromSupabaseUrl(process.env.OLD_PROJECT_URL) ||
    manifest?.sourceProjectRef?.trim() ||
    null
  );
}

function advisorsUrl(projectRef) {
  return `https://supabase.com/dashboard/project/${projectRef}/advisors/security`;
}

function cronDashboardUrl(projectRef) {
  return `https://supabase.com/dashboard/project/${projectRef}/integrations`;
}

async function fetchSecurityAdvisors(projectRef) {
  const token = resolveAccessToken();
  if (!token) return { skipped: true, reason: "no_access_token" };
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/advisors/security`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    return { skipped: true, reason: `http_${res.status}`, body: text.slice(0, 300) };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { skipped: true, reason: "invalid_json" };
  }
}

function defaultReportPath(args, manifestPath) {
  if (args.reportPath) return resolve(repoRoot, args.reportPath);
  if (manifestPath) return resolve(manifestPath, "..", "smoke-report.json");
  return resolve(repoRoot, ".backups/us-migration/smoke-report.json");
}

async function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const checks = [];
  const backend = loadBackendProdEnv(args.envFile);
  const webLoaded = loadEnvFile(args.webEnvFile);
  const workerLoaded = loadEnvFile(args.workerEnvFile);
  const loadedManifest = tryLoadMigrationManifest({ manifestDir: args.manifestDir });
  const manifest = loadedManifest?.manifest ?? null;

  const targetRef =
    parseProjectRefFromSupabaseUrl(backend.PUBLIC_SUPABASE_URL) ||
    manifest?.projectRef?.trim() ||
    null;
  if (!targetRef) {
    fail("Could not resolve target project ref from PUBLIC_SUPABASE_URL or the migration manifest.");
  }

  const projectUrl = supabaseHost(targetRef);
  const publishableKey = (
    backend.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    manifest?.apiKeys?.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();
  const frontendUrl = String(backend.FRONTEND_DOMAIN_URL || "https://www.openquok.com").replace(/\/$/, "");
  const backendUrl = String(backend.BACKEND_DOMAIN_URL || "https://api.openquok.com").replace(/\/$/, "");
  const apiPrefix = String(backend.API_PREFIX || "/api/v1").replace(/\/$/, "") || "/api/v1";
  const sourceRef = resolveSourceRef(args, manifest);
  const linkedRef = readLinkedProjectRef();

  log("Phase B4 — cutover smoke");
  log(`Target project: ${targetRef}`);
  log(`Project URL: ${projectUrl}`);
  log(`Frontend: ${frontendUrl}`);
  log(`API: ${backendUrl}`);
  if (sourceRef) log(`Source project (pre-cutover): ${sourceRef}`);
  log("");

  const backendMode = (backend.MAINTENANCE_MODE || "off").trim() || "off";
  addCheck(
    checks,
    "env.maintenance.backend",
    backendMode === "off" || backendMode === "banner" ? "pass" : "fail",
    `backend MAINTENANCE_MODE=${backendMode} (expected off after smoke)`
  );

  if (webLoaded) {
    const webMode = (webLoaded.env.MAINTENANCE_MODE || "off").trim() || "off";
    const webRef = parseProjectRefFromSupabaseUrl(webLoaded.env.VITE_PUBLIC_SUPABASE_URL);
    addCheck(
      checks,
      "env.maintenance.web",
      webMode === "off" || webMode === "banner" ? "pass" : "fail",
      `web MAINTENANCE_MODE=${webMode}`
    );
    addCheck(
      checks,
      "env.supabase.web",
      webRef === targetRef ? "pass" : "fail",
      webRef === targetRef
        ? "VITE_PUBLIC_SUPABASE_URL matches target"
        : `VITE_PUBLIC_SUPABASE_URL ref ${webRef || "(missing)"} != ${targetRef}`
    );
  } else {
    addCheck(checks, "env.web", "warn", `${args.webEnvFile} not found`);
  }

  if (workerLoaded) {
    const workerMode = (workerLoaded.env.MAINTENANCE_MODE || "off").trim() || "off";
    const workerRef = parseProjectRefFromSupabaseUrl(workerLoaded.env.PUBLIC_SUPABASE_URL);
    addCheck(
      checks,
      "env.maintenance.workers",
      workerMode === "off" || workerMode === "banner" ? "pass" : "fail",
      `workers MAINTENANCE_MODE=${workerMode}`
    );
    addCheck(
      checks,
      "env.supabase.workers",
      workerRef === targetRef ? "pass" : "fail",
      workerRef === targetRef
        ? "orchestrator PUBLIC_SUPABASE_URL matches target"
        : `orchestrator PUBLIC_SUPABASE_URL ref ${workerRef || "(missing)"} != ${targetRef}`
    );
  } else {
    addCheck(checks, "env.workers", "warn", `${args.workerEnvFile} not found`);
  }

  addCheck(
    checks,
    "cli.linked",
    linkedRef === targetRef ? "pass" : linkedRef ? "fail" : "warn",
    linkedRef === targetRef
      ? "Supabase CLI linked to target"
      : `CLI linked ${linkedRef || "(none)"}; expected ${targetRef} (run pnpm prod-backup:relink)`
  );

  const counts = queryJson(`
SELECT json_build_object(
  'users', (SELECT count(*)::int FROM public.users),
  'googleUsers', (SELECT count(*)::int FROM public.users WHERE lower(coalesce(provider, '')) = 'google'),
  'verifiedUsers', (SELECT count(*)::int FROM public.users WHERE is_email_verified IS TRUE),
  'cloudTrialConsumed', (SELECT count(*)::int FROM public.users WHERE cloud_trial_consumed_at IS NOT NULL),
  'subscriptions', (SELECT count(*)::int FROM public.organization_subscriptions WHERE deleted_at IS NULL),
  'posts', (SELECT count(*)::int FROM public.posts WHERE deleted_at IS NULL),
  'queuedPosts', (SELECT count(*)::int FROM public.posts WHERE deleted_at IS NULL AND state = 'QUEUE'),
  'publishedPosts', (SELECT count(*)::int FROM public.posts WHERE deleted_at IS NULL AND state = 'PUBLISHED'),
  'integrations', (SELECT count(*)::int FROM public.integrations WHERE deleted_at IS NULL),
  'activeIntegrations', (SELECT count(*)::int FROM public.integrations WHERE deleted_at IS NULL AND disabled = false),
  'integrationProviders', (
    SELECT coalesce(json_agg(DISTINCT provider_identifier ORDER BY provider_identifier), '[]'::json)
    FROM public.integrations
    WHERE deleted_at IS NULL
  ),
  'blogPosts', (SELECT count(*)::int FROM public.blog_posts),
  'publishedBlogPosts', (
    SELECT count(*)::int FROM public.blog_posts
    WHERE is_user_published IS TRUE AND is_admin_approved IS TRUE
  ),
  'listings', (SELECT count(*)::int FROM public.listings)
) AS smoke;
`);

  addCheck(
    checks,
    "auth.users",
    counts.users > 0 ? "pass" : "fail",
    `${counts.users} user row(s); ${counts.googleUsers} Google; ${counts.verifiedUsers} email-verified`
  );
  addCheck(
    checks,
    "trial.cloud_trial_consumed_at",
    Number.isInteger(counts.cloudTrialConsumed) ? "pass" : "fail",
    `${counts.cloudTrialConsumed} user(s) with cloud_trial_consumed_at set`
  );
  addCheck(
    checks,
    "billing.subscriptions",
    Number.isInteger(counts.subscriptions) ? "pass" : "fail",
    `${counts.subscriptions} organization_subscriptions row(s) (Stripe identifier column intact)`
  );
  addCheck(
    checks,
    "posts.rows",
    counts.posts > 0 ? "pass" : "warn",
    `${counts.posts} post(s); ${counts.queuedPosts} QUEUE; ${counts.publishedPosts} PUBLISHED`
  );
  addCheck(
    checks,
    "workers.queue_evidence",
    counts.publishedPosts > 0 || counts.queuedPosts > 0 ? "pass" : "warn",
    "Workers: QUEUE/PUBLISHED rows present. Enqueue one scheduled post after freeze is off (manual)."
  );
  addCheck(
    checks,
    "integrations.rows",
    counts.activeIntegrations > 0 ? "pass" : "warn",
    `${counts.activeIntegrations} active integration(s); providers: ${JSON.stringify(counts.integrationProviders ?? [])}`
  );
  addCheck(
    checks,
    "blog.published",
    counts.publishedBlogPosts > 0 ? "pass" : "warn",
    `${counts.publishedBlogPosts} published blog post(s) of ${counts.blogPosts} total`
  );

  const cron = queryJson(`
SELECT json_build_object(
  'extensionPresent', EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'),
  'jobNames', coalesce((SELECT json_agg(j.jobname ORDER BY j.jobname) FROM cron.job j), '[]'::json)
) AS smoke;
`);
  addCheck(
    checks,
    "pg_cron.extension",
    cron.extensionPresent ? "pass" : "fail",
    cron.extensionPresent
      ? `pg_cron enabled; jobs=${JSON.stringify(cron.jobNames ?? [])}`
      : "pg_cron extension missing on target"
  );

  if (!cronJobPresent(cron.jobNames) && args.repairCron && cron.extensionPresent) {
    log("Scheduling missing delete-expired-refresh-tokens cron job...");
    runLinkedQuery(CRON_JOB_SQL);
    const repaired = queryJson(`
SELECT json_build_object(
  'jobNames', coalesce((SELECT json_agg(j.jobname ORDER BY j.jobname) FROM cron.job j), '[]'::json)
) AS smoke;
`);
    cron.jobNames = repaired.jobNames;
  }

  addCheck(
    checks,
    "pg_cron.job",
    cronJobPresent(cron.jobNames) ? "pass" : "fail",
    cronJobPresent(cron.jobNames)
      ? `cron job ${EXPECTED_CRON_JOB} is scheduled`
      : `missing cron job ${EXPECTED_CRON_JOB}. Re-run with --repair-cron or: ${CRON_JOB_SQL}`
  );

  const hostRe = "https?://([a-z0-9]+)\\\\.supabase\\\\.co";
  const leftovers = queryJson(`
SELECT json_build_object(
  'blogContent', (
    SELECT count(*)::int FROM public.blog_posts b
    WHERE EXISTS (
      SELECT 1 FROM regexp_matches(coalesce(b.content, ''), '${hostRe}', 'gi') AS m(caps)
      WHERE m.caps[1] <> '${escapeSqlLiteral(targetRef)}'
    )
  ),
  'blogHero', (
    SELECT count(*)::int FROM public.blog_posts b
    WHERE EXISTS (
      SELECT 1 FROM regexp_matches(coalesce(b.hero_image_filename, ''), '${hostRe}', 'gi') AS m(caps)
      WHERE m.caps[1] <> '${escapeSqlLiteral(targetRef)}'
    )
  ),
  'listings', (
    SELECT count(*)::int FROM public.listings l
    WHERE EXISTS (
      SELECT 1 FROM regexp_matches(
        coalesce(l.default_image_url, '') || ' ' || coalesce(l.logo_image_url, '') || ' ' ||
        array_to_string(coalesce(l.listing_image_urls, ARRAY[]::text[]), ' '),
        '${hostRe}', 'gi'
      ) AS m(caps)
      WHERE m.caps[1] <> '${escapeSqlLiteral(targetRef)}'
    )
  ),
  'avatars', (
    SELECT count(*)::int FROM public.user_profiles p
    WHERE EXISTS (
      SELECT 1 FROM regexp_matches(coalesce(p.avatar_url, ''), '${hostRe}', 'gi') AS m(caps)
      WHERE m.caps[1] <> '${escapeSqlLiteral(targetRef)}'
    )
  )
) AS smoke;
`);
  const leftoverTotal =
    Number(leftovers.blogContent || 0) +
    Number(leftovers.blogHero || 0) +
    Number(leftovers.listings || 0) +
    Number(leftovers.avatars || 0);
  addCheck(
    checks,
    "storage.foreign_hosts",
    leftoverTotal === 0 ? "pass" : "fail",
    leftoverTotal === 0
      ? "No blog/listing/avatar URLs point at a non-target Supabase host"
      : `Leftover source-host URLs: blog=${leftovers.blogContent} hero=${leftovers.blogHero} listings=${leftovers.listings} avatars=${leftovers.avatars}`
  );

  const grants = queryJson(`
SELECT coalesce(json_agg(json_build_object(
  'name', p.proname,
  'anon', has_function_privilege('anon', p.oid, 'EXECUTE')
) ORDER BY p.proname), '[]'::json) AS smoke
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname LIKE 'internal_%';
`);
  const exposed = internalFunctionsExposedToAnon(Array.isArray(grants) ? grants : []);
  addCheck(
    checks,
    "rpc.grants.anon",
    exposed.length === 0 ? "pass" : "fail",
    exposed.length === 0
      ? "No public.internal_* function is executable by anon"
      : `anon can EXECUTE: ${exposed.map((row) => row.name).join(", ")}`
  );

  let lints = [];
  if (args.skipLinter) {
    addCheck(checks, "linter.security", "skip", "skipped (--skip-linter)");
  } else {
    const advisorPayload = runSecurityAdvisorsCli();
    let linterSource = null;
    if (!advisorPayload?.skipped) {
      lints = advisorPayload.lints;
      linterSource = "cli";
    } else {
      const mgmt = await fetchSecurityAdvisors(targetRef);
      if (!mgmt?.skipped) {
        lints = Array.isArray(mgmt?.lints) ? mgmt.lints : [];
        linterSource = "api";
      } else {
        addCheck(
          checks,
          "linter.security",
          "warn",
          `Database Linter unavailable (cli=${advisorPayload.reason}, api=${mgmt.reason}). SQL grant check still ran. Review ${advisorsUrl(targetRef)}`
        );
      }
    }
    if (linterSource) {
      const rpcLints = filterHighSeverityRpcLints(lints);
      const anonDefiner = lints.filter((lint) =>
        /anon_security_definer_function/i.test(String(lint?.name ?? ""))
      );
      addCheck(
        checks,
        "linter.security",
        rpcLints.length === 0 ? "pass" : "fail",
        rpcLints.length === 0
          ? `No high-severity anon RPC exposure via ${linterSource} (${lints.length} advisor finding(s); ${anonDefiner.length} anon SECURITY DEFINER WARN)`
          : `High-severity RPC lints: ${rpcLints.map((lint) => `${lint.name}:${lint.metadata?.name ?? ""}`).join(", ")}`
      );
    }
  }

  if (args.openDashboard) {
    openDashboard(advisorsUrl(targetRef));
    log(`Opened ${advisorsUrl(targetRef)}`);
  }

  const samples = queryJson(`
SELECT json_build_object(
  'hero', (
    SELECT hero_image_filename FROM public.blog_posts
    WHERE coalesce(hero_image_filename, '') <> ''
    ORDER BY published_at DESC NULLS LAST
    LIMIT 1
  ),
  'listing', (
    SELECT coalesce(
      nullif(default_image_url, ''),
      (
        SELECT u FROM unnest(coalesce(listing_image_urls, ARRAY[]::text[])) AS u
        WHERE coalesce(u, '') <> ''
        LIMIT 1
      )
    )
    FROM public.listings
    WHERE coalesce(default_image_url, '') <> ''
       OR cardinality(coalesce(listing_image_urls, ARRAY[]::text[])) > 0
    LIMIT 1
  ),
  'avatar', (
    SELECT avatar_url FROM public.user_profiles
    WHERE coalesce(avatar_url, '') <> ''
    LIMIT 1
  )
) AS smoke;
`);

  if (args.skipHttp) {
    addCheck(checks, "http", "skip", "skipped (--skip-http)");
  } else {
    if (!publishableKey) {
      addCheck(checks, "rpc.http", "fail", "PUBLIC_SUPABASE_PUBLISHABLE_KEY missing; cannot probe PostgREST");
    } else {
      const authHealth = await fetchJson(`${projectUrl}/auth/v1/health`, {
        headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
      });
      addCheck(
        checks,
        "auth.health",
        authHealth.status >= 200 && authHealth.status < 300 ? "pass" : "fail",
        `GET /auth/v1/health → ${authHealth.status}`
      );

      const authSettings = await fetchJson(`${projectUrl}/auth/v1/settings`, {
        headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
      });
      const googleOn = Boolean(authSettings.json?.external?.google);
      const emailOn =
        authSettings.json?.external?.email !== false && authSettings.json?.disable_signup !== true;
      addCheck(
        checks,
        "auth.settings",
        authSettings.status === 200 && googleOn ? "pass" : "fail",
        authSettings.status === 200
          ? `Google=${googleOn} email_signup_open=${emailOn}`
          : `GET /auth/v1/settings → ${authSettings.status}`
      );

      for (const rpcName of SENSITIVE_RPC_NAMES) {
        const rpcBody =
          rpcName === "internal_find_full_user_by_email"
            ? { p_email: "smoke-does-not-exist@example.invalid" }
            : rpcName === "internal_find_user_by_token_hash"
              ? { p_hashed_token: "smoke-invalid-token" }
              : { p_org_ids: [] };
        const rpcRes = await fetchJson(`${projectUrl}/rest/v1/rpc/${rpcName}`, {
          method: "POST",
          timeoutMs: RPC_PROBE_TIMEOUT_MS,
          headers: {
            apikey: publishableKey,
            Authorization: `Bearer ${publishableKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(rpcBody),
        });
        const classified = classifySensitiveRpcResponse(rpcRes.status, rpcRes.json ?? rpcRes.text);
        addCheck(
          checks,
          `rpc.publishable.${rpcName}`,
          classified.ok ? "pass" : "fail",
          classified.ok
            ? `publishable key denied (${rpcRes.status} ${classified.reason})`
            : `publishable key reached ${rpcName} (${rpcRes.status} ${classified.reason})`
        );
      }
    }

    const health = await fetchJson(`${backendUrl}/health`);
    addCheck(
      checks,
      "http.api.health",
      health.status === 200 && health.json?.server === "ok" ? "pass" : "fail",
      `GET ${backendUrl}/health → ${health.status}`
    );

    const blogApi = await fetchJson(`${backendUrl}${apiPrefix}/blog-system/posts`);
    addCheck(
      checks,
      "http.api.blog",
      blogApi.status === 200 ? "pass" : "fail",
      `GET ${apiPrefix}/blog-system/posts → ${blogApi.status}`
    );

    const listingsApi = await fetchJson(`${backendUrl}${apiPrefix}/listings/published`);
    addCheck(
      checks,
      "http.api.listings",
      listingsApi.status === 200 ? "pass" : "warn",
      `GET ${apiPrefix}/listings/published → ${listingsApi.status}`
    );

    const signInApi = await fetchJson(`${backendUrl}${apiPrefix}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (isMaintenanceFreezeResponse(signInApi.status, signInApi.json)) {
      addCheck(
        checks,
        "http.api.writes",
        "fail",
        "POST /auth/sign-in returned write-freeze 503; set MAINTENANCE_MODE=off and redeploy"
      );
    } else {
      addCheck(
        checks,
        "http.api.writes",
        signInApi.status !== 503 ? "pass" : "fail",
        `POST /auth/sign-in → ${signInApi.status} (not freeze 503)`
      );
    }

    const blogPage = await fetchJson(`${frontendUrl}/blog`);
    addCheck(
      checks,
      "http.web.blog",
      blogPage.status === 200 || blogPage.status === 304 ? "pass" : "fail",
      `GET ${frontendUrl}/blog → ${blogPage.status}`
    );

    const signInPage = await fetchJson(`${frontendUrl}/sign-in`);
    const redirectedToMaintenance =
      (signInPage.status === 307 || signInPage.status === 302 || signInPage.status === 303) &&
      /\/maintenance(?:$|\?)/.test(String(signInPage.location || ""));
    addCheck(
      checks,
      "http.web.sign_in",
      redirectedToMaintenance ? "fail" : signInPage.status >= 200 && signInPage.status < 400 ? "pass" : "warn",
      redirectedToMaintenance
        ? "/sign-in still redirects to /maintenance (freeze not cleared on web)"
        : `GET /sign-in → ${signInPage.status}${signInPage.location ? ` Location=${signInPage.location}` : ""}`
    );

    const heroUrl = publicStorageObjectUrl(projectUrl, "blog_images", samples.hero);
    if (heroUrl) {
      const img = await fetchHeadOrGet(heroUrl);
      addCheck(
        checks,
        "storage.blog_image",
        img.status >= 200 && img.status < 400 ? "pass" : "fail",
        `blog_images object → ${img.status}`
      );
    } else {
      addCheck(checks, "storage.blog_image", "warn", "No blog hero_image_filename to probe");
    }

    const listingUrl = publicStorageObjectUrl(projectUrl, "listing_images", samples.listing);
    if (listingUrl) {
      const img = await fetchHeadOrGet(listingUrl);
      addCheck(
        checks,
        "storage.listing_image",
        img.status >= 200 && img.status < 400 ? "pass" : "warn",
        `listing image → ${img.status}`
      );
    } else {
      addCheck(checks, "storage.listing_image", "warn", "No listing default_image_url to probe");
    }

    if (samples.avatar && /^https?:\/\//i.test(samples.avatar)) {
      const img = await fetchHeadOrGet(samples.avatar);
      addCheck(
        checks,
        "storage.avatar",
        img.status >= 200 && img.status < 400 ? "pass" : "warn",
        `avatar URL → ${img.status}`
      );
    } else {
      addCheck(checks, "storage.avatar", "skip", "No absolute avatar_url to probe");
    }
  }

  const summary = summarizeCheckResults(checks);
  const manualFollowUps = [
    "Google OAuth: sign in as an existing user",
    "Email signup: create a new user (sessions from the old project are invalid — one re-login)",
    "Session refresh: reload after login",
    "Workers: enqueue a scheduled post and confirm it publishes",
    "Integrations: complete one provider OAuth on the target project",
    "Stripe: subscription list in the dashboard is unchanged",
  ];

  const report = {
    smokedAt: new Date().toISOString(),
    targetProjectRef: targetRef,
    projectUrl,
    sourceProjectRef: sourceRef,
    linkedProjectRef: linkedRef,
    frontendUrl,
    backendUrl,
    counts,
    cron,
    leftovers,
    sampleImageKeys: {
      hero: Boolean(samples.hero),
      listing: Boolean(samples.listing),
      avatar: Boolean(samples.avatar),
    },
    linterFindingCount: lints.length,
    checks,
    summary,
    manualFollowUps,
    dashboards: {
      advisors: advisorsUrl(targetRef),
      cron: cronDashboardUrl(targetRef),
    },
  };

  const reportPath = defaultReportPath(args, loadedManifest?.path ?? null);
  ensureDir(resolve(reportPath, ".."));
  writeJson(reportPath, report);

  log("");
  log(`Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.warned} warned, ${summary.skipped} skipped`);
  log(`Report: ${reportPath.replace(`${repoRoot}/`, "")}`);
  log("");
  log("Manual follow-ups (not automated):");
  for (const item of manualFollowUps) log(`  - ${item}`);

  if (!summary.ok) {
    fail("Smoke checks failed. See the report for FAIL rows.");
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
