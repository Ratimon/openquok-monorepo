import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ExtensionCategoryViewModel,
	ExtensionsHubStatsViewModel,
	ExtensionsTagFilterViewModel,
	StackCardViewModel,
	StacksHubFilters
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
			stacksVm: StackCardViewModel[];
			allStacksVm: StackCardViewModel[];
			categoriesVm: ExtensionCategoryViewModel[];
			statsVm: ExtensionsHubStatsViewModel;
			filtersVm: StacksHubFilters;
			tagFilterVm: ExtensionsTagFilterViewModel;
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
			stacksVm: serverData.stacksVm,
			allStacksVm: serverData.allStacksVm,
			categoriesVm: serverData.categoriesVm,
			statsVm: serverData.statsVm,
			filtersVm: serverData.filtersVm,
			tagFilterVm: serverData.tagFilterVm,
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
