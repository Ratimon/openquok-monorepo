#!/usr/bin/env node
/**
 * Local-only: set public.users.is_email_verified = true (service_role RPC).
 * Use when auth.admin.createUser left the app row unverified (EMAIL_ENABLED=true locally).
 *
 * Usage (from repo root):
 *   pnpm backend:db:verify-local-dev-user-email -- dev@openquok.local
 *
 * Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

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

loadEnvFile(".env.development.local");
loadEnvFile(".env");

const emailArg = process.argv
    .slice(2)
    .find((a) => a !== "--" && !a.startsWith("-"));
const allowRemote = process.argv.includes("--allow-remote");

if (!emailArg) {
    console.error("Usage: pnpm backend:db:verify-local-dev-user-email -- <email>");
    process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!supabaseUrl || !supabaseSecretKey) {
    console.error(
        "Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local"
    );
    process.exit(1);
}

if (!allowRemote && !isLocalSupabaseUrl(supabaseUrl)) {
    console.error(
        `Refusing non-local Supabase URL (${supabaseUrl}). Pass --allow-remote only if intentional.`
    );
    process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseSecretKey);

const { data: userRow, error: findErr } = await admin
    .from("users")
    .select("id, is_email_verified")
    .eq("email", email)
    .maybeSingle();

if (findErr) {
    console.error(`Failed to load user: ${findErr.message}`);
    process.exit(1);
}
if (!userRow?.id) {
    console.error(`No public.users row for ${email}. Run bootstrap or sign up first.`);
    process.exit(1);
}

if (userRow.is_email_verified === true) {
    console.log(`Email already verified for ${email}.`);
    process.exit(0);
}

const { error: verifyErr } = await admin.rpc("internal_update_email_verification", {
    p_user_id: userRow.id,
    p_is_verified: true,
});

if (verifyErr) {
    console.error(`Failed to verify email: ${verifyErr.message}`);
    process.exit(1);
}

console.log(`Email verified for ${email}. Sign in again in the app.`);