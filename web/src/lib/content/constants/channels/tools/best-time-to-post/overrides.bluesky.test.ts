import { describe, expect, it } from 'vitest';

import { buildBestTimeToPostFaqSection } from '$lib/content/constants/channels/tools/best-time-to-post/faq';
import { getBestTimeChannelBySlug } from '$lib/content/constants/channels/tools/best-time-to-post/general';

describe('best-time-to-post Bluesky content override', () => {
	it('merges CTR meta title without No Sign Up and keeps channel keywords', () => {
		const config = getBestTimeChannelBySlug('bluesky');
		expect(config).toBeDefined();
		expect(config?.metaTitle).toContain('2026');
		expect(config?.metaTitle).toContain('Free Test Plan');
		expect(config?.metaTitle).not.toContain('No Sign Up');
		expect(config?.keywords.length).toBeGreaterThan(0);
		expect(config?.keywords.some((k) => k.toLowerCase().includes('bluesky'))).toBe(true);
		expect(config?.seoIntro?.highlights?.length).toBe(3);
		expect(config?.seoIntro?.paragraphs?.[0]).toMatch(/public timing research|open-source/i);
		expect(config?.seoIntro?.benchmarkTableRows?.length).toBe(7);
	});

	it('includes Bluesky 2026 timing FAQ before appended hub items', () => {
		const section = buildBestTimeToPostFaqSection('bluesky', 'Bluesky');
		const titles = section.faqItems.map((item) => item.title);
		expect(titles).toContain('What are good times to post on Bluesky in 2026?');

		const timingItem = section.faqItems.find(
			(item) => item.title === 'What are good times to post on Bluesky in 2026?'
		);
		expect(timingItem?.description).toContain('<table>');
		expect(timingItem?.description).toMatch(/not your personal peak/i);

		const sourcesItem = section.faqItems.find(
			(item) => item.title === 'Where do the suggested clock times come from?'
		);
		expect(sourcesItem?.description).toMatch(/weekend|weekday/i);
		expect(sourcesItem?.description).toContain('benchmarkSlots.ts');
		expect(sourcesItem?.description).toContain('github.com/Ratimon/openquok-monorepo');
		expect(sourcesItem?.description).toMatch(/public timing research/i);

		expect(titles).toContain('How did OpenQuok choose these Bluesky times?');
		expect(titles).toContain('What does the internet say is the best time to post on Bluesky?');
		expect(titles).toContain('How does the Bluesky feed work — does timing matter?');
	});
});
