import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { AlternativesDetailViewModel } from '$lib/area-public/PublicAlternativesPage.presenter.svelte';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

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
			detailVm: AlternativesDetailViewModel;
			faqItems: PublicFaqItem[];
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			detailVm: serverData.detailVm,
			faqItems: serverData.faqItems,
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
