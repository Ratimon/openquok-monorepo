import { describe, expect, it } from 'vitest';

import { PublicAlternativesPagePresenter } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import { PublicComparePagePresenter } from '$lib/area-public/PublicComparePage.presenter.svelte';
import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
import { PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG } from '$lib/content/constants/marketing/social-autopilot-landing';
import { getComparePair } from '$lib/content/constants/competitors';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { buildAlternativesDetailMetaTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import { isHostedMarketingPath } from '$lib/utils/hostedMarketingHref';

const alternativesPresenter = new PublicAlternativesPagePresenter();
const comparePresenter = new PublicComparePagePresenter();

/**
 * Engineering stand-in for WS11 GSC URL Inspection (rendering + meta + JSON-LD).
 * Live Search Console checks remain manual — see docs/seo/research/2026-11-21-gsc-scheduler-hub.md § WS11.
 */
describe('GSC scheduler WS11 — on-page SEO contracts', () => {
	it('exposes one query-shaped H1 source for /social-media-management', () => {
		const [heroLine1] = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.hero.title.split('\n');
		expect(heroLine1?.toLowerCase()).toBe('agentic social media scheduler');
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.metaTitle).toBe('Agentic Social Media Scheduler');
	});

	it('exposes one H1 title for /alternatives/buffer', () => {
		const vm = alternativesPresenter.buildDetailVm('buffer');
		expect(vm).not.toBeNull();
		expect(vm!.title).toBe('Buffer alternatives');
		expect(
			buildAlternativesDetailMetaTitle('Buffer', 'social_scheduling', 'buffer')
		).toMatch(/Buffer Alternatives/i);
	});

	it('exposes one H1 title for /compare/openquok/postiz', () => {
		const pair = getComparePair('openquok', 'postiz');
		expect(pair).not.toBeNull();
		expect(pair!.heroTitle).toBe('OpenQuok vs Postiz: Compare Side by Side');

		const vm = comparePresenter.buildDetailVm(pair!);
		expect(vm).not.toBeNull();
		expect(vm!.heroTitle).toBe(pair!.heroTitle);
	});

	it('keeps FAQPage JSON-LD aligned with visible social-autopilot FAQ items', () => {
		const faqSection = getPublicMarketingLandingFaqSection('social-autopilot');
		const schema = createPublicFaqSEOSchema({
			pageUrl: 'https://www.openquok.com/social-media-management#faq',
			name: faqSection.faqTitle,
			description: faqSection.faqDescription,
			items: faqSection.faqItems
		});

		expect(schema['@type']).toBe('FAQPage');
		const mainEntity = (schema as { mainEntity?: { name: string }[] }).mainEntity ?? [];
		expect(mainEntity).toHaveLength(faqSection.faqItems.length);
		for (let i = 0; i < faqSection.faqItems.length; i++) {
			expect(mainEntity[i]?.name).toBe(faqSection.faqItems[i]?.title);
		}
	});

	it('uses crawlable hosted-marketing hrefs on scheduler hub related link cards', () => {
		for (const item of PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.relatedLinksSection.items) {
			expect(item.href.startsWith('/')).toBe(true);
			expect(item.href).not.toContain('nofollow');
			expect(isHostedMarketingPath(item.href)).toBe(true);
		}
	});
});