import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import {
	openLaunchDirectoryChannel,
	peerpushDirectoryChannel,
	uneedDirectoryChannel
} from '$lib/content/constants/channels/catalog/directory-platforms/index';

/** Directory launch landings on `/channels/{slug}` — not included in social hub tool derivations. */
export const PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPageViewModel[] =
	[peerpushDirectoryChannel, uneedDirectoryChannel, openLaunchDirectoryChannel];

export type PublicDirectoryChannelFooterEntry = { slug: string; label: string };

/** Footer list derived from `PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES`. */
export function listPublicDirectoryChannelLandingSeedsForFooter(): PublicDirectoryChannelFooterEntry[] {
	return PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES.map(({ slug, platformLabel }) => ({
		slug,
		label: platformLabel
	}));
}
