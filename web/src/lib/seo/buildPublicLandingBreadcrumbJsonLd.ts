import type { BreadcrumbList, ListItem } from 'schema-dts';

import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

export type BreadcrumbCrumb = {
	label: string;
	href?: string | null;
};

function absoluteBreadcrumbItemUrl(href: string, origin: string): string {
	const resolved = hostedMarketingHref(href, origin);
	if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
		return resolved;
	}
	return new URL(resolved, origin).href;
}

/**
 * BreadcrumbList items — absolute `item` URLs only on non-terminal crumbs
 * (see Google BreadcrumbList guidance).
 */
export function buildBreadcrumbListItems(crumbs: BreadcrumbCrumb[], origin: string): ListItem[] {
	return crumbs.map((crumb, index) => {
		const entry: ListItem = {
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.label
		};
		const href = crumb.href?.trim();
		const isLast = index === crumbs.length - 1;
		if (href && !isLast) {
			entry.item = absoluteBreadcrumbItemUrl(href, origin);
		}
		return entry;
	});
}

export function createBreadcrumbListSchema(crumbs: BreadcrumbCrumb[], origin: string): BreadcrumbList {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: buildBreadcrumbListItems(crumbs, origin)
	};
}
