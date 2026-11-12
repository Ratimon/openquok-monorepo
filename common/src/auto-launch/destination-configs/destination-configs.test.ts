import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
	LAUNCH_STEP_FIELD_FILL_MODES,
	type AutoLaunchExtensionConfig,
} from '../../browser-extension/pageAssist.js';
import {
	DIRECTORY_EXTENSION_CONFIG_FIXTURES,
	DIRECTORY_EXTENSION_CONFIG_PROVIDER_SLUGS,
	directoryLaunchProviders,
} from './index.js';
import { resolveDirectoryLaunchStartUrl } from './directoryLaunchRegistry.js';
import { AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED } from './syncMetadata.js';

const REPO_ROOT = join(__dirname, '../../../../');
const SYNC_SCRIPT = join(REPO_ROOT, 'backend/scripts/sync-auto-launch-extension-configs.mjs');
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
		for (const [slug, meta] of Object.entries(
			AUTO_LAUNCH_EXTENSION_CONFIG_PRICING_READY_HINT_DERIVED
		)) {
			const base = DIRECTORY_EXTENSION_CONFIG_FIXTURES[meta.baseProviderSlug];
			const variant = DIRECTORY_EXTENSION_CONFIG_FIXTURES[slug];
			expect(variant?.readyUrlHint).toBe('pricing');
			expect({ ...base, readyUrlHint: 'pricing' }).toEqual(variant);
		}
	});

	it('generated 505_* extension_configs.sql matches fixtures (sync --check)', () => {
		if (!existsSync(COMMON_DIST_INDEX)) {
			throw new Error(
				'common/dist missing. Run `pnpm common:build` before `pnpm --filter openquok-common test:unit`.'
			);
		}
		expect(() => {
			execFileSync(process.execPath, [SYNC_SCRIPT, '--check'], {
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
