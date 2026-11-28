#!/usr/bin/env node
/**
 * Merge production link_directory rows into scripts/catalog/directory/<slug>.json shards,
 * then apply STE-oriented link enrichments and logo normalization.
 *
 * Usage (from repo root):
 *   pnpm --filter ./backend run sync:link-directory-catalog-from-prod
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
const CATALOG_DIR = path.join(__dirname, "catalog/directory");

const PRESERVE_FROM_LOCAL = new Set([
	"chrome-web-store",
	"microsoft-edge-addons",
	"firefox-add-ons",
	"skool",
	"tinylaunch",
	"fazier",
	"devhunt",
]);

const STATIC_LOGO_BY_SLUG = {
	uneed: "uneed.svg",
	peerpush: "peerpush.svg",
	"open-launch": "open-launch.svg",
	tinylaunch: "tinylaunch.svg",
	skool: "skool.svg",
	devhunt: "devhunt.svg",
	fazier: "fazier.svg",
	"chrome-web-store": "chrome-web-store.svg",
	"microsoft-edge-addons": "microsoft-edge-addons.svg",
	"firefox-add-ons": "firefox-add-ons.svg",
};

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

function simplifySteHtml(text) {
	if (typeof text !== "string" || !text.trim()) return text;
	return text
		.replace(/<\/?p>/gi, "")
		.replace(/<strong>/gi, "")
		.replace(/<\/strong>/gi, "")
		.replace(/<code>/gi, "")
		.replace(/<\/code>/gi, "")
		.replace(/\s+/g, " ")
		.trim();
}

const SITE_LONG_PATCH = {
	"awesome-selfhosted":
		'The project curates self-hostable tools on GitHub. A merged list entry shows your project URL on <a href="https://awesome-selfhosted.net/">awesome-selfhosted.net</a> and in the README. Read <a href="https://github.com/awesome-selfhosted/awesome-selfhosted/blob/master/CONTRIBUTING.md">CONTRIBUTING</a> before you open a pull request.',
	reddit:
		'Reddit offers post, profile, and comment surfaces. Rules vary by community. Confirm rel on the live URL. Submit at <a href="https://www.reddit.com/submit">reddit.com/submit</a>.',
	github:
		'GitHub offers profile README, Pages, and container package pages. README links on github.com use nofollow. Pages links follow your HTML. See <a href="https://docs.github.com/en/pages">GitHub Pages docs</a>.',
	"dev-to":
		'DEV Community hosts articles and profile links. Confirm rel on your live article and profile. Publish at <a href="https://dev.to/new">dev.to/new</a>.',
	peerpush:
		'PeerPush lists products with tags and pricing. Compare plans at <a href="https://peerpush.com/pricing">peerpush.com/pricing</a>. Submit at <a href="https://peerpush.com/submit">peerpush.com/submit</a>.',
	"open-launch":
		'Open Launch runs free and premium launch slots. Review plans at <a href="https://open-launch.com/pricing">open-launch.com/pricing</a>. Submit at <a href="https://open-launch.com/projects/submit">open-launch.com/projects/submit</a>.',
	uneed: 'Uneed offers paid launches and a free maker profile. Review pricing at <a href="https://uneed.best/pricing">uneed.best/pricing</a>.',
	bluesky:
		'Bluesky supports website links on profiles and in posts. Confirm rel on the live profile URL. Open <a href="https://bsky.app">bsky.app</a>.',
	facebook:
		'Facebook Pages can show a website in About and in posts. Confirm rel on the public Page URL. See <a href="https://www.facebook.com/pages/create">Create a Page</a>.',
	instagram:
		'Instagram bio links appear on profiles. Business and Creator accounts can set one outbound URL. See <a href="https://help.instagram.com/566810106753081">add a link to your profile</a>.',
	linkedin:
		'LinkedIn profiles and Pages can link to your site. Confirm rel on the public profile or Page URL. Open <a href="https://www.linkedin.com">linkedin.com</a>.',
	threads:
		'Threads profiles can include one website link. Confirm rel on your public profile. Open <a href="https://www.threads.net">threads.net</a>.',
	tiktok:
		'TikTok profiles can include a website field when eligible. Confirm rel on your public profile. See <a href="https://www.tiktok.com">tiktok.com</a>.',
	youtube:
		'YouTube channel profiles can link to your site. Confirm rel on your channel About tab. Open <a href="https://studio.youtube.com">YouTube Studio</a>.',
	x: 'X profiles can show one website in bio. Confirm rel on your public profile. Open <a href="https://x.com/settings/profile">profile settings</a>.',
};

const OPP_PATCH = {
	"awesome-selfhosted": {
		"list-pr": {
			description:
				'Open a pull request on the <a href="https://github.com/awesome-selfhosted/awesome-selfhosted">awesome-selfhosted</a> repository. Add your tool in the correct category. List links on GitHub use nofollow. After merge, confirm the entry on <a href="https://awesome-selfhosted.net/">awesome-selfhosted.net</a>.',
			steps: [
				{
					order: 1,
					title: "Confirm eligibility",
					body: 'Read <a href="https://github.com/awesome-selfhosted/awesome-selfhosted/blob/master/CONTRIBUTING.md">CONTRIBUTING</a>. Your project must be self-hostable and actively maintained.',
				},
				{
					order: 2,
					title: "Open pull request",
					body: 'Follow the list format on <a href="https://github.com/awesome-selfhosted/awesome-selfhosted">awesome-selfhosted</a>. One entry per tool. Link your homepage or docs URL on your domain.',
				},
				{
					order: 3,
					title: "Verify after merge",
					body: 'Search for your tool on <a href="https://awesome-selfhosted.net/">awesome-selfhosted.net</a> and confirm the outbound link and rel.',
				},
			],
		},
	},
};

function siteToCatalog(s, catSlug) {
	const icon = STATIC_LOGO_BY_SLUG[s.slug];
	return {
		id: s.id,
		slug: s.slug,
		title: s.title,
		site_url: s.site_url,
		logo_url: icon
			? `https://www.openquok.com/icons/link-directory/${icon}`
			: s.logo_url,
		short_description: s.short_description,
		long_description: s.long_description,
		domain_rating: s.domain_rating,
		monthly_visits: s.monthly_visits,
		metrics_source: s.metrics_source,
		category_slug: catSlug,
		tag_slugs: s.tag_slugs ?? [],
		is_openquok_auth_supported: s.is_openquok_auth_supported,
		openquok_channel_slug: s.openquok_channel_slug,
		is_admin_published: s.is_admin_published,
		sort_order: s.sort_order ?? 0,
	};
}

function oppToCatalog(o, typeSlug) {
	return {
		id: o.id,
		slug: o.slug,
		title: o.title,
		opportunity_type_slug: typeSlug,
		effort: o.effort,
		approval_mode: o.approval_mode,
		approval_time_hint: o.approval_time_hint,
		dofollow: o.dofollow,
		cost_tier: o.cost_tier,
		cost_note: o.cost_note,
		description: o.description,
		steps: Array.isArray(o.steps) ? o.steps : [],
		openquok_cta_kind: o.openquok_cta_kind,
		openquok_channel_slug: o.openquok_channel_slug,
		openquok_plug_name: o.openquok_plug_name,
		cta_href: o.cta_href,
		cta_label: o.cta_label,
		sort_order: o.sort_order,
		is_admin_published: o.is_admin_published,
		auto_launch_enabled: Boolean(o.auto_launch_enabled),
		auto_launch_provider_slug: o.auto_launch_provider_slug,
	};
}

function applyPatches(entries) {
	for (const [slug, long] of Object.entries(SITE_LONG_PATCH)) {
		if (entries[slug]?.site) entries[slug].site.long_description = long;
	}
	for (const [siteSlug, opps] of Object.entries(OPP_PATCH)) {
		const entry = entries[siteSlug];
		if (!entry?.opportunities) continue;
		for (const opp of entry.opportunities) {
			const patch = opps[opp.slug];
			if (!patch) continue;
			if (patch.description) opp.description = patch.description;
			if (patch.steps) opp.steps = patch.steps;
		}
	}
	for (const entry of Object.values(entries)) {
		if (entry.site?.short_description)
			entry.site.short_description = simplifySteHtml(entry.site.short_description);
		if (entry.site?.long_description)
			entry.site.long_description = simplifySteHtml(entry.site.long_description);
		const icon = STATIC_LOGO_BY_SLUG[entry.site?.slug];
		if (icon && entry.site)
			entry.site.logo_url = `https://www.openquok.com/icons/link-directory/${icon}`;
		for (const opp of entry.opportunities ?? []) {
			if (opp.description) opp.description = simplifySteHtml(opp.description);
			if (opp.cost_note) opp.cost_note = simplifySteHtml(opp.cost_note);
			for (const step of opp.steps ?? []) {
				if (step.body) step.body = simplifySteHtml(step.body);
			}
			if (opp.slug === "helpful-answer" && opp.cta_href?.includes("openquok.com/docs")) {
				opp.cta_href = "https://www.reddit.com/submit";
				opp.cta_label = "Open Reddit submit";
			}
			if (typeof opp.description === "string") {
				opp.description = opp.description
					.replace(/Save the URL in OpenQuok\.?/gi, "Save your live listing URL.")
					.replace(/uneed\.best\/profile\/openquok/gi, "uneed.best/profile/your-handle");
			}
			for (const step of opp.steps ?? []) {
				if (typeof step.body === "string") {
					step.body = step.body
						.replace(/Save the URL in OpenQuok\.?/gi, "Save your live listing URL.")
						.replace(/uneed\.best\/profile\/openquok/gi, "uneed.best/profile/your-handle");
				}
			}
		}
	}
}

async function main() {
	const envFile = process.argv.includes("--env-file")
		? process.argv[process.argv.indexOf("--env-file") + 1]
		: ".env.production.local";
	if (!loadEnvFile(envFile)) {
		console.error(`Missing env file: backend/${envFile}`);
		process.exit(1);
	}
	const url = process.env.PUBLIC_SUPABASE_URL?.trim();
	const key = process.env.SUPABASE_SECRET_KEY?.trim();
	if (!url || !key) {
		console.error("Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
		process.exit(1);
	}

	const entries = { ...loadCatalogEntries(CATALOG_DIR) };
	const admin = createClient(url, key);

	const [{ data: sites, error: sErr }, { data: opps }, { data: cats }, { data: types }] =
		await Promise.all([
			admin.from("link_directory_sites").select("*").eq("is_admin_published", true),
			admin.from("link_directory_opportunities").select("*").eq("is_admin_published", true),
			admin.from("link_directory_categories").select("id,slug"),
			admin.from("link_directory_opportunity_types").select("id,slug"),
		]);
	if (sErr) throw sErr;

	const catSlug = Object.fromEntries((cats ?? []).map((c) => [c.id, c.slug]));
	const typeSlug = Object.fromEntries((types ?? []).map((t) => [t.id, t.slug]));
	const oppsBySite = {};
	for (const o of opps ?? []) {
		(oppsBySite[o.site_id] ??= []).push(o);
	}
	for (const id of Object.keys(oppsBySite)) {
		oppsBySite[id].sort((a, b) => a.sort_order - b.sort_order);
	}

	for (const s of sites ?? []) {
		if (PRESERVE_FROM_LOCAL.has(s.slug) && entries[s.slug]) continue;
		const mergedCategorySlug =
			catSlug[s.category_id] ?? entries[s.slug]?.site?.category_slug ?? null;
		entries[s.slug] = {
			site: siteToCatalog(s, mergedCategorySlug),
			opportunities: (oppsBySite[s.id] ?? []).map((o) => oppToCatalog(o, typeSlug[o.opportunity_type_id])),
		};
	}

	applyPatches(entries);

	const written = writeCatalogEntryShards(CATALOG_DIR, entries);
	console.log(`Updated ${CATALOG_DIR} (${written.size} site shards)`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});