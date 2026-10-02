import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	BuildBacklinksHubFilters,
	LinkDirectoryCategoryDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/index';
import type { BuildBacklinksHubStatsViewModel } from '$lib/link-directory/utils/buildBuildBacklinksHubStats';

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
			sitesVm: LinkDirectorySiteDto[];
			categoriesVm: LinkDirectoryCategoryDto[];
			tagsVm: LinkDirectoryTagDto[];
			filtersVm: BuildBacklinksHubFilters;
			filteredCount: number;
			page: number;
			itemsPerPage: number;
			totalPages: number;
			listOffset: number;
			schemaData: unknown;
			heroTitle: string;
			heroDescription: string;
			heroSubtitle: string;
			showHubFaq: boolean;
			statsVm?: BuildBacklinksHubStatsViewModel | null;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			sitesVm: serverData.sitesVm,
			categoriesVm: serverData.categoriesVm,
			tagsVm: serverData.tagsVm,
			filtersVm: serverData.filtersVm,
			filteredCount: serverData.filteredCount,
			page: serverData.page,
			itemsPerPage: serverData.itemsPerPage,
			totalPages: serverData.totalPages,
			listOffset: serverData.listOffset,
			schemaData: serverData.schemaData,
			heroTitle: serverData.heroTitle,
			heroDescription: serverData.heroDescription,
			heroSubtitle: serverData.heroSubtitle,
			showHubFaq: serverData.showHubFaq,
			statsVm: serverData.statsVm ?? null
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
