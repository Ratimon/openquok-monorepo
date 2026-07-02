import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ListingCreatorViewModel } from '$lib/listings/index';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			creators: ListingCreatorViewModel[];
			metaTitle: string;
			metaDescription: string;
			schemaData: Record<string, unknown>;
		};

		const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
		const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
		const isAdmin = roles?.includes('admin') || false;
		const isEditor = roles?.includes('editor') || false;

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			creators: serverData.creators,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			schemaData: serverData.schemaData
		};
	}

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isPlatformAdmin,
		isAdmin,
		isEditor
	};
};
