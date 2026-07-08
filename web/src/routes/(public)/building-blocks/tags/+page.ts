import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';

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
			tagFilterVm: ExtensionsTagFilterViewModel;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			tagFilterVm: serverData.tagFilterVm,
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
