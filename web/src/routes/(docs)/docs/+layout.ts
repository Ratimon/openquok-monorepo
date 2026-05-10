import {
	docsTabs,
	generateNavigationFromSidebar,
	getDocsTabIdFromPathname,
	getNavigationForPath
} from '$lib/docs/index';
import { docsSidebarMerged } from '$lib/docs/constants';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = ({ url }) => {
	const pathname = url.pathname;
	return {
		navigation: getNavigationForPath(pathname),
		navigationSearchIndex: generateNavigationFromSidebar(docsSidebarMerged),
		activeDocsTabId: getDocsTabIdFromPathname(pathname),
		docsTabs,
		locale: undefined as string | undefined
	};
};
