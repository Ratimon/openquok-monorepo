import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	LAUNCH_STEP_FIELD_FILL_MODES,
	type AutoLaunchExtensionConfig,
} from '../../browser-extension/pageAssist.js';
import {
	AUTO_LAUNCH_DESTINATION_SEED_PROVIDER_SLUGS,
	AUTO_LAUNCH_DESTINATION_SEED_ROWS,
	DIRECTORY_EXTENSION_CONFIG_FIXTURES,
	DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS,
	directoryLaunchProviders,
} from './index.js';
import { resolveDirectoryLaunchStartUrl } from './directoryLaunchRegistry.js';
import { AUTO_LAUNCH_DESTINATION_SEED_MODULES } from './destinationSeeds.js';
import {
	validateIndependentExtensionFixtureSlugs,
	validatePricingQueueExtensionFixtures,
} from './extensionConfigDerivation.js';
import {
	AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS,
	AUTO_LAUNCH_EXTENSION_CONFIGS_SQL,
	AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED,
	FAZIER_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
} from './syncMetadata.js';

const REPO_ROOT = join(__dirname, '../../../../');
const SYNC_CONFIGS_SCRIPT = join(REPO_ROOT, 'backend/scripts/sync-auto-launch-extension-configs.mjs');
const SYNC_DESTINATIONS_SCRIPT = join(
	REPO_ROOT,
	'backend/scripts/sync-auto-launch-destination-seeds.mjs'
);
const COMMON_DIST_INDEX = join(REPO_ROOT, 'common/dist/index.js');

/** Mirrors `pageMatchesConfig` / `wildcardToRegExp` in the extension step rail. */
function urlMatchesStartUrlPattern(href: string, pattern: string): boolean {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
	return new RegExp(`^${escaped}$`, 'i').test(href);
}

function assertFixtureShape(config: AutoLaunchExtensionConfig) {
	expect(config.version).toEqual(expect.any(Number));
	expect(config.startUrlPatterns?.length).toBeGreaterThan(0);
	expect(config.steps?.length).toBeGreaterThan(0);
	for (const step of config.steps ?? []) {
		expect(step.id).toEqual(expect.any(String));
		expect(step.label).toEqual(expect.any(String));
		for (const field of step.fields ?? []) {
			expect(field.key).toEqual(expect.any(String));
			expect(field.label).toEqual(expect.any(String));
			expect(field.profilePath).toEqual(expect.any(String));
			if (field.fillMode !== undefined) {
				expect(LAUNCH_STEP_FIELD_FILL_MODES).toContain(field.fillMode);
			}
		}
	}
}

describe('DIRECTORY_EXTENSION_CONFIG_FIXTURES', () => {
	it('lists every shipped provider slug in the registry', () => {
		expect(DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS.sort()).toEqual(
			[
				'open-launch-free-launch',
				'open-launch-premium-launch',
				'peerpush-free-queue',
				'peerpush-standard-launch',
				'uneed-join-line',
				'uneed-maker-profile',
				'uneed-paid-launch',
				'tinylaunch-premium-launch',
				'tinylaunch-standard-launch',
				'fazier-page',
				'fazier-free-product-listing',
				'fazier-paid-product-listing',
			].sort()
		);
	});

	it.each(DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS)(
		'%s fixture satisfies AutoLaunchExtensionConfig shape',
		(providerSlug) => {
			const fixture = DIRECTORY_EXTENSION_CONFIG_FIXTURES[providerSlug];
			assertFixtureShape(fixture);
		}
	);

	it('documents pricing-queue variants as readyUrlHint overrides', () => {
		validatePricingQueueExtensionFixtures(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED
		);
	});

	it('documents Uneed fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
			AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
		);
	});

	it('documents Fazier fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			FAZIER_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
			AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
		);
	});

	it('generated 502_* extension_configs.sql matches fixtures (sync --check)', () => {
		if (!existsSync(COMMON_DIST_INDEX)) {
			throw new Error(
				'common/dist missing. Run `pnpm common:build` before `pnpm --filter openquok-common test:unit`.'
			);
		}
		expect(() => {
			execFileSync(process.execPath, [SYNC_CONFIGS_SCRIPT, '--check'], {
				cwd: REPO_ROOT,
				encoding: 'utf8',
			});
		}).not.toThrow();
	});
});

describe('AUTO_LAUNCH_DESTINATION_SEED_ROWS', () => {
	it('lists every shipped extension fixture provider slug', () => {
		const manifestSlugs = new Set(AUTO_LAUNCH_DESTINATION_SEED_PROVIDER_SLUGS);
		for (const slug of DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS) {
			expect(manifestSlugs.has(slug)).toBe(true);
		}
	});

	it('uses unique destination ids and provider slugs', () => {
		const ids = AUTO_LAUNCH_DESTINATION_SEED_ROWS.map((row) => row.destinationId);
		const slugs = AUTO_LAUNCH_DESTINATION_SEED_ROWS.map((row) => row.providerSlug);
		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('documents pricing-queue destinations with pricing start_url', () => {
		const bySlug = new Map(
			AUTO_LAUNCH_DESTINATION_SEED_ROWS.map((row) => [row.providerSlug, row])
		);
		for (const [slug, meta] of Object.entries(AUTO_LAUNCH_PRICING_QUEUE_VARIANT_DERIVED)) {
			const variant = bySlug.get(slug);
			const base = bySlug.get(meta.baseProviderSlug);
			expect(variant?.startUrl).toMatch(/\/pricing\/?$/);
			expect(base).toBeDefined();
		}
	});

	it('extension_configs SQL filename sorts before every destination seed SQL module', () => {
		const configPrefix = Number.parseInt(AUTO_LAUNCH_EXTENSION_CONFIGS_SQL.slice(0, 3), 10);
		for (const module of AUTO_LAUNCH_DESTINATION_SEED_MODULES) {
			const seedPrefix = Number.parseInt(module.sqlFileName.slice(0, 3), 10);
			expect(configPrefix).toBeLessThan(seedPrefix);
		}
	});

	it('aggregated core_structure applies auto-launch 502 before 503–507', () => {
		const migrationsDir = join(REPO_ROOT, 'backend/supabase/migrations');
		const coreFiles = readdirSync(migrationsDir)
			.filter((name) => name.endsWith('_core_structure.sql'))
			.sort();
		expect(coreFiles.length).toBeGreaterThan(0);
		const latestCore = coreFiles[coreFiles.length - 1]!;
		const sql = readFileSync(join(migrationsDir, latestCore), 'utf8');
		const autoLaunchFiles = [...sql.matchAll(/-- Module: auto-launch, File: (5\d{2}_[^\n]+)/g)]
			.map((match) => match[1])
			.filter((fileName) => /^50[2-7]_/.test(fileName ?? ''));
		expect(autoLaunchFiles).toEqual([
			'502_20261111_extension_configs.sql',
			'503_20261013_seed_uneed.sql',
			'504_20261016_seed_peerpush_destination.sql',
			'505_20261109_seed_open_launch_destination.sql',
			'506_20261117_seed_tinylaunch_destination.sql',
			'507_20261120_seed_fazier_destination.sql',
		]);
	});

	it('generated 502–507 destination SQL matches manifest (sync --check)', () => {
		if (!existsSync(COMMON_DIST_INDEX)) {
			throw new Error(
				'common/dist missing. Run `pnpm common:build` before `pnpm --filter openquok-common test:unit`.'
			);
		}
		expect(() => {
			execFileSync(process.execPath, [SYNC_DESTINATIONS_SCRIPT, '--check'], {
				cwd: REPO_ROOT,
				encoding: 'utf8',
			});
		}).not.toThrow();
	});
});

describe('directoryLaunchProviders registry drift', () => {
	it('provider identifiers match DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS', () => {
		const providerIds = directoryLaunchProviders.map((provider) => provider.identifier).sort();
		const fixtureSlugs = [...DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS].sort();
		expect(providerIds).toEqual(fixtureSlugs);
	});

	it.each(directoryLaunchProviders.map((provider) => [provider.identifier, provider] as const))(
		'%s defaultStartUrl is covered by fixture startUrlPatterns',
		(providerSlug, provider) => {
			const fixture = DIRECTORY_EXTENSION_CONFIG_FIXTURES[providerSlug];
			expect(fixture).toBeDefined();
			const patterns = fixture?.startUrlPatterns ?? [];
			expect(patterns.length).toBeGreaterThan(0);
			const matches = patterns.some((pattern) =>
				urlMatchesStartUrlPattern(provider.defaultStartUrl, pattern)
			);
			expect(matches).toBe(true);
		}
	);
});

describe('resolveDirectoryLaunchStartUrl', () => {
	it('prefers registry defaultStartUrl over destination start_url', () => {
		expect(
			resolveDirectoryLaunchStartUrl(
				'uneed-join-line',
				'https://uneed.best/pricing'
			)
		).toBe('https://www.uneed.best/your-tools');
	});
});
