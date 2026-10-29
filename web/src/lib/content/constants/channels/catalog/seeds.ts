import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import {
	blueskyChannel,
	devtoChannel,
	facebookChannel,
	instagramChannel,
	linkedinChannel,
	redditChannel,
	skoolChannel,
	threadsChannel,
	tiktokChannel,
	xChannel,
	youtubeChannel
} from '$lib/content/constants/channels/catalog/platforms/index';

/** Coming-soon entries appear on the hub but do not have detail pages yet. */
const COMING_SOON_CHANNELS: PublicChannelLandingPageViewModel[] = [];

/** Single registry for channel landings — order drives hub, nav, and footer columns. */
export const PUBLIC_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPageViewModel[] = [
	facebookChannel,
	instagramChannel,
	threadsChannel,
	youtubeChannel,
	tiktokChannel,
	linkedinChannel,
	xChannel,
	blueskyChannel,
	redditChannel,
	devtoChannel,
	skoolChannel,
	...COMING_SOON_CHANNELS
];

export type PublicChannelFooterEntry = { slug: string; label: string };

/** Footer list derived from `PUBLIC_CHANNEL_LANDING_PAGES`. */
export function listPublicChannelLandingSeedsForFooter(): PublicChannelFooterEntry[] {
	return PUBLIC_CHANNEL_LANDING_PAGES.map(({ slug, platformLabel }) => ({
		slug,
		label: platformLabel
	}));
}
