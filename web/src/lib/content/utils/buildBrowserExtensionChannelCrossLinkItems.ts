import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getPublicChannelBySlug } from '$lib/content/constants/channels';
import type { PublicChannelSiblingGridItem } from '$lib/content/utils/buildPublicChannelSiblingGridCopy';
import { route } from '$lib/utils/path';

/** Build sibling-grid rows for `/browser-extension` from an ordered slug list. */
export function buildBrowserExtensionChannelCrossLinkItems(
	channelSlugs: readonly string[]
): PublicChannelSiblingGridItem[] {
	const items: PublicChannelSiblingGridItem[] = [];

	for (const rawSlug of channelSlugs) {
		const slug = rawSlug.trim().toLowerCase();
		if (!slug) continue;

		const channel = getPublicChannelBySlug(slug);
		if (!channel) continue;

		items.push({
			slug: channel.slug,
			platformLabel: channel.platformLabel,
			icon: channel.icon,
			href: route(getRootPathPublicChannel(channel.slug)),
			available: channel.available
		});
	}

	return items;
}
