import { describe, expect, it } from 'vitest';

import { buildCompareDetailSocialFaqItems } from '$lib/content/constants/faq/buildCompareDetailFaqItems';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

describe('buildCompareDetailSocialFaqItems', () => {
	it('cross-links Postiz cluster pages on OpenQuok vs Postiz', () => {
		const items = buildCompareDetailSocialFaqItems('openquok', 'postiz');
		const lead = items[0];

		expect(lead?.title).toContain('OpenQuok vs Postiz');
		expect(lead?.description).toContain(publicFaqHref.compareMixpostPostiz);
		expect(lead?.description).toContain(publicFaqHref.comparePostizPostBridge);
		expect(lead?.description).toContain('/alternatives/postiz');
		expect(lead?.description).toContain(publicFaqHref.blogOpenquokVsPostiz);
	});

	it('cross-links OpenQuok vs Postiz and sibling peers on Mixpost vs Postiz', () => {
		const items = buildCompareDetailSocialFaqItems('mixpost', 'postiz');
		const lead = items[0];

		expect(lead?.title).toContain('Mixpost');
		expect(lead?.title).toContain('Postiz');
		expect(lead?.description).toContain(publicFaqHref.compareOpenquokPostiz);
		expect(lead?.description).toContain('/alternatives/postiz');
		expect(lead?.description).toContain(publicFaqHref.comparePostizPostBridge);
	});

	it('cross-links OpenQuok vs Postiz and Mixpost vs Postiz on Post Bridge vs Postiz', () => {
		const items = buildCompareDetailSocialFaqItems('post-bridge', 'postiz');
		const lead = items[0];

		expect(lead?.title).toContain('Postiz');
		expect(lead?.description).toContain(publicFaqHref.compareOpenquokPostiz);
		expect(lead?.description).toContain('/alternatives/postiz');
		expect(lead?.description).toContain(publicFaqHref.compareMixpostPostiz);
	});
});