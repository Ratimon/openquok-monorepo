import { isPublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/directory-channel-slugs';
import { getBrowserExtensionChromeWebStoreListingUrl } from '$lib/integrations/browser-extension/extensionConfig';

export const PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL = "Add to Chrome, it's free";

/** Shorter anchor text for docs and dense inline links (same Web Store URL as {@link PUBLIC_BROWSER_EXTENSION_CHROME_STORE_CTA_LABEL}). */
export const PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL = 'Chrome Web Store';

/** Channel landings that promote the OpenQuok browser extension (Skool connect, Reddit handoff). */
export const PUBLIC_BROWSER_EXTENSION_HERO_CHANNEL_SLUGS = ['reddit', 'skool'] as const;

export type PublicBrowserExtensionHeroChannelSlug =
	(typeof PUBLIC_BROWSER_EXTENSION_HERO_CHANNEL_SLUGS)[number];

export function getPublicBrowserExtensionChromeStoreCtaHref(): string {
	return getBrowserExtensionChromeWebStoreListingUrl();
}

export function isPublicBrowserExtensionHeroChannelSlug(
	slug: string
): slug is PublicBrowserExtensionHeroChannelSlug {
	return (PUBLIC_BROWSER_EXTENSION_HERO_CHANNEL_SLUGS as readonly string[]).includes(slug);
}

/** `/channels/{slug}` — social (Reddit/Skool) and directory launch (PeerPush, Uneed, …). */
export function shouldShowPublicBrowserExtensionChromeStoreCtaOnChannelLanding(
	slug: string,
	channelKind: 'social' | 'directory' | undefined
): boolean {
	if (channelKind === 'directory') {
		return isPublicDirectoryChannelSlug(slug);
	}
	return isPublicBrowserExtensionHeroChannelSlug(slug);
}
