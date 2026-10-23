import { describe, expect, it } from 'vitest';

import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/faq';
import {
	buildDirectoryLaunchDrGuaranteeFaqItem,
	DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE,
	insertDirectoryLaunchDrGuaranteeFaqItems,
	PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION,
	PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION
} from '$lib/content/constants/faq/marketing';
import { buildPublicHomeLandingFaqItems } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
import { faqHrefDocs, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

describe('PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION', () => {
	it('lists shared catalog FAQs before page-specific copy', () => {
		const items = PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION.faqItems;

		expect(items[0]?.id).toBe('switch-from-buffer-hootsuite');
		expect(items.at(-1)?.title).toBe('Can I schedule from Grok Bot or other agent hosts?');
		expect(items.at(-2)?.title).toBe('Do agents post without my approval?');
	});

	it('includes catalog and agent-host links without duplicate channel or MCP primers', () => {
		const items = PUBLIC_SOCIAL_AUTOPILOT_LANDING_FAQ_SECTION.faqItems;
		const html = items.map((item) => item.description).join(' ');
		const titles = items.map((item) => item.title);

		expect(html).toContain('/compare/openquok/buffer');
		expect(html).toContain(`href="${publicFaqHref.grokBotLanding}"`);
		expect(html).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
		expect(items.some((item) => item.id === 'what-is-mcp')).toBe(true);
		expect(items.some((item) => item.id === 'what-is-channel')).toBe(true);
		expect(titles).not.toContain('How do MCP and the CLI fit in?');
		expect(titles).not.toContain('Which social channels can I connect?');
	});
});

describe('PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION', () => {
	it('includes sign-up and directory docs links in tailored FAQ answers', () => {
		const html = PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION.faqItems
			.map((item) => item.description)
			.join(' ');

		expect(html).toContain(`href="${publicFaqHref.signUp}"`);
		expect(html).toContain(`href="${faqHrefDocs('directory-submission')}"`);
		expect(html).toContain(`href="${faqHrefDocs('installation/chrome-extension')}"`);
	});

	it('includes DR expectations FAQ with analytics links and no refund copy', () => {
		const item = PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION.faqItems.find(
			(row) => row.title === DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE
		);
		expect(item).toBeDefined();
		expect(item!.title).not.toMatch(/refund/i);
		const html = item!.description;
		expect(html.toLowerCase()).toContain('do not guarantee');
		expect(html).toContain(`href="${publicFaqHref.docsInsights}"`);
		expect(html).not.toMatch(/refund/i);
		expect(html).not.toMatch(/^\s*1\./);
	});

	it('dedupes DR FAQ when inserted onto channel catalog items', () => {
		const once = insertDirectoryLaunchDrGuaranteeFaqItems([]);
		const twice = insertDirectoryLaunchDrGuaranteeFaqItems(once);
		expect(twice.filter((row) => row.title === DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE)).toHaveLength(
			1
		);
	});

	it('tailors platform label for directory channel pages and home merge', () => {
		const peerpush = getPublicChannelBySlug('peerpush');
		const channelItem = peerpush?.faqItems.find(
			(row) => row.title === DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE
		);
		expect(channelItem?.description).toContain('PeerPush');
		expect(buildDirectoryLaunchDrGuaranteeFaqItem().description).not.toContain('PeerPush');
		expect(
			buildPublicHomeLandingFaqItems(PUBLIC_FAQ_ITEMS).some(
				(row) => row.title === DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE
			)
		).toBe(true);
	});
});
