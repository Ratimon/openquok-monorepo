import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { AlternativesPathCategorySlug } from '$lib/content/constants/hubs/alternativesPathCategories';

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
			categories: Array<{
				slug: AlternativesPathCategorySlug;
				name: string;
				description: string;
				entryCount: number;
			}>;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			categories: serverData.categories,
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
