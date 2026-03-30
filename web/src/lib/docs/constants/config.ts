import type { DocsConfig } from '$lib/docs/types';
import { docsI18n, docsSidebar, docsSite } from '$data/docs';

export const docsConfig: DocsConfig = {
	site: docsSite,
	sidebar: docsSidebar,
	toc: {
		minDepth: 2,
		maxDepth: 3
	},
	i18n: {
		defaultLocale: docsI18n.defaultLocale,
		locales: docsI18n.locales.map((l) => ({ ...l }))
	}
};
