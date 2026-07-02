/** Route segment for the public building blocks hub (no leading slash). */
export function getRootPathPublicBuildingBlocks(): string {
	return 'building-blocks';
}

/** Public building block detail page: `building-blocks/{slug}` (no leading slash). */
export function getRootPathPublicBuildingBlock(slug: string): string {
	return `${getRootPathPublicBuildingBlocks()}/${slug}`;
}
