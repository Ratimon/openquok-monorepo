/** Route segment for the public extensions hub (no leading slash). */
export function getRootPathPublicExtensions(): string {
	return 'extensions';
}

/** Public extension detail page: `extensions/{slug}` (no leading slash). */
export function getRootPathPublicExtension(slug: string): string {
	return `${getRootPathPublicExtensions()}/${slug}`;
}
