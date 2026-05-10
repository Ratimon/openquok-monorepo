import {
	docsTabs,
	generateNavigationFromSidebar,
	getDocsTabIdFromPathname,
	getNavigationForPath
} from '$lib/docs/index';
import { docsConfig, docsSidebarMerged } from '$lib/docs/constants';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = ({ params, url }) => {
	const locale = params.lang;
	const validLocales = docsConfig.i18n?.locales.map((l) => l.code) ?? [];

	if (!validLocales.includes(locale)) {
		throw error(404, `Unknown locale: ${locale}`);
	}

	const pathname = url.pathname;

	return {
		navigation: getNavigationForPath(pathname, locale),
		navigationSearchIndex: generateNavigationFromSidebar(docsSidebarMerged, locale),
		activeDocsTabId: getDocsTabIdFromPathname(pathname),
		docsTabs,
		locale
	};
};
