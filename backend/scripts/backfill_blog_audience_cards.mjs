#!/usr/bin/env node
/**
 * Backfill blog_posts.audience_card from a slug catalog (service_role).
 *
 * Usage (from repo root):
 *   pnpm backend:db:backfill-blog-audience-cards
 *   pnpm backend:db:backfill-blog-audience-cards:prod
 *
 * Options:
 *   --env-file <path>     Relative to backend/ (default: .env.development.local)
 *   --catalog <path>      JSON catalog (default: scripts/blog_audience_card_backfill.catalog.json)
 *   --dry-run             Print actions only; no UPDATE
 *   --force               Overwrite posts that already have an audience card
 *   --list-missing        List published posts with empty audience_card (no writes)
 *   --slug <slug>         Only this slug (repeatable)
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const PRESET_TITLES = {
    developer: "Developers",
    "team-social-managers": "Team & social managers",
    founders: "Founders",
    marketers: "Marketers",
    "self-host-operators": "Self-host operators",
    custom: "Readers",
};

const VALID_PRESETS = new Set(Object.keys(PRESET_TITLES));

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
        catalog: path.join(__dirname, "blog_audience_card_backfill.catalog.json"),
        dryRun: false,
        force: false,
        listMissing: false,
        slugs: [],
        help: false,
    };

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
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
    console.log(`Usage: pnpm backend:db:backfill-blog-audience-cards [-- options]

Backfill audience_card on blog_posts from ${path.basename(
        path.join(__dirname, "blog_audience_card_backfill.catalog.json")
    )}.

Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/<env-file>.

  --env-file <path>   Default: .env.development.local (prod: .env.production.local)
  --catalog <path>    Override catalog JSON
  --dry-run           No database writes
  --force             Replace existing audience cards
  --list-missing      Show published posts with no audience card
  --slug <slug>       Limit to one slug (repeat flag)`);
}

function isAudienceCardFilled(value) {
    if (!value || typeof value !== "object") return false;
    const title = typeof value.title === "string" ? value.title.trim() : "";
    const description = typeof value.description === "string" ? value.description.trim() : "";
    return Boolean(title && description);
}

function buildAudienceCard(entry) {
    const preset = entry.preset ?? "custom";
    if (!VALID_PRESETS.has(preset)) {
        throw new Error(`Invalid preset "${preset}"`);
    }
    const title = (entry.title ?? PRESET_TITLES[preset] ?? "Readers").trim();
    const description = String(entry.description ?? "").trim();
    if (!description) {
        throw new Error("Catalog entry needs a description");
    }
    return {
        preset,
        title,
        description,
        audience_type: entry.audience_type ?? null,
    };
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

/** @type {{ version?: number; entries: Record<string, unknown> }} */
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const entries = catalog.entries ?? {};

const admin = createClient(supabaseUrl, supabaseSecretKey);

if (args.listMissing) {
    const { data, error } = await admin
        .from("blog_posts")
        .select("slug, title, audience_card")
        .eq("is_user_published", true)
        .eq("is_admin_approved", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error.message);
        process.exit(1);
    }

    const missing = (data ?? []).filter((row) => !isAudienceCardFilled(row.audience_card));
    console.log(`Published posts missing audience card: ${missing.length}`);
    for (const row of missing) {
        const inCatalog = row.slug in entries ? "catalog" : "no-catalog";
        console.log(`  ${row.slug}  [${inCatalog}]  ${row.title}`);
    }
    process.exit(0);
}

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

if (slugsToRun.length === 0) {
    console.error("No slugs to process.");
    process.exit(1);
}

const { data: posts, error: fetchError } = await admin
    .from("blog_posts")
    .select("id, slug, title, audience_card")
    .in("slug", slugsToRun);

if (fetchError) {
    console.error(fetchError.message);
    process.exit(1);
}

const bySlug = new Map((posts ?? []).map((p) => [p.slug, p]));
let updated = 0;
let skipped = 0;
let notFound = 0;

for (const slug of slugsToRun) {
    const row = bySlug.get(slug);
    if (!row) {
        notFound += 1;
        console.log(`NOT IN DB: ${slug}`);
        continue;
    }

    if (isAudienceCardFilled(row.audience_card) && !args.force) {
        skipped += 1;
        console.log(`SKIP (has card): ${slug}`);
        continue;
    }

    let audienceCard;
    try {
        audienceCard = buildAudienceCard(entries[slug]);
    } catch (err) {
        console.error(`BAD CATALOG ${slug}: ${err.message}`);
        process.exit(1);
    }

    if (args.dryRun) {
        console.log(`DRY-RUN UPDATE: ${slug}  preset=${audienceCard.preset}`);
        updated += 1;
        continue;
    }

    const { error: updateError } = await admin
        .from("blog_posts")
        .update({ audience_card: audienceCard })
        .eq("id", row.id);

    if (updateError) {
        console.error(`FAILED ${slug}: ${updateError.message}`);
        process.exit(1);
    }

    updated += 1;
    console.log(`UPDATED: ${slug}`);
}

console.log(
    `Done. updated=${updated} skipped=${skipped} not_in_db=${notFound} dry_run=${args.dryRun}`
);