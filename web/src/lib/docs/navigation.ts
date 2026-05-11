import type { DocPage, DocsDocTabId, NavItem, SidebarSection } from '$lib/docs/types';

import { docsConfig, docsSidebarMerged, docsTabs } from '$lib/docs/constants';
import { getAllDocs, getDocsByDirectory } from '$lib/docs/content';
import { httpMethodBadgeLabel } from '$lib/docs/utils/openapi-docs-layout';

export function generateNavigationFromSidebar(
	sections: SidebarSection[],
	locale?: string
): NavItem[] {
	const nav: NavItem[] = [];

	for (const section of sections) {
		if (section.autogenerate) {
			const docs = getDocsByDirectory(section.autogenerate.directory, locale);
			const items: NavItem[] = docs.map((doc) => ({
				title: doc.meta.sidebar?.label ?? doc.meta.title,
				href: doc.href,
				order: doc.meta.order,
				httpMethod: httpMethodBadgeLabel(doc.meta)
			}));

			items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

			nav.push({
				title: section.label,
				iconName: section.icon,
				items
			});
		} else if (section.items) {
			nav.push({
				title: section.label,
				iconName: section.icon,
				items: section.items.map((item) => ({
					title: item.label,
					href: item.href
				}))
			});
		}
	}

	return nav;
}

/** Full sidebar (all tabs); use for search indexes and sitewide listings. */
export function generateNavigation(locale?: string): NavItem[] {
	return generateNavigationFromSidebar(docsSidebarMerged, locale);
}

export function getNavigation(locale?: string): NavItem[] {
	return generateNavigation(locale);
}

export function stripDocsLocaleFromPathname(pathname: string): string {
	const parts = pathname.split('/').filter(Boolean);
	if (parts[0] !== 'docs') return pathname;

	const locales = docsConfig.i18n?.locales.map((l) => l.code) ?? [];
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';

	if (
		parts.length >= 2 &&
		locales.includes(parts[1]!) &&
		parts[1] !== defaultLocale
	) {
		const tail = parts.slice(2);
		return tail.length ? `/docs/${tail.join('/')}` : '/docs';
	}

	return pathname;
}

export function getDocsTabIdFromPathname(pathname: string): DocsDocTabId {
	const path = stripDocsLocaleFromPathname(pathname);
	const parts = path.split('/').filter(Boolean);
	const rest = parts.slice(1);

	if (rest.length === 0) return 'cli';
	if (
		rest[0] === 'getting-started-for-public-api' ||
		rest[0] === 'apis-integrations'
	)
		return 'public-api';
	if (rest[0] === 'getting-started-for-cli') return 'cli';
	return 'learn-more';
}

export function getDocsTabIdFromSlug(slug: string): DocsDocTabId {
	if (
		!slug ||
		slug === 'getting-started-for-cli' ||
		slug.startsWith('getting-started-for-cli/')
	)
		return 'cli';
	if (
		slug === 'getting-started-for-public-api' ||
		slug.startsWith('getting-started-for-public-api/') ||
		slug === 'apis-integrations' ||
		slug.startsWith('apis-integrations/')
	)
		return 'public-api';
	return 'learn-more';
}

export function getNavigationForPath(pathname: string, locale?: string): NavItem[] {
	const tabId = getDocsTabIdFromPathname(pathname);
	const tab = docsTabs.find((t) => t.id === tabId);
	return generateNavigationFromSidebar(tab?.sidebar ?? docsSidebarMerged, locale);
}

/** Canonical URL for each docs tab (CLI home is `/docs`). */
export function docsTabHref(tabId: DocsDocTabId, locale?: string): string {
	const defaultLocale = docsConfig.i18n?.defaultLocale ?? 'en';
	const base = locale && locale !== defaultLocale ? `/docs/${locale}` : '/docs';
	switch (tabId) {
		case 'cli':
			return base;
		case 'public-api':
			return `${base}/getting-started-for-public-api`;
		case 'learn-more':
			return `${base}/getting-started-for-dev`;
	}
}

function orderDocsBySectionsSubset(docs: DocPage[], sections: SidebarSection[]): DocPage[] {
	const used = new Set<string>();
	const ordered: DocPage[] = [];

	const push = (d: DocPage) => {
		if (!used.has(d.slug)) {
			ordered.push(d);
			used.add(d.slug);
		}
	};

	for (const section of sections) {
		if (!section.autogenerate) continue;
		const dir = section.autogenerate.directory;
		const inSection = docs
			.filter((d) => d.slug === dir || d.slug.startsWith(`${dir}/`))
			.sort(
				(a, b) =>
					(a.meta.order ?? 999) - (b.meta.order ?? 999) || a.slug.localeCompare(b.slug)
			);
		for (const d of inSection) push(d);
	}

	for (const d of docs) {
		if (!used.has(d.slug)) push(d);
	}

	return ordered;
}

export function getOrderedDocsForTab(tabId: DocsDocTabId, locale?: string): DocPage[] {
	const tab = docsTabs.find((t) => t.id === tabId);
	if (!tab) return [];

	const allDocs = getAllDocs(locale);
	const inTab = allDocs.filter((d) => getDocsTabIdFromSlug(d.slug) === tabId);
	return orderDocsBySectionsSubset(inTab, tab.sidebar);
}

export function getPrevNext(
	currentSlug: string,
	locale?: string
): { prev?: NavItem; next?: NavItem } {
	const tabId = getDocsTabIdFromSlug(currentSlug);
	const ordered = getOrderedDocsForTab(tabId, locale);
	const index = ordered.findIndex((doc) => doc.slug === currentSlug);
	if (index === -1) return {};

	return {
		prev:
			index > 0
				? { title: ordered[index - 1]!.meta.title, href: ordered[index - 1]!.href }
				: undefined,
		next:
			index < ordered.length - 1
				? { title: ordered[index + 1]!.meta.title, href: ordered[index + 1]!.href }
				: undefined
	};
}
