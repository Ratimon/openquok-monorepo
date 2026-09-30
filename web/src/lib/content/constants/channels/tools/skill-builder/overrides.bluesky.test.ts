import { describe, expect, it } from 'vitest';

import { buildSkillBuilderFaqSection } from '$lib/content/constants/channels/tools/skill-builder/faq';
import { getSkillBuilderChannelBySlug } from '$lib/content/constants/channels/tools/skill-builder/general';

describe('skill-builder Bluesky content override', () => {
	it('merges hub description, meta description, and hero lead', () => {
		const config = getSkillBuilderChannelBySlug('bluesky');
		expect(config).toBeDefined();
		expect(config?.metaDescription).toMatch(/SKILL\.md|posts:create/i);
		expect(config?.hubDescription).toContain('posts:create');
		expect(config?.heroLead).toMatch(/CLI examples|posts:create/i);
		expect(config?.metaTitle).toContain('No Sign Up');
	});

	it('includes Bluesky agent skill FAQ with CLI examples link', () => {
		const section = buildSkillBuilderFaqSection('bluesky', 'Bluesky');
		const titles = section.faqItems.map((item) => item.title);
		expect(titles).toContain('How do I build a Bluesky agent skill?');

		const skillItem = section.faqItems.find(
			(item) => item.title === 'How do I build a Bluesky agent skill?'
		);
		expect(skillItem?.description).toContain('href="/docs/cli-examples/bluesky"');

		const includedItem = section.faqItems.find((item) => item.title === "What's included for Bluesky?");
		expect(includedItem?.description).toContain('href="/docs/cli-examples/bluesky"');
	});
});
