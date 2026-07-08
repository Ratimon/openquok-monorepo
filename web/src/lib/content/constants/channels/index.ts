import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';

import { facebookChannel } from '$lib/content/constants/channels/facebook';
import { threadsChannel } from '$lib/content/constants/channels/threads';
import { instagramChannel } from '$lib/content/constants/channels/instagram';
import { youtubeChannel } from '$lib/content/constants/channels/youtube';
import { tiktokChannel } from '$lib/content/constants/channels/tiktok';
import { linkedinChannel } from '$lib/content/constants/channels/linkedin';
import { xChannel } from '$lib/content/constants/channels/x';

export * from '$lib/content/constants/channels/types';
export { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';
export { facebookChannel } from '$lib/content/constants/channels/facebook';
export { threadsChannel } from '$lib/content/constants/channels/threads';
export { instagramChannel } from '$lib/content/constants/channels/instagram';
export { youtubeChannel } from '$lib/content/constants/channels/youtube';
export { tiktokChannel } from '$lib/content/constants/channels/tiktok';
export { linkedinChannel } from '$lib/content/constants/channels/linkedin';
export { xChannel } from '$lib/content/constants/channels/x';

/** Coming-soon entries appear on the hub but do not have detail pages yet. */
const COMING_SOON_CHANNELS: PublicChannelLandingPageViewModel[] = [];

export const PUBLIC_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPageViewModel[] = [
	facebookChannel,
	threadsChannel,
	instagramChannel,
	youtubeChannel,
	tiktokChannel,
	linkedinChannel,
	xChannel,
	...COMING_SOON_CHANNELS
];

const channelBySlug = new Map(PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page]));

export function getPublicChannelBySlug(slug: string): PublicChannelLandingPageViewModel | undefined {
	const key = slug.trim().toLowerCase();
	return channelBySlug.get(key);
}

export function getAvailablePublicChannelBySlug(slug: string): PublicChannelLandingPageViewModel | undefined {
	const page = getPublicChannelBySlug(slug);
	if (!page?.available) return undefined;
	return page;
}

export function listPublicChannelsForHub(): PublicChannelLandingPageViewModel[] {
	return [...PUBLIC_CHANNEL_LANDING_PAGES];
}

export function listAvailablePublicChannels(): PublicChannelLandingPageViewModel[] {
	return PUBLIC_CHANNEL_LANDING_PAGES.filter((page) => page.available);
}
