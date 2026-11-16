import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksSite,
	getRootPathPublicBuildBacklinksTag
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { resolveBuildBacklinksTagSlug } from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import { route } from '$lib/utils/path';

/**
 * Agent×channel pages reuse listing tag slugs for playbooks/building blocks.
 * Build Backlinks uses editorial/virtual tag browse URLs or site detail — not channel slugs as tags.
 */
export function resolveBuildBacklinksPreviewSeeAllPath(options: {
	/** Listing catalog tag (playbooks/building blocks). */
	listingTagSlug?: string | null;
	/** Explicit link-directory site slug for the channel context. */
	featuredBacklinkSiteSlug?: string | null;
	/** Channel catalog slug when the preview is scoped to one network (agent×channel). */
	channelSlug?: string | null;
}): string {
	const siteSlug =
		options.featuredBacklinkSiteSlug?.trim() || options.channelSlug?.trim() || null;

	if (siteSlug) {
		return route(getRootPathPublicBuildBacklinksSite(siteSlug));
	}

	const tagSlug = options.listingTagSlug?.trim();
	if (tagSlug && resolveBuildBacklinksTagSlug(tagSlug).kind !== 'unknown') {
		return route(getRootPathPublicBuildBacklinksTag(tagSlug));
	}

	return route(getRootPathPublicBuildBacklinks());
}

export function resolveFeaturedBacklinkSiteSlugForPreview(options: {
	featuredBacklinkSiteSlug?: string | null;
	channelSlug?: string | null;
	listingTagSlug?: string | null;
}): string | null {
	return (
		options.featuredBacklinkSiteSlug?.trim() ||
		options.channelSlug?.trim() ||
		options.listingTagSlug?.trim() ||
		null
	);
}