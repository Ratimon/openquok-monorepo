import { describe, expect, it } from 'vitest';

import { getRootPathPublicAlternativesTarget } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
import {
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG,
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH
} from '$lib/content/constants/marketing/social-autopilot-landing';
import { faqHrefComparePair, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { isHostedMarketingPath } from '$lib/utils/hostedMarketingHref';
import { route } from '$lib/utils/path';

describe('PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG', () => {
	it('resolves the public landing path from the root segment helper', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH).toBe(
			route(getRootPathPublicSocialAutopilotLanding())
		);
	});

	it('wires FAQ section from faq/marketing', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqTitle.toLowerCase()).toContain(
			'agentic social media scheduler'
		);
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems.length).toBeGreaterThan(10);
	});

	it('uses query-shaped SERP meta and hero copy', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.metaTitle).toBe('Agentic Social Media Scheduler');
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.metaDescription.toLowerCase()).toContain(
			'agentic social media scheduler'
		);
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.metaDescription.toLowerCase()).toContain('approve');
		const [heroLine1] = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.hero.title.split('\n');
		expect(heroLine1?.toLowerCase()).toBe('agentic social media scheduler');
	});

	it('mentions approval in the page-specific FAQ at the end', () => {
		const tailoredTail = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems.slice(-4);
		const faqText = tailoredTail.map((item) => `${item.title} ${item.description}`).join(' ');

		expect(faqText.toLowerCase()).toContain('approve');
	});

	it('links GSC-backed compare, alternatives, API, agents, and self-host routes', () => {
		const hrefs = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.relatedLinksSection.items.map(
			(item) => item.href
		);
		expect(hrefs).toContain(publicFaqHref.compareOpenquokPostiz);
		expect(hrefs).toContain(route(getRootPathPublicAlternativesTarget('postiz')));
		expect(hrefs).toContain(publicFaqHref.compareMixpostPostiz);
		expect(hrefs).toContain(faqHrefComparePair('postiz', 'mixpost'));
		expect(hrefs).toContain(publicFaqHref.compareOpenquokBuffer);
		expect(hrefs).toContain(route(getRootPathPublicAlternativesTarget('buffer')));
		expect(hrefs).toContain(route(getRootPathPublicAlternativesTarget('recurpost')));
		expect(hrefs).toContain(publicFaqHref.compare);
		expect(hrefs).toContain(route(getRootPathPublicAlternativesTarget('openquok')));
		expect(hrefs).toContain(publicFaqHref.socialMediaSchedulingApi);
		expect(hrefs).toContain(publicFaqHref.agents);
		expect(hrefs).toContain(publicFaqHref.selfHostingLanding);
	});

	it('keeps related link hrefs on hosted marketing paths for crawler discovery (WS11)', () => {
		for (const item of PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.relatedLinksSection.items) {
			expect(item.href.startsWith('/'), item.id).toBe(true);
			expect(isHostedMarketingPath(item.href), item.id).toBe(true);
		}
	});
});
