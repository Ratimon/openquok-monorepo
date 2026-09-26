import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';

import { facebookChannel } from '$lib/content/constants/channels/facebook';
import { threadsChannel } from '$lib/content/constants/channels/threads';
import { instagramChannel } from '$lib/content/constants/channels/instagram';
import { youtubeChannel } from '$lib/content/constants/channels/youtube';
import { tiktokChannel } from '$lib/content/constants/channels/tiktok';
import { linkedinChannel } from '$lib/content/constants/channels/linkedin';
import { xChannel } from '$lib/content/constants/channels/x';
import { devtoChannel } from '$lib/content/constants/channels/devto';
import { blueskyChannel } from '$lib/content/constants/channels/bluesky';

/** Coming-soon entries appear on the hub but do not have detail pages yet. */
const COMING_SOON_CHANNELS: PublicChannelLandingPageViewModel[] = [];

/** Single registry for channel landings — order drives hub, nav, and footer columns. */
export const PUBLIC_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPageViewModel[] = [
	facebookChannel,
	threadsChannel,
	instagramChannel,
	youtubeChannel,
	tiktokChannel,
	linkedinChannel,
	xChannel,
	devtoChannel,
	blueskyChannel,
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
