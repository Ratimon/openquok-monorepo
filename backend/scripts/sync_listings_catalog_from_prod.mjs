#!/usr/bin/env node
/**
 * Merge production listings rows into Building Blocks / Playbooks catalog JSON.
 *
 * Usage (from repo root):
 *   pnpm --filter ./backend run sync:listings-building-blocks-catalog-from-prod
 *   pnpm --filter ./backend run sync:listings-playbooks-catalog-from-prod
 *
 * Requires PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY in backend/.env.production.local
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { loadCatalogEntries, writeCatalogEntryShards } from "./catalog/loadCatalogEntries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const CATALOG_BY_KIND = {
	extension: path.join(__dirname, "catalog/building-blocks"),
	stack: path.join(__dirname, "catalog/playbooks"),
};

/** Slugs with hand-curated repo JSON — skip overwriting when already present locally. */
const PRESERVE_FROM_LOCAL = new Set(["openquok-core", "viral-tiktok-carousel"]);

/** Same editorial fields as backfill_listings_catalog.mjs */
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

const DB_ONLY_KEYS = new Set([
	"owner_id",
	"listing_category_id",
	"listing_tag_slugs",
	"likes",
	"views",
	"clicks",
	"bookmark_count",
	"ratings_count",
	"average_rating",
	"published_at",
	"created_at",
	"updated_at",
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
		if (process.env[key] === undefined) process.env[key] = value;
	}
	return true;
}

function parseArgs(argv) {
	const out = {
		envFile: ".env.production.local",
		kind: null,
		catalog: null,
		slugs: [],
		help: false,
	};

	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--") continue;
		if (arg === "-h" || arg === "--help") out.help = true;
		else if (arg === "--env-file" && argv[i + 1]) out.envFile = argv[++i];
		else if (arg === "--kind" && argv[i + 1]) out.kind = argv[++i];
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
	console.log(`Usage: node scripts/sync_listings_catalog_from_prod.mjs --kind extension|stack [options]

Pull admin-published listings from production into catalog JSON.

  --kind extension|stack   Required; selects default catalog file
  --catalog <path>         Override catalog path (default per kind)
  --env-file <path>        Default: .env.production.local
  --slug <slug>            Only merge these slugs (repeatable)`);
}

function listingToCatalog(row, { categorySlug, ownerUsername, tagSlugs }) {
	/** @type {Record<string, unknown>} */
	const listing = { id: row.id };

	for (const key of LISTING_PAYLOAD_KEYS) {
		if (key in row && row[key] !== undefined && !DB_ONLY_KEYS.has(key)) {
			listing[key] = row[key];
		}
	}

	if (categorySlug) listing.category_slug = categorySlug;
	if (ownerUsername) listing.owner_username = ownerUsername;
	if (Array.isArray(tagSlugs) && tagSlugs.length > 0) {
		listing.tag_slugs = tagSlugs;
	} else if (!("tag_slugs" in listing)) {
		listing.tag_slugs = [];
	}

	return listing;
}

function stackMemberToCatalog(member, memberSlugById) {
	const memberSlug = memberSlugById.get(member.member_listing_id);
	if (!memberSlug) {
		console.warn(
			`Skipping stack member ${member.member_listing_id}: member listing slug not found`
		);
		return null;
	}
	return {
		member_listing_slug: memberSlug,
		member_role: member.member_role,
		sort_order: member.sort_order ?? 0,
	};
}

async function main() {
	const args = parseArgs(process.argv);
	if (args.help) {
		printHelp();
		process.exit(0);
	}

	if (!args.kind || (args.kind !== "extension" && args.kind !== "stack")) {
		console.error('--kind must be "extension" or "stack"');
		process.exit(1);
	}

	if (!loadEnvFile(args.envFile)) {
		console.error(`Missing env file: backend/${args.envFile}`);
		process.exit(1);
	}

	const url = process.env.PUBLIC_SUPABASE_URL?.trim();
	const key = process.env.SUPABASE_SECRET_KEY?.trim();
	if (!url || !key) {
		console.error("Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
		process.exit(1);
	}

	const catalogPath = args.catalog
		? path.isAbsolute(args.catalog)
			? args.catalog
			: path.resolve(backendRoot, args.catalog)
		: CATALOG_BY_KIND[args.kind];

	if (!fs.existsSync(catalogPath)) {
		console.error(`Catalog not found: ${catalogPath}`);
		process.exit(1);
	}

	const entries = { ...loadCatalogEntries(catalogPath) };
	const admin = createClient(url, key);

	const listingsQuery = admin
		.from("listings")
		.select("*")
		.eq("listing_kind", args.kind)
		.eq("is_admin_published", true);

	const { data: listings, error: listingsError } = await listingsQuery;
	if (listingsError) throw listingsError;

	let rows = listings ?? [];
	if (args.slugs.length > 0) {
		const allow = new Set(args.slugs);
		rows = rows.filter((r) => allow.has(r.slug));
	}

	const listingIds = rows.map((r) => r.id);
	if (listingIds.length === 0) {
		console.log(`No matching production listings for kind=${args.kind}`);
		writeCatalogEntryShards(catalogPath, entries);
		return;
	}

	const [
		{ data: categories, error: catErr },
		{ data: users, error: usersErr },
		{ data: tags, error: tagsErr },
		{ data: tagAssocs, error: assocErr },
		{ data: allListingsForSlug, error: slugMapErr },
		{ data: stackMembers, error: stackErr },
	] = await Promise.all([
		admin.from("listing_categories").select("id, slug"),
		admin.from("users").select("id, username"),
		admin.from("listing_tags").select("id, slug"),
		admin
			.from("listings_listing_tags_association")
			.select("listing_id, listing_tag_id")
			.in("listing_id", listingIds),
		admin.from("listings").select("id, slug"),
		args.kind === "stack"
			? admin
					.from("listing_stack_members")
					.select("stack_listing_id, member_listing_id, member_role, sort_order")
					.in("stack_listing_id", listingIds)
			: Promise.resolve({ data: [], error: null }),
	]);

	if (catErr) throw catErr;
	if (usersErr) throw usersErr;
	if (tagsErr) throw tagsErr;
	if (assocErr) throw assocErr;
	if (slugMapErr) throw slugMapErr;
	if (stackErr) throw stackErr;

	const categorySlugById = Object.fromEntries((categories ?? []).map((c) => [c.id, c.slug]));
	const usernameById = Object.fromEntries((users ?? []).map((u) => [u.id, u.username]));
	const tagSlugById = Object.fromEntries((tags ?? []).map((t) => [t.id, t.slug]));
	const listingSlugById = new Map((allListingsForSlug ?? []).map((l) => [l.id, l.slug]));

	const tagSlugsByListingId = new Map();
	for (const assoc of tagAssocs ?? []) {
		const tagSlug = tagSlugById[assoc.listing_tag_id];
		if (!tagSlug) continue;
		const list = tagSlugsByListingId.get(assoc.listing_id) ?? [];
		list.push(tagSlug);
		tagSlugsByListingId.set(assoc.listing_id, list);
	}
	for (const [id, slugs] of tagSlugsByListingId) {
		slugs.sort();
		tagSlugsByListingId.set(id, slugs);
	}

	const stackMembersByStackId = new Map();
	for (const member of stackMembers ?? []) {
		const list = stackMembersByStackId.get(member.stack_listing_id) ?? [];
		list.push(member);
		stackMembersByStackId.set(member.stack_listing_id, list);
	}
	for (const [id, members] of stackMembersByStackId) {
		members.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
		stackMembersByStackId.set(id, members);
	}

	let merged = 0;
	let skippedPreserve = 0;

	for (const row of rows) {
		if (PRESERVE_FROM_LOCAL.has(row.slug) && entries[row.slug]) {
			skippedPreserve += 1;
			continue;
		}

		const tagSlugs = tagSlugsByListingId.get(row.id) ?? [];
		const listing = listingToCatalog(row, {
			categorySlug: categorySlugById[row.listing_category_id] ?? null,
			ownerUsername: usernameById[row.owner_id] ?? "openquok",
			tagSlugs,
		});

		/** @type {{ member_listing_slug: string; member_role: string; sort_order: number }[]} */
		let members = [];
		if (args.kind === "stack") {
			const rawMembers = stackMembersByStackId.get(row.id) ?? [];
			members = rawMembers
				.map((m) => stackMemberToCatalog(m, listingSlugById))
				.filter(Boolean);
		}

		entries[row.slug] = {
			listing,
			stack_members: members,
		};
		merged += 1;
	}

	const written = writeCatalogEntryShards(catalogPath, entries);
	console.log(
		`Updated ${catalogPath} (${written.size} shards; merged ${merged} from prod, preserved ${skippedPreserve} local)`
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});