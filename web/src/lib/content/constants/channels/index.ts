import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/seeds';

export * from '$lib/content/constants/channels/types';
export { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';
export { facebookChannel } from '$lib/content/constants/channels/facebook';
export { threadsChannel } from '$lib/content/constants/channels/threads';
export { instagramChannel } from '$lib/content/constants/channels/instagram';
export { youtubeChannel } from '$lib/content/constants/channels/youtube';
export { tiktokChannel } from '$lib/content/constants/channels/tiktok';
export { linkedinChannel } from '$lib/content/constants/channels/linkedin';
export { xChannel } from '$lib/content/constants/channels/x';
export { devtoChannel } from '$lib/content/constants/channels/devto';
export {
	PUBLIC_CHANNEL_LANDING_PAGES,
	listPublicChannelLandingSeedsForFooter
} from '$lib/content/constants/channels/seeds';

const channelBySlug = new Map(PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicChannelBySlug(slug: string): PublicChannelLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	const page = channelBySlug.get(key);
	if (!page) return undefined;

	return {
		...page,
		faqItems: appendPublicGeneralFaqItems(page.faqItems, PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS)
	};
}

export function listPublicChannelsForHub(): PublicChannelLandingPageViewModel[] {
	return [...PUBLIC_CHANNEL_LANDING_PAGES];
}

export function listAvailablePublicChannels(): PublicChannelLandingPageViewModel[] {
	return PUBLIC_CHANNEL_LANDING_PAGES.filter((page) => page.available);
}

/** Platform labels for competitor compare tables — includes `comparePlatformLabels` extras. */
export function listAvailablePublicChannelCompareLabels(): string[] {
	const labels: string[] = [];

	for (const channel of listAvailablePublicChannels()) {
		labels.push(channel.platformLabel);
		if (channel.comparePlatformLabels) {
			labels.push(...channel.comparePlatformLabels);
		}
	}

	return labels;
}
