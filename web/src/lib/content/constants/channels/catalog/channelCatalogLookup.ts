import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import { isPublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/directory-channel-slugs';
import { PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/directory-seeds';
import { PUBLIC_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/seeds';

const channelBySlug = new Map(
	PUBLIC_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page] as const)
);
const directoryChannelBySlug = new Map(
	PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES.map((page) => [page.slug, page] as const)
);

/** Social or directory catalog seed by slug — safe during `channels/index` init (no API re-import). */
export function getChannelSeedBySlug(key: string): PublicChannelLandingPageViewModel | undefined {
	const normalized = key.trim().toLowerCase();
	if (!normalized) return undefined;
	return channelBySlug.get(normalized) ?? directoryChannelBySlug.get(normalized);
}

export { isPublicDirectoryChannelSlug };
