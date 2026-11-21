#!/usr/bin/env node
/**
 * Local-only: create or refresh a dev login (Supabase Auth + public.users + default workspace).
 * Optional platform super admin — same RPC as promote_platform_admin.mjs.
 *
 * Does not change app auth routes; uses service_role admin APIs only.
 *
 * Usage (from repo root):
 *   pnpm backend:db:bootstrap-local-dev-user
 *   pnpm backend:db:bootstrap-local-dev-user -- dev@example.com Dev123456!
 *   pnpm backend:db:bootstrap-local-dev-user -- --email you@example.com --password 'YourPass123!' --name 'Local Dev'
 *
 * Defaults: email dev@openquok.local, password Dev123456! (override with LOCAL_DEV_BOOTSTRAP_PASSWORD).
 *
 * Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const DEFAULT_EMAIL = "dev@openquok.local";
const DEFAULT_PASSWORD = "Dev123456!";
const DEFAULT_FULL_NAME = "Local Dev";

function loadEnvFile(relativePath) {
    const fullPath = path.join(backendRoot, relativePath);
    if (!fs.existsSync(fullPath)) return;
    const text = fs.readFileSync(fullPath, "utf8");
    for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function parseArgs(argv) {
    const out = {
        email: process.env.LOCAL_DEV_BOOTSTRAP_EMAIL?.trim() || DEFAULT_EMAIL,
        password: process.env.LOCAL_DEV_BOOTSTRAP_PASSWORD?.trim() || DEFAULT_PASSWORD,
        fullName: DEFAULT_FULL_NAME,
        superAdmin: true,
        allowRemote: false,
        help: false,
    };

    const positional = [];
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--") continue;
        if (arg === "-h" || arg === "--help") out.help = true;
        else if (arg === "--no-super-admin") out.superAdmin = false;
        else if (arg === "--super-admin") out.superAdmin = true;
        else if (arg === "--allow-remote") out.allowRemote = true;
        else if (arg === "--email" && argv[i + 1]) out.email = argv[++i];
        else if (arg === "--password" && argv[i + 1]) out.password = argv[++i];
        else if (arg === "--name" && argv[i + 1]) out.fullName = argv[++i];
        else if (arg.startsWith("-")) {
            console.error(`Unknown argument: ${arg}`);
            process.exit(1);
        } else positional.push(arg);
    }

    if (positional[0]) out.email = positional[0];
    if (positional[1]) out.password = positional[1];

    out.email = out.email.trim().toLowerCase();
    return out;
}

function isLocalSupabaseUrl(url) {
    try {
        const { hostname } = new URL(url);
        const h = hostname.toLowerCase();
        return (
            h === "localhost" ||
            h === "127.0.0.1" ||
            h === "host.docker.internal" ||
            h.endsWith(".localhost")
        );
    } catch {
        return false;
    }
}

async function findAuthUserIdByEmail(admin, email) {
    let page = 1;
    const perPage = 200;
    for (let guard = 0; guard < 50; guard++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) throw new Error(`listUsers failed: ${error.message}`);
        const users = data?.users ?? [];
        const hit = users.find((u) => (u.email ?? "").toLowerCase() === email);
        if (hit?.id) return hit.id;
        if (users.length < perPage) break;
        page += 1;
    }
    return null;
}

function printHelp() {
    console.log(`Usage:
  pnpm backend:db:bootstrap-local-dev-user
  pnpm backend:db:bootstrap-local-dev-user -- [email] [password]
  pnpm backend:db:bootstrap-local-dev-user -- --email you@example.com --password 'Pass123456!' --name 'You'

Options:
  --email <email>       Default: ${DEFAULT_EMAIL} or LOCAL_DEV_BOOTSTRAP_EMAIL
  --password <password> Default: ${DEFAULT_PASSWORD} or LOCAL_DEV_BOOTSTRAP_PASSWORD
  --name <full name>    Default: ${DEFAULT_FULL_NAME}
  --super-admin         Set is_super_admin (default)
  --no-super-admin      Skip platform admin promotion
  --allow-remote        Allow non-localhost PUBLIC_SUPABASE_URL (dangerous)
  -h, --help            Show this help
`);
}

loadEnvFile(".env.development.local");
loadEnvFile(".env");

const args = parseArgs(process.argv);
if (args.help) {
    printHelp();
    process.exit(0);
}

if (!args.email || args.password.length < 8) {
    console.error("Email required; password must be at least 8 characters.");
    process.exit(1);
}

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!supabaseUrl || !supabaseSecretKey) {
    console.error(
        "Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local"
    );
    process.exit(1);
}

if (!args.allowRemote && !isLocalSupabaseUrl(supabaseUrl)) {
    console.error(
        `Refusing to run against non-local Supabase URL (${supabaseUrl}). Use --allow-remote only if you intend to mutate a remote project.`
    );
    process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseSecretKey);

let authUserId = null;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
    user_metadata: { full_name: args.fullName },
});

if (createErr) {
    const msg = createErr.message ?? "";
    const duplicate =
        /already registered|User already registered|duplicate/i.test(msg) ||
        createErr.status === 422;
    if (!duplicate) {
        console.error(`Failed to create auth user: ${msg}`);
        process.exit(1);
    }
    authUserId = await findAuthUserIdByEmail(admin, args.email);
    if (!authUserId) {
        console.error(`Auth user exists for ${args.email} but could not be resolved: ${msg}`);
        process.exit(1);
    }
    const { error: updateErr } = await admin.auth.admin.updateUserById(authUserId, {
        password: args.password,
        email_confirm: true,
        user_metadata: { full_name: args.fullName },
    });
    if (updateErr) {
        console.error(`Failed to refresh existing auth user: ${updateErr.message}`);
        process.exit(1);
    }
    console.log(`Refreshed existing auth user ${args.email}.`);
} else {
    authUserId = created?.user?.id ?? null;
    if (!authUserId) {
        console.error("Auth user created but no id returned.");
        process.exit(1);
    }
    console.log(`Created auth user ${args.email}.`);
}

const { error: upsertErr } = await admin.rpc("internal_upsert_user_from_auth", {
    p_id: authUserId,
    p_auth_id: authUserId,
    p_email: args.email,
    p_full_name: args.fullName,
});
if (upsertErr) {
    console.error(`Failed to ensure public.users row: ${upsertErr.message}`);
    process.exit(1);
}

// Auth admin API may confirm auth.users without syncing public.users (upsert leaves default false).
// Sign-in checks public.users.is_email_verified when EMAIL_ENABLED=true.
const { error: verifyErr } = await admin.rpc("internal_update_email_verification", {
    p_user_id: authUserId,
    p_is_verified: true,
});
if (verifyErr) {
    console.error(`Failed to mark email verified: ${verifyErr.message}`);
    process.exit(1);
}

const { data: memberships, error: membErr } = await admin
    .from("user_organizations")
    .select("organization_id")
    .eq("user_id", authUserId)
    .limit(1);
if (membErr) {
    console.error(`Failed to check workspaces: ${membErr.message}`);
    process.exit(1);
}

if (!memberships?.length) {
    const { data: orgRows, error: orgErr } = await admin.rpc("internal_create_organization_with_owner", {
        p_user_id: authUserId,
        p_name: `${args.fullName}'s workspace`,
        p_description: "Local dev bootstrap",
    });
    if (orgErr) {
        console.error(`Failed to create default workspace: ${orgErr.message}`);
        process.exit(1);
    }
    const org = Array.isArray(orgRows) ? orgRows[0] : orgRows;
    console.log(`Created workspace: ${org?.name ?? "(unknown)"} (${org?.id ?? ""})`);
} else {
    console.log("Workspace membership already exists; skipped org creation.");
}

if (args.superAdmin) {
    const { error: promoteErr } = await admin.rpc("internal_set_is_super_admin", {
        p_email: args.email,
        p_is_super_admin: true,
    });
    if (promoteErr) {
        console.error(`Failed to promote platform admin: ${promoteErr.message}`);
        process.exit(1);
    }
    console.log("Platform super admin enabled.");
}

console.log("");
console.log("Sign in at your local web app with:");
console.log(`  email:    ${args.email}`);
console.log(`  password: ${args.password}`);
if (args.superAdmin) {
    console.log("Sign out and sign in again if the app cached roles before promotion.");
}