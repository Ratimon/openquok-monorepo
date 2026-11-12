import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { CompareDetailViewModel } from '$lib/area-public/PublicComparePage.presenter.svelte';
import { listPrerenderableCompareDetailParams } from '$lib/seo/prerender/listPrerenderableCompareDetailParams';

import type { PageLoad } from './$types';

export const prerender = 'auto';

export function entries() {
	return listPrerenderableCompareDetailParams();
}

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
			detailVm: CompareDetailViewModel;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			detailVm: serverData.detailVm,
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
