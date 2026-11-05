import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { AlternativesHubViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';
import type { AlternativesHubFilters } from '$lib/content/constants/hubs/alternativesHubFilters';

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
			filtersVm: AlternativesHubFilters;
			hubVm: AlternativesHubViewModel;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			filtersVm: serverData.filtersVm,
			hubVm: serverData.hubVm,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor
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
