import { describe, expect, it } from 'vitest';

import {
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG,
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH
} from '$lib/content/constants/marketing/social-autopilot-landing';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';
import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';

describe('PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG', () => {
	it('resolves the public landing path from the root segment helper', () => {
		expect(PUBLIC_SOCIAL_AUTOPILOT_LANDING_PATH).toBe(
			route(getRootPathPublicSocialAutopilotLanding())
		);
	});

	it('lists shared catalog FAQs before page-specific copy', () => {
		const items = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems;

		expect(items[0]?.id).toBe('switch-from-buffer-hootsuite');
		expect(items.at(-1)?.title).toBe('Can I schedule from Grok Bot or other agent hosts?');
		expect(items.at(-2)?.title).toBe('Do agents post without my approval?');
	});

	it('includes catalog and agent-host links without duplicate channel or MCP primers', () => {
		const items = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems;
		const html = items.map((item) => item.description).join(' ');
		const titles = items.map((item) => item.title);

		expect(html).toContain('/compare/openquok/buffer');
		expect(html).toContain(`href="${publicFaqHref.grokBotLanding}"`);
		expect(html).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
		expect(items.some((item) => item.id === 'what-is-mcp')).toBe(true);
		expect(items.some((item) => item.id === 'what-is-channel')).toBe(true);
		expect(titles).not.toContain('How do MCP and the CLI fit in?');
		expect(titles).not.toContain('Which social channels can I connect?');
		expect(titles).not.toContain('Is this different from a basic social scheduler?');
	});

	it('mentions approval in the page-specific FAQ at the end', () => {
		const lastTwo = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG.faqSection.faqItems.slice(-2);
		const faqText = lastTwo.map((item) => `${item.title} ${item.description}`).join(' ');

		expect(faqText.toLowerCase()).toContain('approve');
	});
});
