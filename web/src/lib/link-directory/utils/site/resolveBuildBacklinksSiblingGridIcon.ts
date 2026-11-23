import type { IconName } from '$data/icons';

import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import { icons } from '$data/icons';

import { getChannelSeedBySlug } from '$lib/content/constants/channels/catalog/channelCatalogLookup';
import { resolveChannelCatalogSlugForBuildBacklinksSite } from '$lib/link-directory/utils/site/resolveDirectoryChannelSlugForBuildBacklinksSite';

type BuildBacklinksSiteChannelRef = Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'>;

/** Browser extension store listings without a `/channels` landing. */
const BUILD_BACKLINKS_SITE_BRANDED_ICON_BY_SLUG: Record<string, IconName> = {
	'chrome-web-store': icons.GoogleChrome.name,
	'firefox-add-ons': icons.MozillaFirefox.name,
	'microsoft-edge-addons': icons.MicrosoftEdge.name
};

export function resolveBuildBacklinksSiblingGridIcon(site: BuildBacklinksSiteChannelRef): IconName {
	const channelSlug = resolveChannelCatalogSlugForBuildBacklinksSite(site);
	if (channelSlug) {
		const icon = getChannelSeedBySlug(channelSlug)?.icon;
		if (icon) return icon;
	}

	const siteSlug = site.slug.trim().toLowerCase();
	return BUILD_BACKLINKS_SITE_BRANDED_ICON_BY_SLUG[siteSlug] ?? icons.Link.name;
}