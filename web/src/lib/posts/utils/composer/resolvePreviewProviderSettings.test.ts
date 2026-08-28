import { describe, expect, it } from 'vitest';

import { readDevtoLaunchSettings } from '$lib/ui/components/posts/providers/devto/devto.provider';

import { resolvePreviewProviderSettings } from './resolvePreviewProviderSettings';

const DEVTO_INTEGRATION_ID = 'integration-devto-1';

describe('resolvePreviewProviderSettings', () => {
	it('returns settings for the preview integration id', () => {
		const devtoSettings = {
			devto: {
				title: 'Article 1',
				series: 'Launch diary',
				tags: [
					{ value: 'webdev', label: 'webdev' },
					{ value: 'svelte', label: 'svelte' }
				]
			}
		};
		const byIntegrationId = { [DEVTO_INTEGRATION_ID]: devtoSettings };

		expect(
			resolvePreviewProviderSettings(DEVTO_INTEGRATION_ID, byIntegrationId, {})
		).toEqual(devtoSettings);
	});

	it('feeds Dev.to preview title, tags, and series from the preview channel', () => {
		const byIntegrationId = {
			[DEVTO_INTEGRATION_ID]: {
				devto: {
					title: 'Article 1',
					series: 'Launch diary',
					tags: [
						{ value: 'webdev', label: 'webdev' },
						{ value: 'svelte', label: 'svelte' }
					]
				}
			}
		};

		const resolved = resolvePreviewProviderSettings(DEVTO_INTEGRATION_ID, byIntegrationId, {});
		const devto = readDevtoLaunchSettings(resolved);

		expect(devto.title).toBe('Article 1');
		expect(devto.series).toBe('Launch diary');
		expect(devto.tags.map((tag) => tag.label)).toEqual(['webdev', 'svelte']);
	});

	it('returns an empty object when the preview id is missing from the map', () => {
		expect(resolvePreviewProviderSettings(DEVTO_INTEGRATION_ID, {}, {})).toEqual({});
	});

	it('falls back to explicit preview settings when there is no preview integration id', () => {
		const fallback = {
			threads: { enabled: true, message: 'Fin' }
		};

		expect(resolvePreviewProviderSettings(null, { [DEVTO_INTEGRATION_ID]: { devto: { title: 'X' } } }, fallback)).toEqual(
			fallback
		);
		expect(resolvePreviewProviderSettings(undefined, {}, fallback)).toEqual(fallback);
	});

	it('does not use fallback when a preview integration id is set', () => {
		const fallback = { devto: { title: 'Stale fallback' } };
		const byIntegrationId = {
			[DEVTO_INTEGRATION_ID]: { devto: { title: 'Live title' } }
		};

		const resolved = resolvePreviewProviderSettings(DEVTO_INTEGRATION_ID, byIntegrationId, fallback);
		expect(readDevtoLaunchSettings(resolved).title).toBe('Live title');
	});
});
