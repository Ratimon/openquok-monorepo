import type { IconName } from '$data/icons';

import type { PublicChannelSiblingGridItem } from '$lib/content/utils/buildPublicChannelSiblingGridCopy';
import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import { icons } from '$data/icons';

import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { getChannelSeedBySlug } from '$lib/content/constants/channels/catalog/channelCatalogLookup';
import { resolveDirectoryChannelSlugForBuildBacklinksSite } from '$lib/link-directory/utils/site/resolveDirectoryChannelSlugForBuildBacklinksSite';
import { route } from '$lib/utils/path';

function resolveSiblingGridIcon(site: LinkDirectorySiteDto): IconName {
	const channelSlug = resolveDirectoryChannelSlugForBuildBacklinksSite(site);
	if (!channelSlug) return icons.Link.name;
	return getChannelSeedBySlug(channelSlug)?.icon ?? icons.Link.name;
}

export function buildBuildBacklinksCategorySiblingGridItems(
	sites: readonly LinkDirectorySiteDto[]
): PublicChannelSiblingGridItem[] {
	return sites.map((site) => ({
		slug: site.slug,
		platformLabel: site.title.trim(),
		icon: resolveSiblingGridIcon(site),
		href: route(getRootPathPublicBuildBacklinksSite(site.slug)),
		available: true
	}));
}