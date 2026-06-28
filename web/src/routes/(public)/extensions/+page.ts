import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ExtensionCardViewModel,
	ExtensionCategoryViewModel,
	ExtensionsHubFilters,
	ExtensionsHubStatsViewModel
} from '$lib/listings/index';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			metaTitle: string;
			metaDescription: string;
			extensions: ExtensionCardViewModel[];
			allExtensions: ExtensionCardViewModel[];
			categories: ExtensionCategoryViewModel[];
			stats: ExtensionsHubStatsViewModel;
			filters: ExtensionsHubFilters;
			totalCount: number;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			extensions: serverData.extensions,
			allExtensions: serverData.allExtensions,
			categories: serverData.categories,
			stats: serverData.stats,
			filters: serverData.filters,
			totalCount: serverData.totalCount,
			schemaData: serverData.schemaData
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isPlatformAdmin,
		isAdmin,
		isEditor
	};
};
