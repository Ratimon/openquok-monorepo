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
	});

	it('tailors platform copy when a channel slug and label are set', () => {
		const section = buildHumanizeFaqSection('linkedin', 'LinkedIn');
		expect(section.faqTitle).toBe('LinkedIn Humanizer, answered');
		expect(section.faqItems.some((item) => item.title.includes('LinkedIn'))).toBe(true);
		expect(section.faqItems.some((item) => item.description.includes('LinkedIn'))).toBe(true);
		expect(section.faqItems.every((item) => !/bypass|detector|homoglyph/i.test(item.description))).toBe(
			true
		);
	});
});
