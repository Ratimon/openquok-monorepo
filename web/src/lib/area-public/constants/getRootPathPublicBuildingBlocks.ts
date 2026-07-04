/** Route segment for the public building blocks hub (no leading slash). */
export function getRootPathPublicBuildingBlocks(): string {
	return 'building-blocks';
}

/** Legacy single-segment hub path kept for redirects: `building-blocks/{slug}`. */
export function getLegacyRootPathPublicBuildingBlock(listingSlug: string): string {
	return `${getRootPathPublicBuildingBlocks()}/${encodeURIComponent(listingSlug)}`;
}
