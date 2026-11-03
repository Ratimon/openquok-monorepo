#!/usr/bin/env node
/**
 * Promote a signup user to platform admin (users.is_super_admin) via service_role RPC.
 * Use after local `supabase db reset` once you have signed up in the app.
 *
 * Usage (from repo root):
 *   pnpm backend:db:promote-platform-admin -- you@example.com
 *
 * Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env.development.local
 * (local default URL is often http://127.0.0.1:54321 — run `supabase status` for keys).
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

loadEnvFile(".env.development.local");
loadEnvFile(".env");

const emailArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
if (!emailArg) {
    console.error("Usage: pnpm backend:db:promote-platform-admin -- <email>");
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

const admin = createClient(supabaseUrl, supabaseSecretKey);
const { error } = await admin.rpc("internal_set_is_super_admin", {
    p_email: emailArg,
    p_is_super_admin: true,
});

if (error) {
    console.error(`Failed to promote platform admin: ${error.message}`);
    process.exit(1);
}

console.log(`Platform admin enabled for ${emailArg.trim().toLowerCase()}. Sign out and sign in in the app.`);
