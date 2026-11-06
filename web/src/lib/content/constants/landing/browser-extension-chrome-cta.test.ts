import { describe, expect, it } from 'vitest';

import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	isPublicBrowserExtensionHeroChannelSlug,
	PUBLIC_BROWSER_EXTENSION_HERO_CHANNEL_SLUGS,
	shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

describe('browser-extension-chrome-cta', () => {
	it('lists reddit and skool for extension hero CTAs', () => {
		expect(PUBLIC_BROWSER_EXTENSION_HERO_CHANNEL_SLUGS).toEqual(['reddit', 'skool']);
	});

	it('recognizes extension hero channel slugs', () => {
		expect(isPublicBrowserExtensionHeroChannelSlug('reddit')).toBe(true);
		expect(isPublicBrowserExtensionHeroChannelSlug('skool')).toBe(true);
		expect(isPublicBrowserExtensionHeroChannelSlug('youtube')).toBe(false);
	});

	it('returns a Chrome Web Store detail URL', () => {
		expect(getPublicBrowserExtensionChromeStoreCtaHref()).toMatch(
			/^https:\/\/chromewebstore\.google\.com\/detail\//
		);
	});

	it('shows Chrome store CTA on social extension channels and directory launch channels', () => {
		expect(shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding('skool', 'social')).toBe(
			true
		);
		expect(shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding('youtube', 'social')).toBe(
			false
		);
		expect(
			shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding('peerpush', 'directory')
		).toBe(true);
		expect(shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding('uneed', 'directory')).toBe(
			true
		);
	});
});
