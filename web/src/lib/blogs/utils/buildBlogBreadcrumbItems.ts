import type { BreadcrumbList } from 'schema-dts';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import {
	createBreadcrumbListSchema,
	type BreadcrumbCrumb
} from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
import { route } from '$lib/utils/path';

export const BLOG_BREADCRUMB_HUB_LABEL = 'Blog';

export type BlogHubBreadcrumbUiItem = {
	label: string;
	href?: string | null;
};

/** Blog hub → child page (matches `BlogHubBreadcrumb.svelte` and blog JSON-LD). */
export function buildBlogChildPageBreadcrumbItems(pageTitle: string): BreadcrumbCrumb[] {
	const trimmedTitle = pageTitle.trim();
	return [
		{ label: BLOG_BREADCRUMB_HUB_LABEL, href: route(getRootPathPublicBlog()) },
		{ label: trimmedTitle.length > 0 ? trimmedTitle : BLOG_BREADCRUMB_HUB_LABEL }
	];
}

export function createBlogChildPageBreadcrumbListSchema(
	pageTitle: string,
	origin: string
): BreadcrumbList {
	return createBreadcrumbListSchema(buildBlogChildPageBreadcrumbItems(pageTitle), origin);
}

/** Resolve relative marketing paths for rendered `<a href>` (self-host → openquok.com). */
export function resolveBlogBreadcrumbItemsForUi(
	pageTitle: string,
	origin: string
): BlogHubBreadcrumbUiItem[] {
	return buildBlogChildPageBreadcrumbItems(pageTitle).map((item) => ({
		label: item.label,
		href: item.href ? hostedMarketingHref(item.href, origin) : null
	}));
}
