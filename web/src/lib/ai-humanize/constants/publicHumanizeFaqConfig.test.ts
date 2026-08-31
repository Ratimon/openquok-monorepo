import { describe, expect, it } from 'vitest';

import { buildHumanizeFaqSection } from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';
import { assertNoNofollowOnFirstPartyFaqLinks } from '$lib/content/utils/publicFaqFunnel.test-utils';

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

		assertNoNofollowOnFirstPartyFaqLinks(section.faqItems);

		const accountFaq = section.faqItems.find(
			(item) => item.title === 'Do I need to sign up to use this free AI humanizer?'
		);
		expect(accountFaq?.description.toLowerCase()).toContain('without an account');
		expect(accountFaq?.description.toLowerCase()).toContain('sign up');
		expect(accountFaq?.description.toLowerCase()).toContain('samples');
		expect(accountFaq?.description.toLowerCase()).toContain('connect real accounts');
		expect(accountFaq?.description.toLowerCase()).not.toContain('connected channels');

		const freeFaq = section.faqItems.find((item) => item.title === 'Is OpenQuok Humanizer free?');
		expect(freeFaq?.description.toLowerCase()).toContain('no cost');
		expect(freeFaq?.description.toLowerCase()).toContain('free ai humanizer');

		const wordLimitFaq = section.faqItems.find(
			(item) => item.title === 'Is there a word or character limit?'
		);
		expect(wordLimitFaq?.description).toContain('500 characters');
		expect(wordLimitFaq?.description.toLowerCase()).toContain('no daily rewrite cap');

		const languagesFaq = section.faqItems.find(
			(item) => item.title === 'What languages does Humanizer support?'
		);
		expect(languagesFaq?.description.toLowerCase()).toContain('english');
		expect(languagesFaq?.description.toLowerCase()).toContain('thai');
		expect(languagesFaq?.description.toLowerCase()).toContain('french');

		const contributeFaq = section.faqItems.find(
			(item) => item.title === 'Can I contribute a new Humanizer language?'
		);
		expect(contributeFaq).toBeDefined();
		expect(contributeFaq?.description).toContain('href="/docs/contribution-opportunities/humanizer-languages"');

		const platformFaq = section.faqItems.find((item) => item.title.includes('specific platform'));
		expect(platformFaq?.description).toMatch(/href="\/channels"/);

		const chromeFaq = section.faqItems.find((item) => item.title === 'Does Humanizer require Chrome?');
		expect(chromeFaq?.description.toLowerCase()).toContain('experimental');
		expect(chromeFaq?.description.toLowerCase()).toContain('opt in');
		expect(chromeFaq?.description).toContain(
			'href="/blog/how-openquok-humanizer-rewrites-a-draft-in-the-browser"'
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

		const accountFaq = section.faqItems.find(
			(item) => item.title === 'Do I need to sign up to use this free AI humanizer?'
		);
		expect(accountFaq?.description.toLowerCase()).toContain('samples');
		expect(accountFaq?.description.toLowerCase()).not.toContain('connected channels');

		const whatIsFaq = section.faqItems.find(
			(item) => item.title === 'What is OpenQuok Humanizer?'
		);
		expect(whatIsFaq?.description).toMatch(/href="\/tools\/humanizer\/linkedin"/);

		const platformFaq = section.faqItems.find((item) => item.title.includes('LinkedIn'));
		expect(platformFaq?.description.toLowerCase()).toContain('connect a real linkedin');
		expect(platformFaq?.description.toLowerCase()).toContain('sample chip');
		expect(platformFaq?.description.toLowerCase()).not.toContain('your connected');
		expect(platformFaq?.description).toMatch(/href="\/docs\/getting-started-for-cli"/);
	});
});
