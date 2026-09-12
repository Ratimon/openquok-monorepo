export { docsConfig, docsTabs } from '$lib/docs/constants';
export {
	docSlugsSafeForPrerender,
	eachLocaleDocPages,
	getAllDocs,
	getDoc,
	getDocsByDirectory,
	getRawContent,
	preloadAllDocLocales,
	preloadDocsRegistry
} from '$lib/docs/content';
export {
	docsTabHref,
	generateNavigationFromSidebar,
	getDocsTabIdFromPathname,
	getDocsTabIdFromSlug,
	getNavigation,
	getNavigationForPath,
	getOrderedDocsForTab,
	getPrevNext,
	stripDocsLocaleFromPathname
} from '$lib/docs/navigation';
export { calculateReadingTime, toc } from '$lib/docs/utils';
export type {
	DocMeta,
	DocFile,
	DocPage,
	DocsDocTabId,
	DocsTabDefinition,
	NavItem,
	SiteConfig,
	DocsConfig,
	SidebarSection,
	TableOfContentsItem,
	VersionConfig,
	LocaleConfig
} from '$lib/docs/types';
