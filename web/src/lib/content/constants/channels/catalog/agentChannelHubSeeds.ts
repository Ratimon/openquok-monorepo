import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import { PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/directory-seeds';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/seeds';

/** Social + directory catalog rows for agent/MCP channel hub grids (no `channels/index` import). */
export const PUBLIC_AGENT_CHANNEL_HUB_CHANNELS: readonly PublicChannelLandingPageViewModel[] = [
	...PUBLIC_CHANNEL_LANDING_PAGES,
	...PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES
];
