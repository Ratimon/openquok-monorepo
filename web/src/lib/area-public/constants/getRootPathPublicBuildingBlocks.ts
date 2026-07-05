/** Route segment for the public building blocks hub (no leading slash). */
export function getRootPathPublicBuildingBlocks(): string {
	return 'building-blocks';
}

/** All building block categories index: `building-blocks/categories`. */
export function getRootPathPublicBuildingBlocksCategories(): string {
	return `${getRootPathPublicBuildingBlocks()}/categories`;
}

/** Building blocks in one category: `building-blocks/categories/{categorySlug}`. */
export function getRootPathPublicBuildingBlocksCategory(categorySlug: string): string {
	return `${getRootPathPublicBuildingBlocksCategories()}/${encodeURIComponent(categorySlug)}`;
}

/** All building block tags index: `building-blocks/tags`. */
export function getRootPathPublicBuildingBlocksTags(): string {
	return `${getRootPathPublicBuildingBlocks()}/tags`;
}

/** Building blocks with one tag: `building-blocks/tags/{tagSlug}`. */
export function getRootPathPublicBuildingBlocksTag(tagSlug: string): string {
	return `${getRootPathPublicBuildingBlocksTags()}/${encodeURIComponent(tagSlug)}`;
}

/** Category + tag (or tag group) filter: `building-blocks/categories/{categorySlug}/tags/{tagSlug}`. */
export function getRootPathPublicBuildingBlocksCategoryTag(
	categorySlug: string,
	tagPathSlug: string
): string {
	return `${getRootPathPublicBuildingBlocksCategory(categorySlug)}/tags/${encodeURIComponent(tagPathSlug)}`;
}
