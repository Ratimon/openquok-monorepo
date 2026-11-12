#!/usr/bin/env node
/**
 * Probe X OAuth 1.0a request_token (same call as dashboard "Add X").
 *
 * Usage (from repo root):
 *   pnpm --filter backend run check:x-oauth
 *   pnpm --filter backend run check:x-oauth -- --env-file .env.production.local
 *
 * Exit 0 when X returns an authorize URL; exit 1 on failure (prints code/detail only).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TwitterApi } from "twitter-api-v2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

function loadEnvFile(relativePath) {
    const fullPath = path.isAbsolute(relativePath)
        ? relativePath
        : path.join(backendRoot, relativePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`Env file not found: ${fullPath}`);
        process.exit(1);
    }
    for (const line of fs.readFileSync(fullPath, "utf8").split("\n")) {
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
        process.env[key] = value;
    }
}

function parseArgs(argv) {
    const args = { envFile: ".env.development.local" };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--env-file" && argv[i + 1]) {
            args.envFile = argv[++i];
        }
    }
    return args;
}

function xCallbackUrl(frontendDomainUrl) {
    const raw = String(frontendDomainUrl ?? "").trim().replace(/\/+$/, "");
    let origin = raw;
    if (!/^https?:\/\//i.test(origin)) {
        origin = `https://${origin}`;
    }
    try {
        const u = new URL(origin);
        origin = u.origin;
    } catch {
        /* keep normalized string */
    }
    return `${origin}/integration/oauth/x`;
}

const { envFile } = parseArgs(process.argv.slice(2));
loadEnvFile(envFile);

const apiKey = (process.env.X_API_KEY ?? "").trim();
const apiSecret = (process.env.X_API_SECRET ?? "").trim();
const callback = xCallbackUrl(process.env.FRONTEND_DOMAIN_URL);

if (!apiKey || !apiSecret || apiKey.includes("SENSITIVE") || apiSecret.includes("SENSITIVE")) {
    console.error("Set X_API_KEY and X_API_SECRET in the env file (not redacted placeholders).");
    process.exit(1);
}

console.log(`Callback: ${callback}`);
console.log(`Consumer key length: ${apiKey.length}, secret length: ${apiSecret.length}`);

const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret });

try {
    const link = await client.generateAuthLink(callback, { linkMode: "authorize" });
    console.log("OK — X accepted request_token; authorize URL host:", new URL(link.url).host);
    process.exit(0);
} catch (err) {
    const errors = err?.data?.errors;
    const detail = err?.data?.detail;
    console.error("FAIL —", {
        code: err?.code,
        message: err?.message,
        detail,
        errors,
    });
    console.error(
        "If code is 32: consumer keys do not match this X app, or User authentication is not saved (Native App + Read and Write). Regenerate Consumer Keys and update deployment env."
    );
    process.exit(1);
}
