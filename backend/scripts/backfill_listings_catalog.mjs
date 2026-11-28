#!/usr/bin/env node
/**
 * Backfill Building Blocks / Playbooks hub listings from JSON (service_role).
 *
 * Usage (from repo root):
 *   pnpm backend:db:backfill-listings-building-blocks
 *   pnpm backend:db:backfill-listings-playbooks
 *
 * Options:
 *   --env-file <path>     Relative to backend/ (default: .env.development.local)
 *   --catalog <path>      JSON catalog (required)
 *   --kind extension|stack  Guardrail: reject entries whose listing_kind differs
 *   --dry-run             Print actions only; no writes
 *   --force               Overwrite existing editorial rows; replace tags and stack members
 *   --list-missing        List catalog slugs missing from listings (no writes)
 *   --slug <slug>         Only this listing slug (repeatable)
 *   --help
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

/** Columns written from catalog JSON (engagement counters never included on update). */
const LISTING_PAYLOAD_KEYS = [
    "title",
    "slug",
    "excerpt",
    "description",
    "description_skills",
    "description_mcp",
    "content",
    "content_skills",
    "content_mcp",
    "click_url",
    "click_url_skills",
    "click_url_mcp",
    "listing_kind",
    "extension_type",
    "install_command_skills",
    "install_command_mcp",
    "is_official",
    "source_repo_url",
    "skill_source_url",
    "skill_name",
    "skill_metadata",
    "source_synced_at",
    "source_content_hash",
    "license",
    "version",
    "mcp_tools",
    "skill_commands",
    "stack_blueprint",
    "mcp_transport",
    "mcp_server_config",
    "is_user_published",
    "is_admin_published",
    "schema_type",
    "schema_json",
    "default_image_url",
    "logo_image_url",
    "listing_image_urls",
    "faq",
];

const CATALOG_META_KEYS = new Set([
    "id",
    "category_slug",
    "tag_slugs",
    "owner_username",
    "owner_id",
    "listing_category_id",
]);

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
        catalog: null,
        kind: null,
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
        else if (arg === "--kind" && argv[i + 1]) out.kind = argv[++i];
        else if (arg === "--slug" && argv[i + 1]) out.slugs.push(argv[++i]);
        else {
            console.error(`Unknown argument: ${arg}`);
            process.exit(1);
        }
    }

    return out;
}

function printHelp() {
    console.log(`Usage: node scripts/backfill_listings_catalog.mjs --catalog <path> --kind extension|stack [options]

Backfill public.listings (+ tag associations, stack members for playbooks) from catalog JSON.

Requires PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in backend/<env-file>.

  --catalog <path>    Catalog JSON (required)
  --kind extension|stack  Reject entries whose listing_kind does not match
  --env-file <path>   Default: .env.development.local
  --dry-run           No database writes
  --force             Replace populated rows, tags, and stack members
  --list-missing      Show catalog slugs not present in listings
  --slug <slug>       Limit to one slug (repeat flag)

Run building-blocks backfill before playbooks when stack members reference new extensions.`);
}

function requireString(value, label) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${label} is required`);
    }
    return value.trim();
}

function isListingEditoriallyPopulated(row) {
    if (!row) return false;
    const description =
        typeof row.description === "string" ? row.description.trim() : "";
    const content = typeof row.content === "string" ? row.content.trim() : "";
    const contentSkills =
        typeof row.content_skills === "string" ? row.content_skills.trim() : "";
    const contentMcp =
        typeof row.content_mcp === "string" ? row.content_mcp.trim() : "";
    return Boolean(description || content || contentSkills || contentMcp);
}

function pickListingPayload(listing) {
    /** @type {Record<string, unknown>} */
    const row = {};
    for (const key of LISTING_PAYLOAD_KEYS) {
        if (key in listing) {
            row[key] = listing[key];
        }
    }
    for (const key of Object.keys(listing)) {
        if (CATALOG_META_KEYS.has(key)) continue;
        if (LISTING_PAYLOAD_KEYS.includes(key)) continue;
        console.warn(`Ignoring unknown listing field: ${key}`);
    }
    return row;
}

function buildListingRow(listing, { listingId, ownerId, categoryId, tagSlugs }) {
    const payload = pickListingPayload(listing);
    const slug = requireString(listing.slug ?? payload.slug, "listing.slug");
    const title = requireString(listing.title ?? payload.title, "listing.title");

    return {
        id: listingId,
        owner_id: ownerId,
        listing_category_id: categoryId,
        slug,
        title,
        ...payload,
        slug,
        title,
        listing_tag_slugs: Array.isArray(tagSlugs) ? tagSlugs : [],
        updated_at: new Date().toISOString(),
    };
}

function resolvePublishedAt(listingRow, existing) {
    const userPub = Boolean(listingRow.is_user_published);
    const adminPub = Boolean(listingRow.is_admin_published);
    if (!userPub || !adminPub) {
        return undefined;
    }

    const isNew = !existing;
    const wasUnpublished =
        existing &&
        (!existing.is_user_published || !existing.is_admin_published);
    const needsPublish =
        isNew || wasUnpublished || (existing && !existing.published_at);

    if (!needsPublish) {
        return undefined;
    }

    return new Date().toISOString();
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

async function loadUsernameMap(admin) {
    const { data, error } = await admin.from("users").select("id, username");
    if (error) throw new Error(`users: ${error.message}`);
    const map = new Map();
    for (const row of data ?? []) {
        const username = row.username;
        if (typeof username === "string" && username) {
            map.set(username, row.id);
        }
    }
    return map;
}

async function syncListingTags(admin, listingId, tagIds, { dryRun }) {
    if (dryRun) return;

    const { error: deleteError } = await admin
        .from("listings_listing_tags_association")
        .delete()
        .eq("listing_id", listingId);

    if (deleteError) throw new Error(`tag delete: ${deleteError.message}`);

    if (tagIds.length === 0) return;

    const { error: insertError } = await admin
        .from("listings_listing_tags_association")
        .insert(
            tagIds.map((listing_tag_id) => ({
                listing_id: listingId,
                listing_tag_id,
            }))
        );

    if (insertError) throw new Error(`tag insert: ${insertError.message}`);
}

async function syncStackMembers(admin, stackListingId, members, { dryRun }) {
    if (dryRun) return;

    const { error: deleteError } = await admin
        .from("listing_stack_members")
        .delete()
        .eq("stack_listing_id", stackListingId);

    if (deleteError) throw new Error(`stack member delete: ${deleteError.message}`);

    if (members.length === 0) return;

    const { error: insertError } = await admin.from("listing_stack_members").insert(
        members.map((member, index) => ({
            stack_listing_id: stackListingId,
            member_listing_id: member.member_listing_id,
            member_role: member.member_role,
            sort_order: member.sort_order ?? index,
        }))
    );

    if (insertError) throw new Error(`stack member insert: ${insertError.message}`);
}

const args = parseArgs(process.argv);
if (args.help) {
    printHelp();
    process.exit(0);
}

if (!args.catalog) {
    console.error("--catalog is required (see --help)");
    process.exit(1);
}

if (!args.kind || (args.kind !== "extension" && args.kind !== "stack")) {
    console.error('--kind must be "extension" or "stack"');
    process.exit(1);
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

/** @type {{ version?: number; entries: Record<string, { listing: object; stack_members?: object[] }> }} */
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
    const catalogSlugs = slugsToRun.length ? slugsToRun : Object.keys(entries);
    const { data, error } = await admin
        .from("listings")
        .select("slug")
        .in("slug", catalogSlugs.length ? catalogSlugs : ["__none__"]);

    if (error) {
        console.error(error.message);
        process.exit(1);
    }

    const inDb = new Set((data ?? []).map((r) => r.slug));
    const missing = catalogSlugs.filter((slug) => !inDb.has(slug));

    console.log(`Catalog listings missing from listings: ${missing.length}`);
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
let tagBySlug;
let listingIdBySlug;
let userIdByUsername;

try {
    categoryBySlug = await loadSlugMap(admin, "listing_categories");
    tagBySlug = await loadSlugMap(admin, "listing_tags");
    listingIdBySlug = await loadSlugMap(admin, "listings");
    userIdByUsername = await loadUsernameMap(admin);
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

const summary = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    tagsSynced: 0,
    stackMembersSynced: 0,
    errors: 0,
};

for (const entrySlug of slugsToRun) {
    const entry = entries[entrySlug];
    if (!entry?.listing) {
        console.error(`BAD CATALOG ${entrySlug}: missing listing object`);
        summary.errors += 1;
        continue;
    }

    const listing = entry.listing;
    const entryKind =
        typeof listing.listing_kind === "string" ? listing.listing_kind : null;

    if (entryKind !== args.kind) {
        console.error(
            `BAD CATALOG ${entrySlug}: listing_kind "${entryKind}" does not match --kind ${args.kind}`
        );
        summary.errors += 1;
        continue;
    }

    let listingId;
    try {
        listingId = requireString(listing.id, "listing.id");
    } catch (err) {
        console.error(`BAD CATALOG ${entrySlug}: ${err.message}`);
        summary.errors += 1;
        continue;
    }

    let ownerId = listing.owner_id;
    if (typeof ownerId === "string" && ownerId) {
        // explicit catalog owner_id
    } else {
        const ownerUsername =
            typeof listing.owner_username === "string" && listing.owner_username.trim()
                ? listing.owner_username.trim()
                : "openquok";
        ownerId = userIdByUsername.get(ownerUsername);
        if (!ownerId) {
            console.error(
                `BAD CATALOG ${entrySlug}: unknown owner_username "${ownerUsername}"`
            );
            summary.errors += 1;
            continue;
        }
    }

    let categoryId;
    try {
        if (typeof listing.listing_category_id === "string" && listing.listing_category_id) {
            categoryId = listing.listing_category_id;
        } else {
            const categorySlug = requireString(
                listing.category_slug,
                "listing.category_slug"
            );
            categoryId = categoryBySlug.get(categorySlug);
            if (!categoryId) {
                throw new Error(`unknown category_slug "${categorySlug}"`);
            }
        }
    } catch (err) {
        console.error(`BAD CATALOG ${entrySlug}: ${err.message}`);
        summary.errors += 1;
        continue;
    }

    const tagSlugs = Array.isArray(listing.tag_slugs) ? listing.tag_slugs : [];
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

    const { data: existing, error: fetchError } = await admin
        .from("listings")
        .select(
            "id, slug, description, content, content_skills, content_mcp, published_at, is_user_published, is_admin_published"
        )
        .eq("id", listingId)
        .maybeSingle();

    if (fetchError) {
        console.error(`FAILED ${entrySlug} fetch: ${fetchError.message}`);
        summary.errors += 1;
        continue;
    }

    const isNew = !existing;
    const skipUpdate =
        existing && isListingEditoriallyPopulated(existing) && !args.force;

    let listingRow;
    try {
        listingRow = buildListingRow(listing, {
            listingId,
            ownerId,
            categoryId,
            tagSlugs,
        });
    } catch (err) {
        console.error(`BAD CATALOG ${entrySlug}: ${err.message}`);
        summary.errors += 1;
        continue;
    }

    const publishedAt = resolvePublishedAt(listingRow, existing);
    if (publishedAt) {
        listingRow.published_at = publishedAt;
    }

    const stackMembersRaw = Array.isArray(entry.stack_members) ? entry.stack_members : [];
    /** @type {{ member_listing_id: string; member_role: string; sort_order?: number }[]} */
    const resolvedStackMembers = [];

    if (args.kind === "stack" && stackMembersRaw.length > 0) {
        let memberLookupFailed = false;
        for (const member of stackMembersRaw) {
            const memberSlug = member?.member_listing_slug;
            if (typeof memberSlug !== "string" || !memberSlug.trim()) {
                console.error(
                    `BAD CATALOG ${entrySlug}: stack member missing member_listing_slug`
                );
                memberLookupFailed = true;
                break;
            }
            const memberListingId = listingIdBySlug.get(memberSlug.trim());
            if (!memberListingId) {
                console.error(
                    `BAD CATALOG ${entrySlug}: unknown member_listing_slug "${memberSlug}" (run building-blocks backfill first)`
                );
                memberLookupFailed = true;
                break;
            }
            const memberRole = member?.member_role;
            if (memberRole !== "skills" && memberRole !== "mcp") {
                console.error(
                    `BAD CATALOG ${entrySlug}: invalid member_role for "${memberSlug}"`
                );
                memberLookupFailed = true;
                break;
            }
            resolvedStackMembers.push({
                member_listing_id: memberListingId,
                member_role: memberRole,
                sort_order:
                    typeof member.sort_order === "number" ? member.sort_order : undefined,
            });
        }
        if (memberLookupFailed) {
            summary.errors += 1;
            continue;
        }
    }

    if (skipUpdate) {
        summary.skipped += 1;
        console.log(`SKIP LISTING (populated): ${entrySlug}`);
    } else if (args.dryRun) {
        console.log(
            `${isNew ? "DRY-RUN INSERT" : "DRY-RUN UPDATE"} LISTING: ${entrySlug}`
        );
        if (isNew) summary.inserted += 1;
        else summary.updated += 1;
    } else {
        const { error: writeError } = await admin
            .from("listings")
            .upsert(listingRow, { onConflict: "id" });

        if (writeError) {
            console.error(`FAILED ${entrySlug} listing: ${writeError.message}`);
            summary.errors += 1;
            continue;
        }

        if (isNew) {
            summary.inserted += 1;
            console.log(`INSERTED LISTING: ${entrySlug}`);
        } else {
            summary.updated += 1;
            console.log(`UPDATED LISTING: ${entrySlug}`);
        }

        listingIdBySlug.set(listingRow.slug, listingId);
    }

    const shouldSyncTags = isNew || args.force;
    if (shouldSyncTags && !skipUpdate) {
        if (args.dryRun) {
            console.log(`DRY-RUN TAGS: ${entrySlug} (${tagIds.length} tags)`);
        } else {
            try {
                await syncListingTags(admin, listingId, tagIds, { dryRun: false });
                summary.tagsSynced += 1;
            } catch (err) {
                console.error(`FAILED ${entrySlug} tags: ${err.message}`);
                summary.errors += 1;
                continue;
            }
        }
    }

    const shouldSyncStack =
        args.kind === "stack" && (isNew || args.force) && !skipUpdate;
    if (shouldSyncStack) {
        if (args.dryRun) {
            console.log(
                `DRY-RUN STACK MEMBERS: ${entrySlug} (${resolvedStackMembers.length} members)`
            );
        } else {
            try {
                await syncStackMembers(admin, listingId, resolvedStackMembers, {
                    dryRun: false,
                });
                summary.stackMembersSynced += 1;
            } catch (err) {
                console.error(`FAILED ${entrySlug} stack members: ${err.message}`);
                summary.errors += 1;
            }
        }
    }
}

console.log(
    [
        "Done.",
        `inserted=${summary.inserted}`,
        `updated=${summary.updated}`,
        `skipped=${summary.skipped}`,
        `tags_synced=${summary.tagsSynced}`,
        `stack_members_synced=${summary.stackMembersSynced}`,
        `errors=${summary.errors}`,
        `dry_run=${args.dryRun}`,
        `kind=${args.kind}`,
    ].join(" ")
);

if (summary.errors > 0) {
    process.exit(1);
}