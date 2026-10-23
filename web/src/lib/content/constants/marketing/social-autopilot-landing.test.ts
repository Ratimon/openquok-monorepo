import { describe, expect, it } from 'vitest';

import {
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG,
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH
} from '$lib/content/constants/marketing/social-autopilot-landing';
import { route } from '$lib/utils/path';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';

describe('PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG', () => {
	it('resolves the public landing path from the root segment helper', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH).toBe(
			route(getRootPathPublicSocialAutopilotLanding())
		);
	});

	it('wires FAQ section from faq/marketing', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqTitle).toContain(
			'agent-assisted scheduling'
		);
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems.length).toBeGreaterThan(10);
	});

	it('mentions approval in the page-specific FAQ at the end', () => {
		const lastTwo = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems.slice(-2);
		const faqText = lastTwo.map((item) => `${item.title} ${item.description}`).join(' ');

		expect(faqText.toLowerCase()).toContain('approve');
	});
});
