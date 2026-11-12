import { PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG } from 'openquok-common';
import { describe, expect, it } from 'vitest';

import { mergeExtensionConfigWithShippedFixture } from './shippedExtensionConfig.js';

describe('mergeExtensionConfigWithShippedFixture', () => {
	it('overlays discovery field metadata from the shipped PeerPush fixture', () => {
		const stale = {
			version: 1,
			steps: [
				{
					id: 'discovery',
					label: 'Discovery',
					fields: [
						{
							key: 'categories',
							label: 'Categories',
							profilePath: 'profile_data.categories',
							fillMode: 'tags' as const,
						},
					],
				},
			],
		};
		const merged = mergeExtensionConfigWithShippedFixture('peerpush-standard-launch', stale);
		const discovery = merged.steps?.find((step) => step.id === 'discovery');
		const categories = discovery?.fields?.find((f) => f.key === 'categories');
		const fixtureCategories = PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG.steps
			?.find((step) => step.id === 'discovery')
			?.fields?.find((f) => f.key === 'categories');
		expect(categories?.labelMatch).toBe('section');
		expect(categories?.tagsScope).toBe('section');
		expect(categories?.selectorHint).toBe(fixtureCategories?.selectorHint);
	});
});
