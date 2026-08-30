import { describe, expect, it } from 'vitest';

import { buildHumanizeFaqSection } from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';

describe('buildHumanizeFaqSection', () => {
	it('returns generic copy when no channel is set', () => {
		const section = buildHumanizeFaqSection();
		expect(section.faqTitle).toBe('Humanizer, answered');
		expect(section.faqItems.length).toBeGreaterThan(0);
		expect(section.faqItems.some((item) => item.title.includes('Human vs Roughen'))).toBe(true);
		expect(
			section.faqItems.some((item) =>
				item.description.toLowerCase().includes('do not claim outcomes against any writing classifier')
			)
		).toBe(true);
		expect(section.faqItems.every((item) => !/bypass|detector|homoglyph/i.test(item.description))).toBe(
			true
		);

		const accountFaq = section.faqItems.find((item) => item.title === 'Do I need an OpenQuok account?');
		expect(accountFaq?.description.toLowerCase()).toContain('without an account');
		expect(accountFaq?.description.toLowerCase()).toContain('samples');
		expect(accountFaq?.description.toLowerCase()).toContain('connect real accounts');
		expect(accountFaq?.description.toLowerCase()).not.toContain('connected channels');

		const contributeFaq = section.faqItems.find(
			(item) => item.title === 'Can I contribute a new Humanizer language?'
		);
		expect(contributeFaq).toBeDefined();
		expect(contributeFaq?.description).toContain('/docs/contribution-opportunities/humanizer-languages');
	});

	it('tailors platform copy when a channel slug and label are set', () => {
		const section = buildHumanizeFaqSection('linkedin', 'LinkedIn');
		expect(section.faqTitle).toBe('LinkedIn Humanizer, answered');
		expect(section.faqItems.some((item) => item.title.includes('LinkedIn'))).toBe(true);
		expect(section.faqItems.some((item) => item.description.includes('LinkedIn'))).toBe(true);
		expect(section.faqItems.every((item) => !/bypass|detector|homoglyph/i.test(item.description))).toBe(
			true
		);

		const accountFaq = section.faqItems.find((item) => item.title === 'Do I need an OpenQuok account?');
		expect(accountFaq?.description.toLowerCase()).toContain('samples');
		expect(accountFaq?.description.toLowerCase()).not.toContain('connected channels');

		const platformFaq = section.faqItems.find((item) => item.title.includes('LinkedIn'));
		expect(platformFaq?.description.toLowerCase()).toContain('connect a real linkedin');
		expect(platformFaq?.description.toLowerCase()).toContain('sample chip');
		expect(platformFaq?.description.toLowerCase()).not.toContain('your connected');
	});
});
