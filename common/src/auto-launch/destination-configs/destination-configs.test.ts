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
import {
	getDirectoryLaunchSiteKeyFromLocation,
	resolveDirectoryLaunchStartUrl,
} from './directoryLaunchRegistry.js';
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
	NICK_LAUNCHES_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	INDIEHUB_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	ALTERNATIVETO_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	TRUSTPILOT_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
	UNEED_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
} from './syncMetadata.js';
import { directorySiteKeyFromProviderSlug } from '../directorySiteKey.js';

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
				'devhunt-paid-launch',
				'devhunt-standard-launch',
				'nick-launches-free-launch',
				'nick-launches-paid-launch',
				'nick-launches-maker-profile',
				'indiehub-basic-launch',
				'indiehub-pro-launch',
				'alternativeto-free-listing',
				'alternativeto-priority-review',
				'alternativeto-finish-listing',
				'alternativeto-user-profile',
				'trustpilot-company-profile',
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

	it('documents Nick Launches fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			NICK_LAUNCHES_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
			AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
		);
	});

	it('documents IndieHub fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			INDIEHUB_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
			AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
		);
	});

	it('documents AlternativeTo fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			ALTERNATIVETO_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
			AUTO_LAUNCH_EXTENSION_CONFIG_DERIVATIONS
		);
	});

	it('documents Trustpilot fixtures as independent (not pricing-queue)', () => {
		validateIndependentExtensionFixtureSlugs(
			DIRECTORY_EXTENSION_CONFIG_FIXTURES,
			TRUSTPILOT_INDEPENDENT_FIXTURE_PROVIDER_SLUGS,
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
			if (meta.readyUrlHint === 'pricing') {
				expect(variant?.startUrl).toMatch(/\/pricing\/?$/);
			} else {
				expect(variant?.startUrl).toContain(meta.readyUrlHint);
			}
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

	it('aggregated core_structure applies auto-launch 502 before 503–512', () => {
		const migrationsDir = join(REPO_ROOT, 'backend/supabase/migrations');
		const coreFiles = readdirSync(migrationsDir)
			.filter((name) => name.endsWith('_core_structure.sql'))
			.sort();
		expect(coreFiles.length).toBeGreaterThan(0);
		const latestCore = coreFiles[coreFiles.length - 1]!;
		const sql = readFileSync(join(migrationsDir, latestCore), 'utf8');
		const autoLaunchFiles = [...sql.matchAll(/-- Module: auto-launch, File: (5\d{2}_[^\n]+)/g)]
			.map((match) => match[1])
			.filter(
				(fileName) => /^50[2-9]_/.test(fileName ?? '') || /^51[0-2]_/.test(fileName ?? '')
			);
		expect(autoLaunchFiles).toEqual([
			'502_20261111_extension_configs.sql',
			'503_20261013_seed_uneed.sql',
			'504_20261016_seed_peerpush_destination.sql',
			'505_20261109_seed_open_launch_destination.sql',
			'506_20261117_seed_tinylaunch_destination.sql',
			'507_20261120_seed_fazier_destination.sql',
			'508_20261121_seed_devhunt_destination.sql',
			'509_20261124_seed_nick_launches_destination.sql',
			'510_20261125_seed_indiehub_destination.sql',
			'511_20261125_seed_alternativeto_destination.sql',
			'512_20261126_seed_trustpilot_destination.sql',
		]);
	});

	it('generated 502–512 destination SQL matches manifest (sync --check)', () => {
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

describe('Nick Launches site key', () => {
	it('maps provider slugs and the host to nick-launches', () => {
		expect(directorySiteKeyFromProviderSlug('nick-launches-free-launch')).toBe('nick-launches');
		expect(directorySiteKeyFromProviderSlug('nick-launches-maker-profile')).toBe('nick-launches');
		expect(getDirectoryLaunchSiteKeyFromLocation('nicklaunches.com')).toBe('nick-launches');
	});
});

describe('IndieHub site key', () => {
	it('maps provider slugs and the host to indiehub', () => {
		expect(directorySiteKeyFromProviderSlug('indiehub-basic-launch')).toBe('indiehub');
		expect(directorySiteKeyFromProviderSlug('indiehub-pro-launch')).toBe('indiehub');
		expect(getDirectoryLaunchSiteKeyFromLocation('indiehub.best')).toBe('indiehub');
	});
});

describe('AlternativeTo site key', () => {
	it('maps provider slugs and the host to alternativeto', () => {
		expect(directorySiteKeyFromProviderSlug('alternativeto-free-listing')).toBe('alternativeto');
		expect(directorySiteKeyFromProviderSlug('alternativeto-user-profile')).toBe('alternativeto');
		expect(getDirectoryLaunchSiteKeyFromLocation('alternativeto.net')).toBe('alternativeto');
	});
});

describe('AlternativeTo extension fixtures', () => {
	it('caps gallery screenshots on manage-item', () => {
		const listing = DIRECTORY_EXTENSION_CONFIG_FIXTURES['alternativeto-free-listing'];
		const mediaStep = listing?.steps?.find((step) => step.id === 'media');
		const fields = mediaStep?.fields ?? [];
		expect(fields.find((f) => f.key === 'gallery')?.maxItems).toBe(5);
	});

	it('uses manage-item and user/edit readyUrlHints per destination', () => {
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['alternativeto-free-listing']?.readyUrlHint).toBe(
			'manage-item'
		);
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['alternativeto-user-profile']?.readyUrlHint).toBe(
			'user/edit'
		);
	});
});

describe('IndieHub extension fixtures', () => {
	it('caps cover image to a single file on Details', () => {
		const basic = DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-basic-launch'];
		const fields = basic?.steps?.[0]?.fields ?? [];
		expect(fields.find((f) => f.key === 'cover')?.maxItems).toBe(1);
	});

	it('uses submit readyUrlHint for both tiers', () => {
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-basic-launch']?.readyUrlHint).toBe('submit');
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-pro-launch']?.readyUrlHint).toBe('submit');
	});
});

describe('Nick Launches extension fixtures', () => {
	it('caps gallery and category fields per listing form rules', () => {
		const listing = DIRECTORY_EXTENSION_CONFIG_FIXTURES['nick-launches-free-launch'];
		const fields = listing?.steps?.[0]?.fields ?? [];
		expect(fields.find((f) => f.key === 'gallery')?.maxItems).toBe(5);
		expect(fields.find((f) => f.key === 'categories')?.maxItems).toBe(3);
	});

	it('uses submit/new and profile readyUrlHints per destination', () => {
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['nick-launches-free-launch']?.readyUrlHint).toBe(
			'submit/new'
		);
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['nick-launches-maker-profile']?.readyUrlHint).toBe(
			'profile'
		);
	});
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
