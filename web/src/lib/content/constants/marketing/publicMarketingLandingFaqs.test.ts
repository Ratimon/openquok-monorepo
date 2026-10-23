import { describe, expect, it } from 'vitest';

import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/faq';
import {
	buildPublicHomeLandingFaqItems,
	getPublicMarketingLandingFaqSection,
	mergePublicMarketingLandingFaqItems
} from '$lib/content/constants/marketing/publicMarketingLandingFaqs';

describe('publicMarketingLandingFaqs', () => {
	it('exposes tailored social-autopilot FAQ copy', () => {
		const section = getPublicMarketingLandingFaqSection('social-autopilot');
		expect(section.faqTitle.toLowerCase()).toContain('agent');
		expect(section.faqItems.some((item) => item.title.includes('approval'))).toBe(true);
	});

	it('exposes tailored directory-submission FAQ copy', () => {
		const section = getPublicMarketingLandingFaqSection('directory-submission');
		expect(section.faqTitle.toLowerCase()).toContain('directory');
		expect(section.faqItems.some((item) => item.title.includes('blast'))).toBe(true);
		expect(section.faqItems.some((item) => /domain rating/i.test(item.title))).toBe(true);
	});

	it('dedupes shared general FAQ ids when merging marketing landings', () => {
		const merged = mergePublicMarketingLandingFaqItems();
		const tryFreeCount = merged.filter((item) => item.id === 'try-free').length;
		expect(tryFreeCount).toBeLessThanOrEqual(1);
		expect(getPublicMarketingLandingFaqSection('social-autopilot').faqItems.length).toBeGreaterThan(
			15
		);
	});

	it('places marketing landings before catalog items on home', () => {
		const home = buildPublicHomeLandingFaqItems(PUBLIC_FAQ_ITEMS);
		const socialItems = getPublicMarketingLandingFaqSection('social-autopilot').faqItems;
		expect(socialItems[0]?.id).toBe('switch-from-buffer-hootsuite');
		expect(home[0]?.id).toBe('switch-from-buffer-hootsuite');
		expect(home.length).toBeGreaterThan(PUBLIC_FAQ_ITEMS.length);
	});
});
