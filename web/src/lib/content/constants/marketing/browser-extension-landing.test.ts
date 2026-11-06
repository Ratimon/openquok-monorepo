import { describe, expect, it } from 'vitest';

import {
	PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG,
	PUBLIC_BROWSER_EXTENSION_LANDING_PATH
} from '$lib/content/constants/marketing/browser-extension-landing';
import { faqHrefDocs, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';
import { route } from '$lib/utils/path';
import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';

describe('PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG', () => {
	it('resolves the public landing path from the root segment helper', () => {
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_PATH).toBe(
			route(getRootPathPublicBrowserExtensionLanding())
		);
	});

	it('points primary CTA at the Chrome Web Store listing', () => {
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.primaryCta.href).toBe(
			getPublicBrowserExtensionChromeStoreCtaHref()
		);
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.primaryCta.label).toBe(
			PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL
		);
	});

	it('keeps install docs and how-it-works as secondary and tertiary hero CTAs', () => {
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.secondaryCta.href).toBe(
			faqHrefDocs('installation/chrome-extension')
		);
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.tertiaryCta.href).toBe(
			`${PUBLIC_BROWSER_EXTENSION_LANDING_PATH}#browser-extension-process`
		);
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.tertiaryCta.label).toBe('How it works');
	});

	it('includes install and connect links in tailored FAQ answers', () => {
		const html = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.faqSection.faqItems
			.map((item) => item.description)
			.join(' ');

		expect(html).toContain(`href="${faqHrefDocs('installation/chrome-extension')}"`);
		expect(html).toContain(`href="${publicFaqHref.connectChannelsGuide}"`);
	});

	it('defines a four-step setup process', () => {
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.processSection.steps).toHaveLength(4);
	});

	it('uses the chrome extension docs walkthrough for the demo video', () => {
		const { demoSection } = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG;
		expect(demoSection.youtubeVideoId).toBe('CU-BIS006oQ');
		expect(demoSection.thumbnailAlt.length).toBeGreaterThan(0);
	});

	it('uses Safari Chrome Web Store mock for the install step', () => {
		const step = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.processSection.steps[0];
		expect(step.deviceMock).toBe('safari');
		expect(step.deviceMockContent).toBe('chrome-web-store-openquok');
		expect(step.mockLinkHref).toMatch(/^https:\/\/chromewebstore\.google\.com\//);
	});

	it('uses Add Channel dialog bento for the connect step', () => {
		const step = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.processSection.steps[2];
		expect(step.marketingPanel).toBe('browser-extension-connect');
	});

	it('defines channel cross-link and agent integration sections', () => {
		const { channelCrossLinkSection, agentIntegrationsSection } =
			PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG;
		expect(channelCrossLinkSection.channelSlugs).toContain('reddit');
		expect(channelCrossLinkSection.channelSlugs).toContain('skool');
		expect(channelCrossLinkSection.title).toContain('extension');
		expect(agentIntegrationsSection.integrationChannelSlug).toBe('reddit');
	});

	it('links related SEO pages for Reddit and Skool channel landings', () => {
		const hrefs = PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.relatedLinksSection.items.map(
			(item) => item.href
		);
		expect(hrefs).toContain(route(getRootPathPublicChannel('reddit')));
		expect(hrefs).toContain(route(getRootPathPublicChannel('skool')));
	});

	it('does not lead with Skool in meta or hero copy', () => {
		const seoBlob = [
			PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.metaDescription,
			PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.description
		]
			.join(' ')
			.toLowerCase();

		expect(seoBlob).not.toContain('skool');
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.metaTitle.toLowerCase()).toContain(
			'social media scheduler browser extension'
		);
		expect(PUBLIC_BROWSER_EXTENSION_LANDING_CONFIG.hero.heroSocialPlatformsLabel).toContain(
			'Connect your accounts'
		);
	});
});
