#!/usr/bin/env node
/**
 * Pre-flight check for Open Launch link-directory CMS (listing manager).
 * Confirms published site URL and auto-launch flags on free-launch / premium-launch.
 *
 * Usage:
 *   node backend/scripts/verify-open-launch-link-directory-cms.mjs
 *   node backend/scripts/verify-open-launch-link-directory-cms.mjs --api https://api.openquok.com
 */

const DEFAULT_API_ROOT = "https://api.openquok.com";

const EXPECTED_SITE_URL = "https://open-launch.com";
const AUTO_LAUNCH_OPPORTUNITIES = [
	{
		slug: "free-launch",
		providerSlug: "open-launch-free-launch",
	},
	{
		slug: "premium-launch",
		providerSlug: "open-launch-premium-launch",
	},
];

function parseApiArg(argv) {
	const idx = argv.indexOf("--api");
	if (idx === -1) return DEFAULT_API_ROOT;
	const value = argv[idx + 1];
	if (!value || value.startsWith("--")) {
		throw new Error("Missing value after --api");
	}
	return value.replace(/\/$/, "");
}

function normalizeSiteUrl(url) {
	return String(url ?? "")
		.trim()
		.replace(/\/$/, "");
}

async function main() {
	const apiRoot = parseApiArg(process.argv.slice(2));
	const url = `${apiRoot}/api/v1/link-directory/published/open-launch`;
	const res = await fetch(url);
	if (!res.ok) {
		console.error(`HTTP ${res.status} from ${url}`);
		process.exit(1);
	}
	const body = await res.json();
	const site = body?.data;
	if (!site) {
		console.error("No site data in response");
		process.exit(1);
	}

	let failed = false;
	const siteUrl = normalizeSiteUrl(site.siteUrl ?? site.site_url);
	const expectedUrl = normalizeSiteUrl(EXPECTED_SITE_URL);
	if (siteUrl !== expectedUrl) {
		console.error(`site_url: expected ${expectedUrl}, got ${siteUrl || "(empty)"}`);
		failed = true;
	} else {
		console.log(`OK site_url ${siteUrl}`);
	}

	const opportunities = site.opportunities ?? [];
	const bySlug = new Map(opportunities.map((o) => [o.slug, o]));

	if (!bySlug.has("guest-article")) {
		console.warn("WARN guest-article opportunity missing (expected editorial-only, no auto-launch)");
	}

	for (const expected of AUTO_LAUNCH_OPPORTUNITIES) {
		const row = bySlug.get(expected.slug);
		if (!row) {
			console.error(`MISSING opportunity slug ${expected.slug}`);
			failed = true;
			continue;
		}
		const enabled = row.autoLaunchEnabled === true;
		const provider = row.autoLaunchProviderSlug ?? row.auto_launch_provider_slug ?? null;
		if (!enabled) {
			console.error(`${expected.slug}: autoLaunchEnabled must be true (listing manager → Browser extension auto-launch)`);
			failed = true;
		} else if (provider !== expected.providerSlug) {
			console.error(
				`${expected.slug}: autoLaunchProviderSlug expected ${expected.providerSlug}, got ${provider ?? "(null)"}`
			);
			failed = true;
		} else {
			console.log(`OK ${expected.slug} → ${provider}`);
		}
	}

	const guest = bySlug.get("guest-article");
	if (guest?.autoLaunchEnabled === true) {
		console.error("guest-article: autoLaunchEnabled must stay false");
		failed = true;
	} else if (guest) {
		console.log("OK guest-article auto-launch disabled");
	}

	if (failed) {
		console.error("\nCMS check failed. Update secret-admin link-directory manager (no link-directory SQL for Open Launch).");
		console.error("See docs/link-directory/build-backlinks-admin-copy-paste.md → Open Launch auto-launch.");
		process.exit(1);
	}

	console.log("\nOpen Launch link-directory CMS check passed.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
