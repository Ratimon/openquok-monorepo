/** Multi-segment `link_directory_sites.slug` values without passing a live catalog. */
export const KNOWN_MULTI_SEGMENT_DIRECTORY_SITE_SLUGS = ['open-launch'] as const;

/**
 * Site key for grouping auto-launch destinations with `link_directory_sites.slug`.
 * Prefers longest published slug prefix (`product-hunt-launch` + slug `product-hunt` → `product-hunt`).
 */
export function directorySiteKeyFromProviderSlug(
	providerSlug: string,
	publishedSiteSlugs: Iterable<string> = KNOWN_MULTI_SEGMENT_DIRECTORY_SITE_SLUGS
): string {
	const trimmed = providerSlug.trim();
	const slugs = [...publishedSiteSlugs].sort((a, b) => b.length - a.length);
	for (const slug of slugs) {
		if (trimmed === slug || trimmed.startsWith(`${slug}-`)) {
			return slug;
		}
	}
	const dash = trimmed.indexOf('-');
	return dash === -1 ? trimmed : trimmed.slice(0, dash);
}
