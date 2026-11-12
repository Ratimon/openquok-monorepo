#!/usr/bin/env node
/**
 * Emits `auto_launch_destinations.extension_config` SQL from TypeScript fixtures.
 *
 * Source of truth: `common/src/auto-launch/destination-configs/*.ts`
 * (`DIRECTORY_EXTENSION_CONFIG_FIXTURES`).
 *
 * Prerequisite: `pnpm common:build` (imports `common/dist`).
 *
 * Usage:
 *   node backend/scripts/sync-auto-launch-extension-configs.mjs
 *   node backend/scripts/sync-auto-launch-extension-configs.mjs --check
 *
 * After editing fixtures, run `pnpm sync:auto-launch-configs`, then
 * `pnpm backend:db:aggregate-migrations-all`.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const repoRoot = path.join(backendRoot, "..");
const commonDistIndex = path.join(repoRoot, "common", "dist", "index.js");
const commonDistSyncMetadata = path.join(
	repoRoot,
	"common",
	"dist",
	"auto-launch",
	"destination-configs",
	"syncMetadata.js"
);

/** Stable output module (tier 5xx seed). Bump date segment only when replacing the file. */
export const AUTO_LAUNCH_EXTENSION_CONFIGS_SQL = "505_20261111_extension_configs.sql";

const OUTPUT_PATH = path.join(
	backendRoot,
	"supabase",
	"db",
	"auto-launch",
	AUTO_LAUNCH_EXTENSION_CONFIGS_SQL
);

const MODULE_HEADER = `-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261111
-- MODULE SCOPE: Seed (synced extension_config from destination-configs/*.ts)
-- GENERATED — do not edit; run pnpm sync:auto-launch-configs
-- ---------------------------
`;

/**
 * @param {unknown} config
 */
function toJsonbDollarQuoted(config) {
	const json = JSON.stringify(config, null, 4);
	const tag = "json";
	if (json.includes(`$${tag}$`)) {
		throw new Error("extension_config JSON contains dollar-quote delimiter");
	}
	return `$${tag}$${json}$${tag}$::jsonb`;
}

/**
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 * @param {Record<string, { baseProviderSlug: string }>} pricingDerived
 */
function validatePricingQueueFixtures(fixtures, pricingDerived) {
	for (const [slug, meta] of Object.entries(pricingDerived)) {
		const variant = fixtures[slug];
		const base = fixtures[meta.baseProviderSlug];
		if (!variant || !base) {
			throw new Error(`pricing variant ${slug} missing fixture or base ${meta.baseProviderSlug}`);
		}
		const expected = { ...base, readyUrlHint: "pricing" };
		if (JSON.stringify(expected) !== JSON.stringify(variant)) {
			throw new Error(
				`${slug} must equal { ...${meta.baseProviderSlug}, readyUrlHint: 'pricing' } in TS fixtures`
			);
		}
	}
}

/**
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 * @param {string[]} providerSlugs
 */
function buildMigrationSql(fixtures, providerSlugs) {
	const blocks = providerSlugs.map((providerSlug) => {
		const config = fixtures[providerSlug];
		if (!config) {
			throw new Error(`missing fixture for ${providerSlug}`);
		}
		const jsonLiteral = toJsonbDollarQuoted(config);
		return [
			`UPDATE public.auto_launch_destinations`,
			`SET extension_config = ${jsonLiteral}`,
			`WHERE provider_slug = '${providerSlug}';`,
			"",
		].join("\n");
	});

	return `${MODULE_HEADER}\nBEGIN;\n\n${blocks.join("\n")}\nCOMMIT;\n`;
}

function parseArgs(argv) {
	return { check: argv.includes("--check") };
}

async function loadFixtures() {
	try {
		await fs.access(commonDistIndex);
	} catch {
		console.error("common/dist missing. Run `pnpm common:build` first.");
		process.exit(1);
	}

	const { DIRECTORY_EXTENSION_CONFIG_FIXTURES, DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS } =
		await import(commonDistIndex);
	const { AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED } =
		await import(commonDistSyncMetadata);

	validatePricingQueueFixtures(
		DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED
	);

	const slugs = [...DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS].sort();
	return {
		fixtures: DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		slugs,
		sql: buildMigrationSql(DIRECTORY_EXTENSION_CONFIG_FIXTURES, slugs),
	};
}

async function main() {
	const { check } = parseArgs(process.argv.slice(2));
	const { sql, slugs } = await loadFixtures();

	if (check) {
		let existing;
		try {
			existing = await fs.readFile(OUTPUT_PATH, "utf8");
		} catch {
			console.error(`Missing ${OUTPUT_PATH}. Run pnpm sync:auto-launch-configs.`);
			process.exit(1);
		}
		if (existing !== sql) {
			console.error(
				`${AUTO_LAUNCH_EXTENSION_CONFIGS_SQL} is stale (${slugs.length} slugs). Run pnpm sync:auto-launch-configs.`
			);
			process.exit(1);
		}
		console.log(`OK ${AUTO_LAUNCH_EXTENSION_CONFIGS_SQL} matches ${slugs.length} fixture(s).`);
		return;
	}

	await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
	await fs.writeFile(OUTPUT_PATH, sql, "utf8");
	console.log(`Wrote ${OUTPUT_PATH} (${slugs.length} provider_slug UPDATE(s)).`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
