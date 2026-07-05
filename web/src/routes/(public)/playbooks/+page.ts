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
			playbooksVm: StackCardViewModel[];
			allPlaybooksVm: StackCardViewModel[];
			categoriesVm: ExtensionCategoryViewModel[];
			statsVm: ExtensionsHubStatsViewModel;
			filtersVm: StacksHubFilters;
			tagFilterVm: ExtensionsTagFilterViewModel;
			totalCount: number;
			schemaData: unknown;
			heroTitle: string;
			heroDescription: string;
			heroSubtitle: string;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			playbooksVm: serverData.playbooksVm,
			allPlaybooksVm: serverData.allPlaybooksVm,
			categoriesVm: serverData.categoriesVm,
			statsVm: serverData.statsVm,
			filtersVm: serverData.filtersVm,
			tagFilterVm: serverData.tagFilterVm,
			totalCount: serverData.totalCount,
			schemaData: serverData.schemaData,
			heroTitle: serverData.heroTitle,
			heroDescription: serverData.heroDescription,
			heroSubtitle: serverData.heroSubtitle
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
