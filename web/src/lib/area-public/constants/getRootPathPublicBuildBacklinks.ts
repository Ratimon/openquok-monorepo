/** Route segment for the public build-backlinks hub (no leading slash). */
export function getRootPathPublicBuildBacklinks(): string {
	return 'build-backlinks';
}

/** All categories index: `build-backlinks/categories`. */
export function getRootPathPublicBuildBacklinksCategories(): string {
	return `${getRootPathPublicBuildBacklinks()}/categories`;
}

/** Sites in one category: `build-backlinks/categories/{categorySlug}`. */
export function getRootPathPublicBuildBacklinksCategory(categorySlug: string): string {
	return `${getRootPathPublicBuildBacklinksCategories()}/${encodeURIComponent(categorySlug)}`;
}

/** All tags index: `build-backlinks/tags`. */
export function getRootPathPublicBuildBacklinksTags(): string {
	return `${getRootPathPublicBuildBacklinks()}/tags`;
}

/** Sites with one tag: `build-backlinks/tags/{tagSlug}`. */
export function getRootPathPublicBuildBacklinksTag(tagSlug: string): string {
	return `${getRootPathPublicBuildBacklinksTags()}/${encodeURIComponent(tagSlug)}`;
}

/** Published site detail: `build-backlinks/{siteSlug}`. */
export function getRootPathPublicBuildBacklinksSite(siteSlug: string): string {
	return `${getRootPathPublicBuildBacklinks()}/${encodeURIComponent(siteSlug)}`;
}
