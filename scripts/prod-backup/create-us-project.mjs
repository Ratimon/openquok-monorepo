#!/usr/bin/env node
/**
 * Phase B0 — create the cutover target Supabase project and mirror source auth settings.
 *
 * Auth config copy uses the Management API when SUPABASE_ACCESS_TOKEN is set
 * (Dashboard → Account → Access Tokens). Without it, the script still creates the
 * project, enables pg_cron, and records API keys; configure Auth in the dashboard.
 *
 * Writes credentials to .backups/migration/project.json (gitignored).
 *
 * Usage:
 *   node scripts/prod-backup/create-us-project.mjs
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/prod-backup/create-us-project.mjs
 *   node scripts/prod-backup/create-us-project.mjs --project-ref <existing-ref>
 *
 * Required env (create only):
 *   SUPABASE_ORG_ID              Supabase organization id (Dashboard → Organization settings)
 *   SUPABASE_TARGET_REGION       e.g. us-west-1
 *   SUPABASE_TARGET_PROJECT_NAME e.g. my-app-prod-us
 *
 * Optional env:
 *   SUPABASE_SOURCE_PROJECT_REF  Defaults to PUBLIC_SUPABASE_URL in backend/.env.production.local
 *   SUPABASE_TARGET_POOLER_HOST  Session pooler host (Dashboard → Connect); recorded in manifest
 *   SUPABASE_AUTH_INCLUDE_BACKEND_WILDCARD=1  Also add BACKEND_DOMAIN_URL/** to redirect URLs
 */

import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_ENV_FILE,
  MIGRATION_OUTPUT_DIR,
  resolveSourceProjectRef,
} from "./constants.mjs";
import { ensureDir, fail, loadBackendProdEnv, log, repoRoot, writeJson } from "./lib.mjs";

const API_BASE = "https://api.supabase.com/v1";
const COMPUTE_SIZE = "micro";
const BACKEND_DIR = join(repoRoot, "backend");
const SUPABASE_CLI = ["--yes", "supabase@2.117.0"];

const AUTH_COPY_KEYS = [
  "disable_signup",
  "external_email_enabled",
  "external_google_enabled",
  "external_google_client_id",
  "external_google_secret",
  "external_google_skip_nonce_check",
  "mailer_autoconfirm",
  "mailer_secure_email_change_enabled",
  "mailer_otp_exp",
  "mailer_otp_length",
  "mailer_subjects_confirmation",
  "mailer_subjects_email_change",
  "mailer_subjects_invite",
  "mailer_subjects_magic_link",
  "mailer_subjects_reauthentication",
  "mailer_subjects_recovery",
  "mailer_templates_confirmation_content",
  "mailer_templates_email_change_content",
  "mailer_templates_invite_content",
  "mailer_templates_magic_link_content",
  "mailer_templates_reauthentication_content",
  "mailer_templates_recovery_content",
  "smtp_admin_email",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_sender_name",
  "smtp_max_frequency",
  "jwt_exp",
  "refresh_token_rotation_enabled",
  "security_refresh_token_reuse_interval",
  "security_update_password_require_reauthentication",
  "security_update_password_require_current_password",
  "mfa_totp_enroll_enabled",
  "mfa_totp_verify_enabled",
];

function supabaseCliEnv() {
  const { SUPABASE_ACCESS_TOKEN: _pat, ...env } = process.env;
  return { ...env, NPM_CONFIG_CACHE: "/tmp/npm-cache-openquok" };
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`Missing required env: ${name}`);
  return value;
}

function loadAuthUrlsFromEnv(envFile) {
  const env = loadBackendProdEnv(envFile);
  const siteUrl = (env.FRONTEND_DOMAIN_URL || "").replace(/\/$/, "");
  const backend = (env.BACKEND_DOMAIN_URL || "").replace(/\/$/, "");
  const apiPrefix = (env.API_PREFIX || "/api/v1").replace(/\/$/, "");
  if (!siteUrl) {
    fail(`FRONTEND_DOMAIN_URL is required in ${envFile} for Auth site URL`);
  }
  if (!backend) {
    fail(`BACKEND_DOMAIN_URL is required in ${envFile} for OAuth redirect URLs`);
  }
  const redirectUrls = [`${backend}${apiPrefix}/auth/oauth/google/callback`];
  if (process.env.SUPABASE_AUTH_INCLUDE_BACKEND_WILDCARD === "1") {
    redirectUrls.push(`${backend}/**`);
  }
  return { siteUrl, redirectUrls };
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    projectRef: null,
    skipAuth: false,
    envFile: DEFAULT_ENV_FILE,
    outputDir: join(repoRoot, MIGRATION_OUTPUT_DIR),
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--project-ref" && argv[i + 1]) args.projectRef = argv[++i];
    else if (arg === "--skip-auth") args.skipAuth = true;
    else if (arg === "--env-file" && argv[i + 1]) args.envFile = argv[++i];
    else if (arg === "--output-dir" && argv[i + 1]) {
      args.outputDir = join(repoRoot, argv[++i]);
    } else if (arg === "--help" || arg === "-h") return { help: true };
    else fail(`Unknown argument: ${arg}`);
  }
  return args;
}

function printHelp() {
  log(`Usage: node scripts/prod-backup/create-us-project.mjs [options]

Creates the cutover target Supabase project, enables pg_cron, copies source auth when
SUPABASE_ACCESS_TOKEN is set, and records API keys in ${MIGRATION_OUTPUT_DIR}/project.json.

Options:
  --dry-run           Print planned actions without creating resources
  --project-ref <ref> Configure an existing target project instead of creating one
  --skip-auth         Skip auth configuration (project/cron/keys only)
  --env-file <path>   Backend prod env file (default: ${DEFAULT_ENV_FILE})
  --output-dir <path> Manifest directory under repo root (default: ${MIGRATION_OUTPUT_DIR})
  -h, --help          Show this help

Required env (create only):
  SUPABASE_ORG_ID
  SUPABASE_TARGET_REGION
  SUPABASE_TARGET_PROJECT_NAME

Optional env:
  SUPABASE_SOURCE_PROJECT_REF
  SUPABASE_TARGET_POOLER_HOST
  SUPABASE_AUTH_INCLUDE_BACKEND_WILDCARD=1
`);
}

function accessToken() {
  return process.env.SUPABASE_ACCESS_TOKEN?.trim() || null;
}

async function mgmt(path, { method = "GET", body } = {}) {
  const token = accessToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    fail(`Management API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

function runSupabase(args, { cwd = BACKEND_DIR } = {}) {
  const result = spawnSync("npx", [...SUPABASE_CLI, ...args], {
    cwd,
    encoding: "utf8",
    env: supabaseCliEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    fail(result.stderr || result.stdout || `supabase ${args.join(" ")} failed`);
  }
  return (result.stdout || "").trim();
}

function parseJsonOutput(stdout) {
  const trimmed = stdout.trim();
  const jsonStart = trimmed.search(/[\[{]/);
  const payload = jsonStart >= 0 ? trimmed.slice(jsonStart) : trimmed;
  try {
    return JSON.parse(payload);
  } catch {
    fail(`Expected JSON from supabase CLI, got:\n${stdout}`);
  }
}

function generateDbPassword() {
  return randomBytes(24).toString("base64url");
}

function findProjectByName(name, region) {
  const projects = parseJsonOutput(runSupabase(["projects", "list", "--output", "json"]));
  return projects.find((p) => p.name === name && p.region === region);
}

function createProject({ name, orgId, region, dbPassword }) {
  const existing = findProjectByName(name, region);
  if (existing?.ref) {
    log(`Project ${name} already exists (${existing.ref}); reusing.`);
    return { projectRef: existing.ref, created: false, dbPassword: null };
  }

  const stdout = runSupabase([
    "projects",
    "create",
    name,
    "--org-id",
    orgId,
    "--region",
    region,
    "--size",
    COMPUTE_SIZE,
    "--db-password",
    dbPassword,
    "--output",
    "json",
  ]);
  const project = parseJsonOutput(stdout);
  const projectRef = project.ref ?? project.id;
  if (!projectRef) {
    fail(`Could not parse project ref from create output:\n${stdout}`);
  }
  return { projectRef, created: true, dbPassword };
}

async function waitForHealthy(projectRef, { timeoutMs = 15 * 60_000 } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const projects = parseJsonOutput(runSupabase(["projects", "list", "--output", "json"]));
    const project = projects.find((p) => p.ref === projectRef || p.id === projectRef);
    if (project?.status === "ACTIVE_HEALTHY") {
      return project;
    }
    log(
      `Waiting for ${projectRef} to become ACTIVE_HEALTHY (current: ${project?.status ?? "unknown"})...`
    );
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
  fail(`Timed out waiting for project ${projectRef} to become ACTIVE_HEALTHY`);
}

function pickAuthFields(source, { siteUrl, redirectUrls }) {
  const patch = {};
  for (const key of AUTH_COPY_KEYS) {
    if (source[key] !== undefined && source[key] !== null) {
      patch[key] = source[key];
    }
  }
  patch.site_url = siteUrl;
  patch.uri_allow_list = redirectUrls.join(",");
  patch.password_hibp_enabled = source.password_hibp_enabled ?? true;
  return patch;
}

async function configureAuthViaApi(projectRef, sourceProjectRef, authUrls) {
  const sourceAuth = await mgmt(`/projects/${sourceProjectRef}/config/auth`);
  if (!sourceAuth) return false;
  const patch = pickAuthFields(sourceAuth, authUrls);
  await mgmt(`/projects/${projectRef}/config/auth`, { method: "PATCH", body: patch });
  return true;
}

function configureAuthViaConfigPush(projectRef, authUrls) {
  const tempRoot = mkdtempSync(join(tmpdir(), "openquok-target-config-"));
  const configDir = join(tempRoot, "supabase");
  const configPath = join(configDir, "config.toml");
  try {
    runSupabase(["init", "--force"], { cwd: tempRoot });
    const redirectLines = authUrls.redirectUrls.map((url) => `  "${url}",`).join("\n");
    writeFileSync(
      configPath,
      readFileSync(join(BACKEND_DIR, "supabase/config.toml"), "utf8")
        .replace(/site_url = ".*"/, `site_url = "${authUrls.siteUrl}"`)
        .replace(
          /additional_redirect_urls = \[[\s\S]*?\]/,
          `additional_redirect_urls = [\n${redirectLines}\n]`
        ),
      "utf8"
    );
    runSupabase(["config", "push", "--project-ref", projectRef, "--yes"], { cwd: tempRoot });
    return true;
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function ensureLinkedTo(projectRef) {
  const projects = parseJsonOutput(runSupabase(["projects", "list", "--output", "json"]));
  const linked = projects.find((p) => p.linked);
  if (linked?.ref === projectRef) return;
  runSupabase(["link", "--project-ref", projectRef, "--yes"]);
}

function enablePgCron(projectRef) {
  ensureLinkedTo(projectRef);
  const check = runSupabase([
    "db",
    "query",
    "--linked",
    "select extname from pg_extension where extname = 'pg_cron';",
  ]);
  if (check.includes("pg_cron")) {
    log("pg_cron already enabled.");
    return;
  }
  const sql = [
    "create extension if not exists pg_cron with schema pg_catalog;",
    "grant usage on schema cron to postgres;",
    "grant all privileges on all tables in schema cron to postgres;",
  ].join("\n");
  runSupabase(["db", "query", "--linked", sql]);
}

function fetchApiKeys(projectRef) {
  const stdout = runSupabase([
    "projects",
    "api-keys",
    "--project-ref",
    projectRef,
    "--reveal",
    "--output",
    "json",
  ]);
  const keys = parseJsonOutput(stdout);
  const publishable = keys.find((k) => k.type === "publishable" || k.name === "anon");
  const secret = keys.find((k) => k.type === "secret" || k.name === "service_role");
  if (!publishable?.api_key || !secret?.api_key) {
    fail("Could not resolve publishable/secret API keys from supabase projects api-keys");
  }
  return {
    publishableKey: publishable.api_key,
    secretKey: secret.api_key,
  };
}

function resolveTargetPoolerHost(region) {
  const explicit = process.env.SUPABASE_TARGET_POOLER_HOST?.trim();
  if (explicit) return explicit;
  log(
    `SUPABASE_TARGET_POOLER_HOST not set — pooler host omitted from manifest. Copy Session pooler host from Dashboard → Connect (${region}).`
  );
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const authUrls = loadAuthUrlsFromEnv(args.envFile);
  const sourceProjectRef = resolveSourceProjectRef({ envFile: args.envFile });
  const outputFile = join(args.outputDir, "project.json");

  const orgId = process.env.SUPABASE_ORG_ID?.trim() || null;
  const region = process.env.SUPABASE_TARGET_REGION?.trim() || null;
  const projectName = process.env.SUPABASE_TARGET_PROJECT_NAME?.trim() || null;

  if (args.dryRun) {
    log(`[dry-run] Source project ref: ${sourceProjectRef}`);
    log(
      `[dry-run] Would create or reuse target project (name=${projectName ?? "<unset>"}, region=${region ?? "<unset>"})`
    );
    log(`[dry-run] Configure auth, enable pg_cron, fetch API keys, write ${outputFile}`);
    return;
  }

  let projectRef = args.projectRef;
  let dbPassword = null;
  let created = false;
  let targetRegion = region;

  if (!projectRef) {
    if (!orgId || !region || !projectName) {
      fail(
        "Creating a project requires SUPABASE_ORG_ID, SUPABASE_TARGET_REGION, and SUPABASE_TARGET_PROJECT_NAME (or pass --project-ref)."
      );
    }
    dbPassword = generateDbPassword();
    log(`Creating project ${projectName} in ${region}...`);
    const result = createProject({ name: projectName, orgId, region, dbPassword });
    projectRef = result.projectRef;
    created = result.created;
    dbPassword = result.dbPassword ?? dbPassword;
    targetRegion = region;
    log(`${created ? "Created" : "Reusing"} project ref: ${projectRef}`);
  }

  const healthyProject = await waitForHealthy(projectRef);
  targetRegion = targetRegion || healthyProject?.region || region;

  let authConfigured = false;
  let authMethod = null;
  ensureDir(args.outputDir);

  if (!args.skipAuth) {
    log("Configuring auth...");
    if (accessToken()) {
      authConfigured = await configureAuthViaApi(projectRef, sourceProjectRef, authUrls);
      authMethod = authConfigured ? "management-api" : null;
    }
    if (!authConfigured) {
      log("SUPABASE_ACCESS_TOKEN not set — pushing site URL and redirect URLs via config push only.");
      log("Copy Google client secret and email settings from the source project in the dashboard if OAuth/email fail.");
      configureAuthViaConfigPush(projectRef, authUrls);
      authMethod = "config-push-partial";
      authConfigured = true;
    }
  }

  log("Enabling pg_cron...");
  enablePgCron(projectRef);

  log("Fetching API keys...");
  const { publishableKey, secretKey } = fetchApiKeys(projectRef);

  const projectUrl = `https://${projectRef}.supabase.co`;
  const poolerHost = targetRegion ? resolveTargetPoolerHost(targetRegion) : null;
  const manifest = {
    phase: "B0",
    createdAt: new Date().toISOString(),
    created,
    name: projectName || healthyProject?.name || null,
    region: targetRegion,
    computeSize: COMPUTE_SIZE,
    sourceProjectRef,
    projectRef,
    projectUrl,
    poolerHost,
    siteUrl: authUrls.siteUrl,
    redirectUrls: authUrls.redirectUrls,
    googleOAuthCallback: `${projectUrl}/auth/v1/callback`,
    authConfigured,
    authMethod,
    apiKeys: {
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      SUPABASE_SECRET_KEY: secretKey,
    },
    env: {
      PUBLIC_SUPABASE_URL: projectUrl,
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      SUPABASE_SECRET_KEY: secretKey,
      VITE_PUBLIC_SUPABASE_URL: projectUrl,
      VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    },
    pgCronEnabled: true,
    cliLinkedProjectRef: projectRef,
    manualFollowUps: [
      `Add Google OAuth redirect URI: ${projectUrl}/auth/v1/callback`,
      "Keep source project callback until decommission (B5)",
      "Do not flip production env until cutover (B3)",
    ],
  };
  if (authMethod === "config-push-partial") {
    manifest.authConfigured = "partial";
    manifest.manualFollowUps.unshift(
      "Dashboard → Auth → Providers → Google: enable and paste client secret from source project",
      "Dashboard → Auth → Settings: enable leaked password protection if required",
      `Optional: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/prod-backup/create-us-project.mjs --project-ref <target-ref>`,
    );
  }
  if (!poolerHost) {
    manifest.manualFollowUps.push(
      "Set SUPABASE_TARGET_POOLER_HOST from Dashboard → Connect and update project.json if needed"
    );
  }
  if (dbPassword) {
    manifest.databasePassword = dbPassword;
    if (poolerHost) {
      manifest.sessionPoolerUrlTemplate = `postgresql://postgres.${projectRef}:[PASSWORD]@${poolerHost}:5432/postgres`;
    }
  }

  writeJson(outputFile, manifest);
  log(`Wrote ${outputFile}`);
  log(`Project URL: ${projectUrl}`);
  log(`Google callback to add in Google Cloud Console: ${manifest.googleOAuthCallback}`);
  log("Production env is unchanged until cutover (B3).");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
