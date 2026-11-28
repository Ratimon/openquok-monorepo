#!/usr/bin/env node
/**
 * Emits `auto_launch_destinations` INSERT SQL from `destinationSeeds.ts`.
 *
 * Source of truth: `common/src/auto-launch/destination-configs/destinationSeeds.ts`
 *
 * Prerequisite: `pnpm common:build`
 *
 * Usage:
 *   node backend/scripts/sync-auto-launch-destination-seeds.mjs
 *   node backend/scripts/sync-auto-launch-destination-seeds.mjs --check
 *   node backend/scripts/sync-auto-launch-destination-seeds.mjs --site peerpush
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
const commonDistExtensionDerivation = path.join(
	repoRoot,
	"common",
	"dist",
	"auto-launch",
	"destination-configs",
	"extensionConfigDerivation.js"
);

const AUTO_LAUNCH_DB_DIR = path.join(backendRoot, "supabase", "db", "auto-launch");

const EXTENSION_CONFIG_NOTE =
	"-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql";

const ON_CONFLICT_TAIL = `ON CONFLICT (provider_slug) DO UPDATE SET
    link_directory_opportunity_id = EXCLUDED.link_directory_opportunity_id,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    submission_path = EXCLUDED.submission_path,
    start_url = EXCLUDED.start_url,
    extension_config = EXCLUDED.extension_config,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    picker_group_key = EXCLUDED.picker_group_key,
    picker_group_title = EXCLUDED.picker_group_title,
    updated_at = NOW();`;

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
 * @param {string} providerSlug
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function extensionConfigSqlLiteral(providerSlug, fixtures) {
	const config = fixtures[providerSlug];
	if (!config) {
		return "'{}'::jsonb";
	}
	return toJsonbDollarQuoted(config);
}

/**
 * @param {string} value
 */
function sqlTextLiteral(value) {
	return `'${value.replace(/'/g, "''")}'`;
}

/**
 * @param {string | null} value
 */
function sqlNullableText(value) {
	return value === null || value === undefined ? "NULL::text" : `${sqlTextLiteral(value)}::text`;
}

/**
 * @param {readonly string[]} slugs
 * @param {boolean} multiline
 */
function formatOpportunitySlugInList(slugs, multiline) {
	if (slugs.length <= 1) {
		return slugs.map((slug) => sqlTextLiteral(slug)).join(", ");
	}
	if (!multiline) {
		return `(${slugs.map((slug) => sqlTextLiteral(slug)).join(", ")})`;
	}
	const lines = slugs.map((slug) => `                      ${sqlTextLiteral(slug)}`);
	return `(\n${lines.join(",\n")}\n                  )`;
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedRow} row
 */
function buildOpportunityIdSubquery(row) {
	const siteSlug = sqlTextLiteral(row.siteSlug);
	if (row.opportunitySlug) {
		return [
			"            (",
			"                SELECT o.id",
			"                FROM public.link_directory_opportunities o",
			"                INNER JOIN public.link_directory_sites s ON s.id = o.site_id",
			`                WHERE s.slug = ${siteSlug}`,
			`                  AND o.slug = ${sqlTextLiteral(row.opportunitySlug)}`,
			"                LIMIT 1",
			"            )",
		].join("\n");
	}

	const priority = row.opportunitySlugPriority ?? [];
	const inSlugs = row.opportunitySlugInList ?? priority;
	const inList = formatOpportunitySlugInList(inSlugs, row.opportunitySlugInMultiline === true);
	const caseLines = priority.map(
		(slug, index) => `                        WHEN ${sqlTextLiteral(slug)} THEN ${index + 1}`
	);

	return [
		"            (",
		"                SELECT o.id",
		"                FROM public.link_directory_opportunities o",
		"                INNER JOIN public.link_directory_sites s ON s.id = o.site_id",
		`                WHERE s.slug = ${siteSlug}`,
		`                  AND o.slug IN ${inList}`,
		"                ORDER BY",
		"                    CASE o.slug",
		...caseLines,
		"                        ELSE 4",
		"                    END",
		"                LIMIT 1",
		"            )",
	].join("\n");
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedRow} row
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function buildPerRowDestinationInsert(row, fixtures) {
	const submissionPath = row.submissionPath ?? "extension";
	const opportunityIdSql = buildOpportunityIdSubquery(row).replace(/^            /gm, "    ");
	return [
		"INSERT INTO public.auto_launch_destinations (",
		"    id,",
		"    provider_slug,",
		"    link_directory_opportunity_id,",
		"    name,",
		"    short_description,",
		"    submission_path,",
		"    start_url,",
		"    extension_config,",
		"    is_published,",
		"    sort_order,",
		"    picker_group_key,",
		"    picker_group_title",
		")",
		"SELECT",
		`    ${sqlTextLiteral(row.destinationId)}::uuid,`,
		`    ${sqlTextLiteral(row.providerSlug)}::text,`,
		opportunityIdSql + ",",
		`    ${sqlTextLiteral(row.name)},`,
		`    ${sqlTextLiteral(row.shortDescription)},`,
		`    ${sqlTextLiteral(submissionPath)},`,
		`    ${sqlTextLiteral(row.startUrl)},`,
		`    ${extensionConfigSqlLiteral(row.providerSlug, fixtures)},`,
		"    true,",
		`    ${row.sortOrder},`,
		`    ${sqlNullableText(row.pickerGroupKey)},`,
		`    ${sqlNullableText(row.pickerGroupTitle)}`,
		ON_CONFLICT_TAIL,
		"",
	].join("\n");
}

/**
 * @param {readonly import('openquok-common').AutoLaunchDestinationSeedRow[]} rows
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function buildUneedValuesDestinationBlock(rows, fixtures) {
	const valueTuples = rows.map((row) => {
		const submissionPath = row.submissionPath ?? "extension";
		return [
			"        (",
			`            ${sqlTextLiteral(row.destinationId)}::uuid,`,
			`            ${sqlTextLiteral(row.providerSlug)}::text,`,
			buildOpportunityIdSubquery(row) + ",",
			`            ${sqlTextLiteral(row.name)},`,
			`            ${sqlTextLiteral(row.shortDescription)},`,
			`            ${sqlTextLiteral(submissionPath)},`,
			`            ${sqlTextLiteral(row.startUrl)},`,
			`            ${extensionConfigSqlLiteral(row.providerSlug, fixtures)},`,
			"            true,",
			`            ${row.sortOrder},`,
			`            ${sqlNullableText(row.pickerGroupKey)},`,
			`            ${sqlNullableText(row.pickerGroupTitle)}`,
			"        )",
		].join("\n");
	});

	return [
		"INSERT INTO public.auto_launch_destinations (",
		"    id,",
		"    provider_slug,",
		"    link_directory_opportunity_id,",
		"    name,",
		"    short_description,",
		"    submission_path,",
		"    start_url,",
		"    extension_config,",
		"    is_published,",
		"    sort_order,",
		"    picker_group_key,",
		"    picker_group_title",
		")",
		"SELECT",
		"    v.id,",
		"    v.provider_slug,",
		"    v.opportunity_id,",
		"    v.name,",
		"    v.short_description,",
		"    v.submission_path,",
		"    v.start_url,",
		"    v.extension_config,",
		"    v.is_published,",
		"    v.sort_order,",
		"    v.picker_group_key,",
		"    v.picker_group_title",
		"FROM (",
		"    VALUES",
		valueTuples.join(",\n"),
		") AS v (",
		"    id,",
		"    provider_slug,",
		"    opportunity_id,",
		"    name,",
		"    short_description,",
		"    submission_path,",
		"    start_url,",
		"    extension_config,",
		"    is_published,",
		"    sort_order,",
		"    picker_group_key,",
		"    picker_group_title",
		")",
		"WHERE v.opportunity_id IS NOT NULL",
		ON_CONFLICT_TAIL,
	].join("\n");
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedModule} module
 */
function buildModuleHeader(module) {
	return [
		"-- ---------------------------",
		"-- MODULE NAME: Auto Launch",
		`-- MODULE DATE: ${module.moduleDate}`,
		`-- MODULE SCOPE: ${module.moduleScopeLabel}`,
		"-- ---------------------------",
		EXTENSION_CONFIG_NOTE,
		...module.preambleComments,
		"",
	].join("\n");
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedModule} module
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function buildGeneratedDestinationSql(module, fixtures) {
	if (module.generationMode === "composite") {
		return buildUneedValuesDestinationBlock(module.destinations, fixtures);
	}
	return module.destinations.map((row) => buildPerRowDestinationInsert(row, fixtures)).join("\n");
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedModule} module
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function buildFullModuleSql(module, fixtures) {
	const body = buildGeneratedDestinationSql(module, fixtures).trimEnd();
	return `${buildModuleHeader(module)}\nBEGIN;\n\n${body}\n\nCOMMIT;\n`;
}

/**
 * @param {string} fileContent
 * @param {string} markerStart
 * @param {string} markerEnd
 * @param {string} generatedBlock
 */
function spliceCompositeMarkers(fileContent, markerStart, markerEnd, generatedBlock) {
	const startIdx = fileContent.indexOf(markerStart);
	const endIdx = fileContent.indexOf(markerEnd);
	if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
		return null;
	}
	const before = fileContent.slice(0, startIdx + markerStart.length);
	const after = fileContent.slice(endIdx);
	return `${before}\n${generatedBlock}\n${after}`;
}

/**
 * Extract the VALUES-style destination block from legacy composite files (no markers yet).
 * @param {string} fileContent
 */
function extractLegacyCompositeDestinationBlock(fileContent) {
	const marker = "INSERT INTO public.auto_launch_destinations (";
	const startIdx = fileContent.indexOf(marker);
	if (startIdx === -1) {
		return null;
	}
	const endIdx = fileContent.indexOf(ON_CONFLICT_TAIL, startIdx);
	if (endIdx === -1) {
		return null;
	}
	return fileContent.slice(startIdx, endIdx + ON_CONFLICT_TAIL.length);
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedRow[]} rows
 * @param {Record<string, { baseProviderSlug: string; readyUrlHint: string; startUrlPathSuffix?: string }>} pricingDerived
 * @param {(slug: string, startUrl: string, meta: { baseProviderSlug: string; readyUrlHint: string; startUrlPathSuffix?: string }) => void} validateStartUrl
 */
function validatePricingStartUrlDerived(rows, pricingDerived, validateStartUrl) {
	const bySlug = new Map(rows.map((row) => [row.providerSlug, row]));
	for (const [slug, meta] of Object.entries(pricingDerived)) {
		const variant = bySlug.get(slug);
		const base = bySlug.get(meta.baseProviderSlug);
		if (!variant || !base) {
			throw new Error(`pricing destination ${slug} missing row or base ${meta.baseProviderSlug}`);
		}
		validateStartUrl(slug, variant.startUrl, meta);
	}
}

/**
 * @param {readonly import('openquok-common').AutoLaunchDestinationSeedRow[]} rows
 * @param {readonly string[]} fixtureSlugs
 */
function validateManifestVsFixtures(rows, fixtureSlugs) {
	const manifestSlugs = new Set(rows.map((row) => row.providerSlug));
	for (const slug of fixtureSlugs) {
		if (!manifestSlugs.has(slug)) {
			throw new Error(`manifest missing destination row for fixture slug ${slug}`);
		}
	}
}

/**
 * Every shipped fixture slug must have a non-empty embed on INSERT (no `'{}'::jsonb` stub).
 *
 * @param {readonly import('openquok-common').AutoLaunchDestinationSeedRow[]} rows
 * @param {readonly string[]} fixtureSlugs
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
function validateFixtureSlugsEmbeddedInManifest(rows, fixtureSlugs, fixtures) {
	const manifestSlugs = new Set(rows.map((row) => row.providerSlug));
	for (const slug of fixtureSlugs) {
		if (!manifestSlugs.has(slug)) {
			throw new Error(`manifest missing destination row for fixture slug ${slug}`);
		}
		if (!fixtures[slug]) {
			throw new Error(`missing DIRECTORY_EXTENSION_CONFIG_FIXTURES entry for ${slug}`);
		}
	}
}

function parseArgs(argv) {
	const check = argv.includes("--check");
	const siteIdx = argv.indexOf("--site");
	const siteFilter = siteIdx >= 0 ? argv[siteIdx + 1] : undefined;
	return { check, siteFilter };
}

async function loadManifest() {
	try {
		await fs.access(commonDistIndex);
	} catch {
		console.error("common/dist missing. Run `pnpm common:build` first.");
		process.exit(1);
	}

	const {
		AUTO_LAUNCH_DESTINATION_SEED_MODULES,
		AUTO_LAUNCH_DESTINATION_SEED_ROWS,
		AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_END,
		AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_START,
		DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS,
	} = await import(commonDistIndex);
	const {
		AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS,
		AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED,
		UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	} = await import(commonDistSyncMetadata);
	const {
		validateIndependentExtensionFixtureSlugs,
		validatePricingQueueDestinationStartUrl,
		validatePricingQueueExtensionFixtures,
	} = await import(commonDistExtensionDerivation);

	validateManifestVsFixtures(
		AUTO_LAUNCH_DESTINATION_SEED_ROWS,
		DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS
	);
	validateFixtureSlugsEmbeddedInManifest(
		AUTO_LAUNCH_DESTINATION_SEED_ROWS,
		DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS,
		DIRECTORY_EXTENSION_CONFIG_FIXTURES
	);
	validatePricingQueueExtensionFixtures(
		DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED
	);
	validateIndependentExtensionFixtureSlugs(
		DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
		AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
	);
	validatePricingStartUrlDerived(
		AUTO_LAUNCH_DESTINATION_SEED_ROWS,
		AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED,
		validatePricingQueueDestinationStartUrl
	);

	return {
		modules: AUTO_LAUNCH_DESTINATION_SEED_MODULES,
		fixtures: DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		markerStart: AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_START,
		markerEnd: AUTO_LAUNCH_DESTINATION_SEEDS_GENERATED_MARKER_END,
	};
}

/**
 * @param {import('openquok-common').AutoLaunchDestinationSeedModule} module
 * @param {string} markerStart
 * @param {string} markerEnd
 * @param {Record<string, import('openquok-common').AutoLaunchExtensionConfig>} fixtures
 */
async function syncModule(module, markerStart, markerEnd, check, fixtures) {
	const outputPath = path.join(AUTO_LAUNCH_DB_DIR, module.sqlFileName);
	const generatedBlock = buildGeneratedDestinationSql(module, fixtures);

	if (module.generationMode === "full") {
		const expectedFull = buildFullModuleSql(module, fixtures);
		if (check) {
			let existing;
			try {
				existing = await fs.readFile(outputPath, "utf8");
			} catch {
				console.error(`Missing ${outputPath}. Run pnpm sync:auto-launch-destinations.`);
				process.exit(1);
			}
			if (existing !== expectedFull) {
				console.error(`${module.sqlFileName} is stale. Run pnpm sync:auto-launch-destinations.`);
				process.exit(1);
			}
			console.log(`OK ${module.sqlFileName} matches manifest.`);
			return;
		}
		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, expectedFull, "utf8");
		console.log(`Wrote ${outputPath} (full module).`);
		return;
	}

	// composite (Uneed)
	let existing;
	try {
		existing = await fs.readFile(outputPath, "utf8");
	} catch {
		console.error(`Missing ${outputPath} for composite module ${module.siteKey}.`);
		process.exit(1);
	}

	const spliced = spliceCompositeMarkers(existing, markerStart, markerEnd, generatedBlock);
	const expectedBlock = generatedBlock;

	if (check) {
		if (spliced !== null) {
			const innerStart = existing.indexOf(markerStart) + markerStart.length;
			const innerEnd = existing.indexOf(markerEnd);
			const inner = existing.slice(innerStart, innerEnd).trim();
			if (inner !== expectedBlock.trim()) {
				console.error(
					`${module.sqlFileName} generated block is stale. Run pnpm sync:auto-launch-destinations.`
				);
				process.exit(1);
			}
			console.log(`OK ${module.sqlFileName} composite block matches manifest.`);
			return;
		}

		const legacy = extractLegacyCompositeDestinationBlock(existing);
		if (legacy === null || legacy.trim() !== expectedBlock.trim()) {
			console.error(
				`${module.sqlFileName} destination block is stale (no markers). Run pnpm sync:auto-launch-destinations.`
			);
			process.exit(1);
		}
		console.log(`OK ${module.sqlFileName} legacy destination block matches manifest.`);
		return;
	}

	if (spliced !== null) {
		await fs.writeFile(outputPath, spliced, "utf8");
		console.log(`Updated ${outputPath} (composite markers).`);
		return;
	}

	console.warn(
		`Skipped write for ${module.sqlFileName}: add ${markerStart} / ${markerEnd} around destination SQL.`
	);
}

async function main() {
	const { check, siteFilter } = parseArgs(process.argv.slice(2));
	const { modules, fixtures, markerStart, markerEnd } = await loadManifest();

	const selected = siteFilter
		? modules.filter((module) => module.siteKey === siteFilter)
		: modules;

	if (siteFilter && selected.length === 0) {
		console.error(`Unknown --site ${siteFilter}`);
		process.exit(1);
	}

	for (const module of selected) {
		await syncModule(module, markerStart, markerEnd, check, fixtures);
	}
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}