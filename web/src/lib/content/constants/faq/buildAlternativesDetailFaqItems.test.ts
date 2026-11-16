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

		expect(items[0]?.title).toBe('What are the best Hootsuite alternatives?');
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

	it('links Postiz switch FAQ to the vs Postiz blog and Reddit guide', () => {
		const items = buildAlternativesDetailFaqItems({
			targetName: 'Postiz',
			targetSlug: 'postiz',
			isDirectoryTarget: false
		});

		expect(items[0]?.title).toBe('What are the best Postiz alternatives?');
		expect(items[0]?.description).toContain(publicFaqHref.blogOpenquokVsPostiz);
		expect(items[0]?.description).toContain(publicFaqHref.blogRedditAgents);
	});

	it('honors faqSwitchTitle override from alternativesSeo', () => {
		const items = buildAlternativesDetailFaqItems({
			targetName: 'Later',
			targetSlug: 'later',
			isDirectoryTarget: false,
			faqSwitchTitle: 'Custom Later switch headline'
		});

		expect(items[0]?.title).toBe('Custom Later switch headline');
	});

	it('cross-links Postiz alternatives and compare for Later, Socialync, and Buffer', () => {
		for (const targetSlug of ['later', 'socialync', 'buffer'] as const) {
			const items = buildAlternativesDetailFaqItems({
				targetName: 'Test',
				targetSlug,
				isDirectoryTarget: false
			});

			expect(items[0]?.description).toContain(publicFaqHref.compareOpenquokPostiz);
			expect(items[0]?.description).toContain('/alternatives/postiz');
			expect(items[1]?.title).toContain('open-source schedulers');
			expect(items[1]?.description).toContain('/alternatives/postiz');
		}
	});

	it('links emphasized peer compare pages for Blotato, RecurPost, Postiz, and Mixpost', () => {
		const blotato = buildAlternativesDetailFaqItems({
			targetName: 'Blotato',
			targetSlug: 'blotato',
			isDirectoryTarget: false
		});
		expect(blotato[1]?.description).toContain(publicFaqHref.compareBlotatoBuffer);

		const recurpost = buildAlternativesDetailFaqItems({
			targetName: 'RecurPost',
			targetSlug: 'recurpost',
			isDirectoryTarget: false
		});
		expect(recurpost[1]?.description).toContain(publicFaqHref.compareRecurpostBuffer);

		const postiz = buildAlternativesDetailFaqItems({
			targetName: 'Postiz',
			targetSlug: 'postiz',
			isDirectoryTarget: false
		});
		expect(postiz[1]?.description).toContain(publicFaqHref.compareMixpostPostiz);
		expect(postiz[1]?.description).toContain(publicFaqHref.comparePostizPostBridge);

		const mixpost = buildAlternativesDetailFaqItems({
			targetName: 'Mixpost',
			targetSlug: 'mixpost',
			isDirectoryTarget: false
		});
		expect(mixpost[1]?.description).toContain(publicFaqHref.compareMixpostPostiz);
	});

	it('uses an OpenQuok-specific lead question on the OpenQuok alternatives page', () => {
		const items = buildAlternativesDetailFaqItems({
			targetName: 'OpenQuok',
			targetSlug: 'openquok',
			isDirectoryTarget: false
		});

		expect(items[0]?.title).toBe('What are common OpenQuok alternatives?');
		expect(items[0]?.description).not.toContain('Why switch from OpenQuok to OpenQuok');
		expect(items[0]?.description).toContain(publicFaqHref.compare);
	});
});
