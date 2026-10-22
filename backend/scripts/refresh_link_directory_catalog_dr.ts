#!/usr/bin/env node
/**
 * Refresh build-backlinks catalog DR on `link_directory_sites` from DataForSEO
 * (via global `seo_domain_metric_snapshots` cache).
 *
 * Usage (from repo root):
 *   pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts
 *   pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts --force
 *   pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts --published-only
 *   pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts --slug=producthunt
 *   pnpm --filter ./backend exec tsx scripts/refresh_link_directory_catalog_dr.ts --dry-run
 *
 * Requires DATAFORSEO_API_KEY and directory SEO enabled in backend env.
 */
import { linkDirectoryService } from "../services/index.js";
import { logger } from "../utils/Logger.js";

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

    for (const arg of argv) {
        if (arg === "--force") force = true;
        else if (arg === "--published-only") publishedOnly = true;
        else if (arg === "--dry-run") dryRun = true;
        else if (arg.startsWith("--slug=")) slug = arg.slice("--slug=".length).trim() || undefined;
        else if (arg.startsWith("--site-id=")) siteId = arg.slice("--site-id=".length).trim() || undefined;
    }

    return { force, publishedOnly, dryRun, slug, siteId };
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
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

    if (!result.providerConfigured && result.updated === 0 && result.failed > 0) {
        process.exitCode = 1;
    }
}

main().catch((err) => {
    logger.error({
        msg: "Link directory catalog DR refresh failed",
        error: err instanceof Error ? err.message : String(err),
    });
    process.exitCode = 1;
});
