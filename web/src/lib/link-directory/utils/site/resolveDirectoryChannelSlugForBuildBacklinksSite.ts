import type { LinkDirectorySiteDto } from '$lib/link-directory/link-directory.types';

import {
	getChannelSeedBySlug,
	isPublicDirectoryChannelSlug
} from '$lib/content/constants/channels/catalog/channelCatalogLookup';
import { PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/directory-seeds';

type BuildBacklinksSiteChannelRef = Pick<LinkDirectorySiteDto, 'slug' | 'openquokChannelSlug'>;

/** OpenQuok channel catalog slug when this build-backlinks site maps to a public channel (social or directory). */
export function resolveChannelCatalogSlugForBuildBacklinksSite(
	site: BuildBacklinksSiteChannelRef
): string | null {
	const channelFromSite = site.openquokChannelSlug?.trim().toLowerCase() ?? '';
	if (channelFromSite.length > 0 && getChannelSeedBySlug(channelFromSite)) {
		return channelFromSite;
	}

	const siteSlug = site.slug.trim().toLowerCase();
	if (siteSlug.length > 0 && getChannelSeedBySlug(siteSlug)) {
		return siteSlug;
	}

	if (!siteSlug) return null;

	for (const page of PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES) {
		const backlinksSlug = page.buildBacklinksSiteSlug?.trim().toLowerCase() ?? '';
		if (backlinksSlug.length > 0 && backlinksSlug === siteSlug) {
			return page.slug;
		}
	}

	return null;
}

/** Directory channel slug for `/channels/{slug}` when this build-backlinks site has a catalog landing. */
export function resolveDirectoryChannelSlugForBuildBacklinksSite(
	site: BuildBacklinksSiteChannelRef
): string | null {
	const channelSlug = resolveChannelCatalogSlugForBuildBacklinksSite(site);
	if (!channelSlug || !isPublicDirectoryChannelSlug(channelSlug)) return null;
	return channelSlug;
}

export function resolveDirectoryChannelPlatformLabelForBuildBacklinksSite(
	site: BuildBacklinksSiteChannelRef
): string | null {
	const channelSlug = resolveDirectoryChannelSlugForBuildBacklinksSite(site);
	if (!channelSlug) return null;
	return getChannelSeedBySlug(channelSlug)?.platformLabel?.trim() ?? null;
}