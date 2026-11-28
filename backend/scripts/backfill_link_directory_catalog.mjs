#!/usr/bin/env node
/**
 * Backfill link directory hub catalog (sites, opportunities, tag associations) from JSON (service_role),
 * then wire auto_launch_destinations.link_directory_opportunity_id for matching provider slugs.
 *
 * Usage (from repo root):
 *   pnpm backend:db:backfill-link-directory-catalog
 *   pnpm backend:db:backfill-link-directory-catalog:prod
 *
 * Options:
 *   --env-file <path>     Relative to backend/ (default: .env.development.local)
 *   --catalog <path>      JSON catalog (default: scripts/backfill_link_directory_catalog.catalog.json)
 *   --dry-run             Print actions only; no writes
 *   --force               Overwrite existing catalog rows and replace tag associations
 *   --list-missing        List catalog slugs missing from link_directory_sites (no writes)
 *   --slug <slug>         Only this site slug (repeatable)
 *   --help
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const DEFAULT_CATALOG = path.join(__dirname, "backfill_link_directory_catalog.catalog.json");

function loadEnvFile(relativePath) {
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
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
    return true;
}

function parseArgs(argv) {
    const out = {
        envFile: ".env.development.local",
        catalog: DEFAULT_CATALOG,
        dryRun: false,
        force: false,
        listMissing: false,
        slugs: [],
        help: false,
    };

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--") continue;
        if (arg === "-h" || arg === "--help") out.help = true;
        else if (arg === "--dry-run") out.dryRun = true;
        else if (arg === "--force") out.force = true;
        else if (arg === "--list-missing") out.listMissing = true;
        else if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
        else if (arg === "--catalog" && argv[i + 1]) out.catalog = argv[++i];
        else if (arg === "--slug" && argv[i + 1]) out.slugs.push(argv[++i]);
        else {
            console.error(`Unknown argument: ${arg}`);
            process.exit(1);
        }
    }

    return out;
}

function printHelp() {
    console.log(`Usage: pnpm backend:db:backfill-link-directory-catalog [-- options]

Backfill link_directory_sites / opportunities from backfill_link_directory_catalog.catalog.json.

Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/<env-file>.

  --env-file <path>   Default: .env.development.local (prod: .env.production.local)
  --catalog <path>    Override catalog JSON
  --dry-run           No database writes
  --force             Replace existing rows and tag associations
  --list-missing      Show catalog site slugs not present in the database
  --slug <slug>       Limit to one site slug (repeat flag)

After hub upserts, matching auto_launch_destinations rows are updated when
auto_launch_provider_slug matches a catalog opportunity (fixes null
link_directory_opportunity_id after local db reset).`);
}

/** Provider slugs from catalog entries being processed this run. */
function collectAutoLaunchProviderSlugs(entries, siteSlugs) {
    const slugs = new Set();
    for (const entrySlug of siteSlugs) {
        const opportunities = entries[entrySlug]?.opportunities;
        if (!Array.isArray(opportunities)) continue;
        for (const opp of opportunities) {
            if (!opp?.auto_launch_enabled) continue;
            const providerSlug =
                typeof opp.auto_launch_provider_slug === "string"
                    ? opp.auto_launch_provider_slug.trim()
                    : "";
            if (providerSlug) slugs.add(providerSlug);
        }
    }
    return [...slugs];
}

/**
 * Wire auto_launch_destinations.link_directory_opportunity_id from hub opportunities
 * (same join as destination seed SQL, runnable after catalog-only sites land).
 */
async function relinkAutoLaunchDestinations(admin, providerSlugs, { dryRun }) {
    const relinkSummary = { linked: 0, unchanged: 0, missingDestination: 0, missingOpportunity: 0, errors: 0 };

    if (providerSlugs.length === 0) {
        return relinkSummary;
    }

    const { data: opportunities, error: oppError } = await admin
        .from("link_directory_opportunities")
        .select("id, auto_launch_provider_slug")
        .eq("auto_launch_enabled", true)
        .in("auto_launch_provider_slug", providerSlugs);

    if (oppError) {
        throw new Error(`auto-launch relink opportunities: ${oppError.message}`);
    }

    const opportunityIdByProviderSlug = new Map();
    for (const row of opportunities ?? []) {
        const slug = row.auto_launch_provider_slug;
        if (typeof slug === "string" && slug) {
            opportunityIdByProviderSlug.set(slug, row.id);
        }
    }

    for (const providerSlug of providerSlugs) {
        const opportunityId = opportunityIdByProviderSlug.get(providerSlug);
        if (!opportunityId) {
            relinkSummary.missingOpportunity += 1;
            console.warn(`RELINK SKIP (no opportunity): ${providerSlug}`);
            continue;
        }

        const { data: destination, error: destError } = await admin
            .from("auto_launch_destinations")
            .select("id, provider_slug, link_directory_opportunity_id")
            .eq("provider_slug", providerSlug)
            .maybeSingle();

        if (destError) {
            console.error(`RELINK FAILED lookup ${providerSlug}: ${destError.message}`);
            relinkSummary.errors += 1;
            continue;
        }

        if (!destination) {
            relinkSummary.missingDestination += 1;
            console.warn(`RELINK SKIP (no destination): ${providerSlug}`);
            continue;
        }

        if (destination.link_directory_opportunity_id === opportunityId) {
            relinkSummary.unchanged += 1;
            continue;
        }

        if (dryRun) {
            relinkSummary.linked += 1;
            console.log(
                `DRY-RUN RELINK DESTINATION: ${providerSlug} → opportunity ${opportunityId}`
            );
            continue;
        }

        const { error: updateError } = await admin
            .from("auto_launch_destinations")
            .update({
                link_directory_opportunity_id: opportunityId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", destination.id);

        if (updateError) {
            console.error(`RELINK FAILED update ${providerSlug}: ${updateError.message}`);
            relinkSummary.errors += 1;
            continue;
        }

        relinkSummary.linked += 1;
        console.log(`RELINKED DESTINATION: ${providerSlug} → opportunity ${opportunityId}`);
    }

    return relinkSummary;
}

function requireString(value, label) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${label} is required`);
    }
    return value.trim();
}

function isSiteEditoriallyPopulated(row) {
    if (!row) return false;
    const short =
        typeof row.short_description === "string" ? row.short_description.trim() : "";
    const long =
        typeof row.long_description === "string" ? row.long_description.trim() : "";
    return Boolean(short || long);
}

function isOpportunityEditoriallyPopulated(row) {
    if (!row) return false;
    const description =
        typeof row.description === "string" ? row.description.trim() : "";
    const steps = row.steps;
    const hasSteps = Array.isArray(steps) && steps.length > 0;
    return Boolean(description || hasSteps);
}

function buildSiteRow(site, categoryId) {
    const now = new Date().toISOString();
    return {
        id: requireString(site.id, "site.id"),
        slug: requireString(site.slug, "site.slug"),
        title: requireString(site.title, "site.title"),
        site_url: requireString(site.site_url, "site.site_url"),
        logo_url: site.logo_url ?? null,
        short_description: site.short_description ?? null,
        long_description: site.long_description ?? null,
        domain_rating: site.domain_rating ?? null,
        monthly_visits: site.monthly_visits ?? null,
        metrics_source: site.metrics_source ?? null,
        metrics_updated_at:
            site.domain_rating != null || site.monthly_visits != null ? now : null,
        category_id: categoryId,
        is_openquok_auth_supported: Boolean(site.is_openquok_auth_supported),
        openquok_channel_slug: site.openquok_channel_slug ?? null,
        is_admin_published: Boolean(site.is_admin_published),
        sort_order: typeof site.sort_order === "number" ? site.sort_order : 0,
        tag_slugs: Array.isArray(site.tag_slugs) ? site.tag_slugs : [],
    };
}

function buildOpportunityRow(opp, siteId, opportunityTypeId) {
    return {
        id: requireString(opp.id, "opportunity.id"),
        site_id: siteId,
        slug: requireString(opp.slug, "opportunity.slug"),
        title: requireString(opp.title, "opportunity.title"),
        opportunity_type_id: opportunityTypeId,
        effort: opp.effort ?? "medium",
        approval_mode: opp.approval_mode ?? "manual_review",
        approval_time_hint: opp.approval_time_hint ?? null,
        dofollow: opp.dofollow ?? "unknown",
        cost_tier: opp.cost_tier ?? "free",
        cost_note: opp.cost_note ?? null,
        description: opp.description ?? null,
        steps: Array.isArray(opp.steps) ? opp.steps : [],
        openquok_cta_kind: opp.openquok_cta_kind ?? "none",
        openquok_channel_slug: opp.openquok_channel_slug ?? null,
        openquok_plug_name: opp.openquok_plug_name ?? null,
        cta_href: opp.cta_href ?? null,
        cta_label: opp.cta_label ?? null,
        sort_order: typeof opp.sort_order === "number" ? opp.sort_order : 0,
        is_admin_published: Boolean(opp.is_admin_published),
        auto_launch_enabled: Boolean(opp.auto_launch_enabled),
        auto_launch_provider_slug: opp.auto_launch_provider_slug ?? null,
    };
}

async function loadSlugMap(admin, table, slugColumn = "slug") {
    const { data, error } = await admin.from(table).select(`id, ${slugColumn}`);
    if (error) throw new Error(`${table}: ${error.message}`);
    const map = new Map();
    for (const row of data ?? []) {
        const slug = row[slugColumn];
        if (typeof slug === "string" && slug) {
            map.set(slug, row.id);
        }
    }
    return map;
}

async function syncTagAssociations(admin, siteId, tagIds, { dryRun, replace }) {
    if (replace && !dryRun) {
        const { error: delError } = await admin
            .from("link_directory_site_tags_association")
            .delete()
            .eq("site_id", siteId);
        if (delError) throw new Error(`tag delete: ${delError.message}`);
    }

    if (tagIds.length === 0) return;

    const rows = tagIds.map((link_directory_tag_id) => ({
        site_id: siteId,
        link_directory_tag_id,
    }));

    if (dryRun) return;

    const { error } = await admin
        .from("link_directory_site_tags_association")
        .upsert(rows, { onConflict: "site_id,link_directory_tag_id" });
    if (error) throw new Error(`tag upsert: ${error.message}`);
}

const args = parseArgs(process.argv);
if (args.help) {
    printHelp();
    process.exit(0);
}

if (!loadEnvFile(args.envFile) && args.envFile !== ".env") {
    loadEnvFile(".env");
}

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!supabaseUrl || !supabaseSecretKey) {
    console.error(
        `Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/${args.envFile}`
    );
    process.exit(1);
}

const catalogPath = path.isAbsolute(args.catalog)
    ? args.catalog
    : path.resolve(backendRoot, args.catalog);

if (!fs.existsSync(catalogPath)) {
    console.error(`Catalog not found: ${catalogPath}`);
    process.exit(1);
}

/** @type {{ version?: number; entries: Record<string, { site: object; opportunities?: object[] }> }} */
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const entries = catalog.entries ?? {};

const admin = createClient(supabaseUrl, supabaseSecretKey);

let slugsToRun = Object.keys(entries);
if (args.slugs.length > 0) {
    slugsToRun = args.slugs.filter((s) => {
        if (!(s in entries)) {
            console.warn(`Slug not in catalog (skipped): ${s}`);
            return false;
        }
        return true;
    });
}

if (args.listMissing) {
    const { data, error } = await admin
        .from("link_directory_sites")
        .select("slug")
        .in("slug", slugsToRun.length ? slugsToRun : Object.keys(entries));

    if (error) {
        console.error(error.message);
        process.exit(1);
    }

    const inDb = new Set((data ?? []).map((r) => r.slug));
    const catalogSlugs = slugsToRun.length ? slugsToRun : Object.keys(entries);
    const missing = catalogSlugs.filter((slug) => !inDb.has(slug));

    console.log(`Catalog sites missing from link_directory_sites: ${missing.length}`);
    for (const slug of missing) {
        console.log(`  ${slug}`);
    }
    process.exit(0);
}

if (slugsToRun.length === 0) {
    console.error("No slugs to process.");
    process.exit(1);
}

let categoryBySlug;
let opportunityTypeBySlug;
let tagBySlug;

try {
    categoryBySlug = await loadSlugMap(admin, "link_directory_categories");
    opportunityTypeBySlug = await loadSlugMap(admin, "link_directory_opportunity_types");
    tagBySlug = await loadSlugMap(admin, "link_directory_tags");
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

const summary = {
    sitesInserted: 0,
    sitesUpdated: 0,
    sitesSkipped: 0,
    oppsInserted: 0,
    oppsUpdated: 0,
    oppsSkipped: 0,
    errors: 0,
};

for (const entrySlug of slugsToRun) {
    const entry = entries[entrySlug];
    if (!entry?.site) {
        console.error(`BAD CATALOG ${entrySlug}: missing site object`);
        summary.errors += 1;
        continue;
    }

    const site = entry.site;
    const opportunities = Array.isArray(entry.opportunities) ? entry.opportunities : [];

    let categoryId;
    try {
        const categorySlug = requireString(site.category_slug, "site.category_slug");
        categoryId = categoryBySlug.get(categorySlug);
        if (!categoryId) {
            throw new Error(`unknown category_slug "${categorySlug}"`);
        }
    } catch (err) {
        console.error(`BAD CATALOG ${entrySlug}: ${err.message}`);
        summary.errors += 1;
        continue;
    }

    const siteId = requireString(site.id, "site.id");
    const { data: existingSite, error: siteFetchError } = await admin
        .from("link_directory_sites")
        .select("id, slug, short_description, long_description, published_at")
        .eq("id", siteId)
        .maybeSingle();

    if (siteFetchError) {
        console.error(`FAILED ${entrySlug} site fetch: ${siteFetchError.message}`);
        summary.errors += 1;
        continue;
    }

    const siteIsNew = !existingSite;
    const skipSiteUpdate =
        existingSite && isSiteEditoriallyPopulated(existingSite) && !args.force;

    let siteRow;
    try {
        siteRow = buildSiteRow(site, categoryId);
    } catch (err) {
        console.error(`BAD CATALOG ${entrySlug}: ${err.message}`);
        summary.errors += 1;
        continue;
    }

    if (skipSiteUpdate) {
        summary.sitesSkipped += 1;
        console.log(`SKIP SITE (populated): ${entrySlug}`);
    } else if (args.dryRun) {
        console.log(
            `${siteIsNew ? "DRY-RUN INSERT" : "DRY-RUN UPDATE"} SITE: ${entrySlug}`
        );
        if (siteIsNew) summary.sitesInserted += 1;
        else summary.sitesUpdated += 1;
    } else {
        const { error: siteWriteError } = await admin
            .from("link_directory_sites")
            .upsert(siteRow, { onConflict: "id" });

        if (siteWriteError) {
            console.error(`FAILED ${entrySlug} site: ${siteWriteError.message}`);
            summary.errors += 1;
            continue;
        }

        if (siteIsNew) {
            summary.sitesInserted += 1;
            console.log(`INSERTED SITE: ${entrySlug}`);
        } else {
            summary.sitesUpdated += 1;
            console.log(`UPDATED SITE: ${entrySlug}`);
        }
    }

    const tagSlugs = Array.isArray(site.tag_slugs) ? site.tag_slugs : [];
    const tagIds = [];
    let tagLookupFailed = false;
    for (const tagSlug of tagSlugs) {
        const tagId = tagBySlug.get(tagSlug);
        if (!tagId) {
            console.error(`BAD CATALOG ${entrySlug}: unknown tag_slug "${tagSlug}"`);
            tagLookupFailed = true;
            break;
        }
        tagIds.push(tagId);
    }
    if (tagLookupFailed) {
        summary.errors += 1;
        continue;
    }

    const shouldSyncTags = siteIsNew || args.force;
    if (shouldSyncTags) {
        if (args.dryRun) {
            console.log(
                `DRY-RUN TAGS: ${entrySlug} (${tagIds.length} tags, replace=${args.force || siteIsNew})`
            );
        } else {
            try {
                await syncTagAssociations(admin, siteId, tagIds, {
                    dryRun: false,
                    replace: args.force || !siteIsNew,
                });
            } catch (err) {
                console.error(`FAILED ${entrySlug} tags: ${err.message}`);
                summary.errors += 1;
                continue;
            }
        }
    }

    const { data: existingOpps, error: oppListError } = await admin
        .from("link_directory_opportunities")
        .select("id, slug, description, steps")
        .eq("site_id", siteId);

    if (oppListError) {
        console.error(`FAILED ${entrySlug} opportunities fetch: ${oppListError.message}`);
        summary.errors += 1;
        continue;
    }

    const oppBySlug = new Map((existingOpps ?? []).map((o) => [o.slug, o]));

    for (const opp of opportunities) {
        const oppSlug = opp?.slug;
        if (typeof oppSlug !== "string" || !oppSlug.trim()) {
            console.error(`BAD CATALOG ${entrySlug}: opportunity missing slug`);
            summary.errors += 1;
            continue;
        }

        const typeSlug = opp.opportunity_type_slug;
        const opportunityTypeId = opportunityTypeBySlug.get(typeSlug);
        if (!opportunityTypeId) {
            console.error(
                `BAD CATALOG ${entrySlug}/${oppSlug}: unknown opportunity_type_slug "${typeSlug}"`
            );
            summary.errors += 1;
            continue;
        }

        const existingOpp = oppBySlug.get(oppSlug);
        const oppIsNew = !existingOpp;
        const skipOpp =
            existingOpp && isOpportunityEditoriallyPopulated(existingOpp) && !args.force;

        let oppRow;
        try {
            oppRow = buildOpportunityRow(opp, siteId, opportunityTypeId);
        } catch (err) {
            console.error(`BAD CATALOG ${entrySlug}/${oppSlug}: ${err.message}`);
            summary.errors += 1;
            continue;
        }

        if (skipOpp) {
            summary.oppsSkipped += 1;
            console.log(`SKIP OPP (populated): ${entrySlug}/${oppSlug}`);
            continue;
        }

        if (args.dryRun) {
            console.log(
                `${oppIsNew ? "DRY-RUN INSERT" : "DRY-RUN UPDATE"} OPP: ${entrySlug}/${oppSlug}`
            );
            if (oppIsNew) summary.oppsInserted += 1;
            else summary.oppsUpdated += 1;
            continue;
        }

        const { error: oppWriteError } = await admin
            .from("link_directory_opportunities")
            .upsert(oppRow, { onConflict: "id" });

        if (oppWriteError) {
            console.error(
                `FAILED ${entrySlug}/${oppSlug}: ${oppWriteError.message}`
            );
            summary.errors += 1;
            continue;
        }

        if (oppIsNew) {
            summary.oppsInserted += 1;
            console.log(`INSERTED OPP: ${entrySlug}/${oppSlug}`);
        } else {
            summary.oppsUpdated += 1;
            console.log(`UPDATED OPP: ${entrySlug}/${oppSlug}`);
        }
    }
}

let relinkSummary = {
    linked: 0,
    unchanged: 0,
    missingDestination: 0,
    missingOpportunity: 0,
    errors: 0,
};

const autoLaunchProviderSlugs = collectAutoLaunchProviderSlugs(entries, slugsToRun);

if (autoLaunchProviderSlugs.length > 0) {
    try {
        relinkSummary = await relinkAutoLaunchDestinations(admin, autoLaunchProviderSlugs, {
            dryRun: args.dryRun,
        });
        summary.errors += relinkSummary.errors;
    } catch (err) {
        console.error(err.message);
        summary.errors += 1;
    }
}

console.log(
    [
        "Done.",
        `sites inserted=${summary.sitesInserted}`,
        `updated=${summary.sitesUpdated}`,
        `skipped=${summary.sitesSkipped}`,
        `opps inserted=${summary.oppsInserted}`,
        `updated=${summary.oppsUpdated}`,
        `skipped=${summary.oppsSkipped}`,
        `destinations relinked=${relinkSummary.linked}`,
        `destinations relink unchanged=${relinkSummary.unchanged}`,
        `destinations relink skipped=${relinkSummary.missingDestination + relinkSummary.missingOpportunity}`,
        `errors=${summary.errors}`,
        `dry_run=${args.dryRun}`,
    ].join(" ")
);

if (summary.errors > 0) {
    process.exit(1);
}