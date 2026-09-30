import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/seeds';

export * from '$lib/content/constants/channels/catalog/types';
export { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/catalog/shared';
export { facebookChannel } from '$lib/content/constants/channels/catalog/platforms/facebook';
export { threadsChannel } from '$lib/content/constants/channels/catalog/platforms/threads';
export { instagramChannel } from '$lib/content/constants/channels/catalog/platforms/instagram';
export { youtubeChannel } from '$lib/content/constants/channels/catalog/platforms/youtube';
export { tiktokChannel } from '$lib/content/constants/channels/catalog/platforms/tiktok';
export { linkedinChannel } from '$lib/content/constants/channels/catalog/platforms/linkedin';
export { xChannel } from '$lib/content/constants/channels/catalog/platforms/x';
export { devtoChannel } from '$lib/content/constants/channels/catalog/platforms/devto';
export { blueskyChannel } from '$lib/content/constants/channels/catalog/platforms/bluesky';
export {
	PUBLIC_CHANNEL_LANDING_PAGES,
	listPublicChannelLandingSeedsForFooter
} from '$lib/content/constants/channels/catalog/seeds';

const channelBySlug = new Map(PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page]));

/** Optional fourth WhoIsFor card from `audienceTailoredCard` on the channel seed. */
export function getPublicChannelAudienceTailoredCard(
	slug: string
): AudienceCard | undefined {
	const key = slug.trim().toLowerCase();
	return channelBySlug.get(key)?.audienceTailoredCard;
}

/** Append `audienceTailoredCard` when present (channel, agent×channel, API platform pages). */
export function resolvePublicChannelAudienceCards(
	baseCards: readonly AudienceCard[],
	slug: string
): AudienceCard[] {
	const tailored = getPublicChannelAudienceTailoredCard(slug);
	return tailored ? [...baseCards, tailored] : [...baseCards];
}

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
