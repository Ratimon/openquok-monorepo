#!/usr/bin/env node
/**
 * Refresh build-backlinks catalog DR on `link_directory_sites` from DataForSEO
 * (via global `seo_domain_metric_snapshots` cache).
 *
 * Usage (from repo root):
 *   pnpm backend:db:refresh-link-directory-catalog-dr -- --slug=producthunt
 *   pnpm backend:db:refresh-link-directory-catalog-dr:prod -- --slug=skool
 *
 * Requires DATAFORSEO_API_KEY and DIRECTORY_SEO_ENABLED=true in the chosen env file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

function loadEnvFile(relativePath: string, { override = false }: { override?: boolean } = {}): boolean {
    const fullPath = path.join(backendRoot, relativePath);
    if (!fs.existsSync(fullPath)) return false;
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
        if (override || process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
    return true;
}

function bootstrapEnvFromArgv(argv: string[]): string {
    let envFile = ".env.development.local";
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--") continue;
        if (arg === "--env-file" && argv[i + 1]) {
            envFile = argv[++i].trim();
            continue;
        }
        if (arg.startsWith("--env-file=")) {
            envFile = arg.slice("--env-file=".length).trim();
        }
    }
    if (envFile.includes("production")) {
        process.env.NODE_ENV = "production";
    }
    const loaded = loadEnvFile(envFile, { override: true });
    if (!loaded && envFile !== ".env") {
        loadEnvFile(".env", { override: true });
    }
    if (!loaded && envFile !== ".env") {
        console.error(`Env file not found: backend/${envFile}`);
        process.exit(1);
    }
    return envFile;
}

function parseArgs(argv: string[]): {
    force: boolean;
    publishedOnly: boolean;
    dryRun: boolean;
    slug?: string;
    siteId?: string;
} {
    let force = false;
    let publishedOnly = false;
    let dryRun = false;
    let slug: string | undefined;
    let siteId: string | undefined;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--") continue;
        if (arg === "--env-file") {
            i += 1;
            continue;
        }
        if (arg.startsWith("--env-file=")) continue;
        if (arg === "--force") force = true;
        else if (arg === "--published-only") publishedOnly = true;
        else if (arg === "--dry-run") dryRun = true;
        else if (arg.startsWith("--slug=")) slug = arg.slice("--slug=".length).trim() || undefined;
        else if (arg.startsWith("--site-id=")) siteId = arg.slice("--site-id=".length).trim() || undefined;
        else if (arg === "--slug" && argv[i + 1]) slug = argv[++i].trim() || undefined;
    }

    return { force, publishedOnly, dryRun, slug, siteId };
}

async function shutdownAndExit(exitCode: number): Promise<never> {
    try {
        const { disconnectCacheConnection } = await import("../connections/cache/index.js");
        await disconnectCacheConnection();
    } catch {
        // Best-effort; process.exit still required if Redis never connected.
    }
    process.exit(exitCode);
}

async function main(): Promise<void> {
    const rawArgv = process.argv.slice(2);
    const envFile = bootstrapEnvFromArgv(rawArgv);
    const options = parseArgs(rawArgv);

    const { linkDirectoryService } = await import("../services/index.js");
    const { logger } = await import("../utils/Logger.js");

    logger.info({
        msg: "[Catalog DR] Starting",
        envFile: `backend/${envFile}`,
        nodeEnv: process.env.NODE_ENV ?? "development",
        slug: options.slug,
        force: options.force,
        dryRun: options.dryRun,
    });

    const result = await linkDirectoryService.refreshCatalogDomainRatings({
        force: options.force,
        publishedOnly: options.publishedOnly,
        dryRun: options.dryRun,
        slug: options.slug,
        siteId: options.siteId,
    });

    logger.info({
        msg: "Link directory catalog DR refresh finished",
        ...result,
        sites: result.sites.map((row) => ({
            slug: row.slug,
            domain: row.domain,
            domainRating: row.domainRating,
            skipped: row.skipped,
            error: row.error,
        })),
    });

    if (!result.providerConfigured && result.updated === 0) {
        console.error(
            "DataForSEO is not configured (DATAFORSEO_API_KEY empty or DIRECTORY_SEO_ENABLED=false) and no fresh snapshot exists in the database."
        );
        console.error(`Loaded env: backend/${envFile}`);
        console.error(
            "For production keys and Supabase, run: pnpm backend:db:refresh-link-directory-catalog-dr:prod -- --slug=…"
        );
        await shutdownAndExit(1);
    }

    const exitCode = result.failed > 0 ? 1 : 0;
    await shutdownAndExit(exitCode);
}

main().catch(async (err) => {
    console.error(
        "Link directory catalog DR refresh failed:",
        err instanceof Error ? err.message : String(err)
    );
    await shutdownAndExit(1);
});