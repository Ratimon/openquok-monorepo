import { describe, expect, it } from 'vitest';

import { buildAlternativesDetailFaqItems } from '$lib/content/constants/faq/buildAlternativesDetailFaqItems';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

describe('buildAlternativesDetailFaqItems', () => {
	it('uses a target-specific switch question for social alternatives', () => {
		const items = buildAlternativesDetailFaqItems({
			targetName: 'Hootsuite',
			targetSlug: 'hootsuite',
			isDirectoryTarget: false
		});

		expect(items[0]?.title).toBe('Why switch from Hootsuite to OpenQuok?');
		expect(items[0]?.description).toContain('Hootsuite');
		expect(items[0]?.description).not.toContain('Buffer or Hootsuite');
		expect(items[0]?.description).toContain(publicFaqHref.compareOpenquokHootsuite);
		expect(items.map((item) => item.id)).not.toContain('switch-from-buffer-hootsuite');
	});

	it('uses a target-specific switch question for directory alternatives', () => {
		const items = buildAlternativesDetailFaqItems({
			targetName: 'BoringLaunch',
			targetSlug: 'boringlaunch',
			isDirectoryTarget: true
		});

		expect(items[0]?.title).toBe('Why switch from BoringLaunch to OpenQuok?');
		expect(items[0]?.description).toContain('BoringLaunch');
		expect(items[0]?.description).toContain('/alternatives/boringlaunch');
	});
});
