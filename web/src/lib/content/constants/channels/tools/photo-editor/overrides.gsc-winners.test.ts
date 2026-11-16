import { describe, expect, it } from 'vitest';

import { buildPhotoEditorFaqSection } from '$lib/content/constants/channels/tools/photo-editor/faq';
import { getCanvasChannelBySlug } from '$lib/content/constants/channels/tools/photo-editor/general';
import { buildHumanizeFaqSection } from '$lib/content/constants/channels/tools/humanizer/faq';

const GSC_WINNER_SLUGS = ['threads', 'tiktok', 'linkedin'] as const;

describe('photo-editor GSC winner channel overrides', () => {
	it.each(GSC_WINNER_SLUGS)('keeps No Sign Up metaTitle for %s', (slug) => {
		const config = getCanvasChannelBySlug(slug);
		expect(config).toBeDefined();
		expect(config?.metaTitle).toMatch(/No Sign Up$/);
		expect(config?.metaTitle).not.toContain('|');
	});

	it.each(GSC_WINNER_SLUGS)('ships seoIntro and photo-editor FAQ for %s', (slug) => {
		const config = getCanvasChannelBySlug(slug);
		expect(config?.seoIntro?.heading).toBeTruthy();
		expect(config?.seoIntro?.paragraphs?.[0]?.length).toBeGreaterThan(20);

		const section = buildPhotoEditorFaqSection(slug, config?.platformLabel);
		const titles = section.faqItems.map((item) => item.title);
		expect(titles.some((title) => /free .* photo editor/i.test(title))).toBe(true);
	});
});

describe('humanizer GSC winner channel FAQs', () => {
	it.each(GSC_WINNER_SLUGS)('prepends channel-tailored humanizer FAQ for %s', (slug) => {
		const config = getCanvasChannelBySlug(slug);
		const section = buildHumanizeFaqSection(slug, config?.platformLabel);
		const firstTitle = section.faqItems[0]?.title ?? '';
		expect(firstTitle.toLowerCase()).toMatch(/humanizer/);
		expect(section.faqItems[0]?.description).toMatch(/href="\//);
	});
});