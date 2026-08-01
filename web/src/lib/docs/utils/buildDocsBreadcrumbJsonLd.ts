import type { ListItem } from 'schema-dts';

import { resolvePublicSiteUrl } from '$lib/docs/utils/resolve-public-site-url';

/** Absolute docs URL for JSON-LD and canonical tags (prerender-safe; no query string). */
export function resolveDocsPageUrl(pathname: string, requestUrl: URL): string {
	const origin = resolvePublicSiteUrl(requestUrl);
	return new URL(pathname, `${origin}/`).href;
}

function formatBreadcrumbSegmentLabel(segment: string): string {
	return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * BreadcrumbList items for docs pages — absolute `item` URLs only on non-terminal crumbs
 * (see Google BreadcrumbList guidance).
 */
export function buildDocsBreadcrumbListItems(pathname: string, requestUrl: URL): ListItem[] {
	const parts = pathname.split('/').filter(Boolean);
	const siteUrl = resolvePublicSiteUrl(requestUrl);

	if (parts.length < 2) {
		const leaf = parts[parts.length - 1];
		return [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: `${siteUrl}/`
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: leaf ? formatBreadcrumbSegmentLabel(leaf) : 'Documentation'
			}
		];
	}

	return parts.map((part, index) => {
		const segmentPath = `/${parts.slice(0, index + 1).join('/')}`;
		const isLast = index === parts.length - 1;
		const entry: ListItem = {
			'@type': 'ListItem',
			position: index + 1,
			name: formatBreadcrumbSegmentLabel(part)
		};
		if (!isLast) {
			entry.item = resolveDocsPageUrl(segmentPath, requestUrl);
		}
		return entry;
	});
}
