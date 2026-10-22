import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import {
	peerpushDirectoryChannel,
	uneedDirectoryChannel
} from '$lib/content/constants/channels/catalog/directory-platforms/index';

/** Directory launch landings on `/channels/{slug}` — not included in social hub tool derivations. */
export const PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES: readonly PublicChannelLandingPageViewModel[] =
	[peerpushDirectoryChannel, uneedDirectoryChannel];
