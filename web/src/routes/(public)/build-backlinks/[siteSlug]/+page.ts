import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { LinkDirectorySiteDto } from '$lib/link-directory/index';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			siteVm: LinkDirectorySiteDto;
			schemaData: unknown;
			metaTitle: string;
			metaDescription: string;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			siteVm: serverData.siteVm,
			schemaData: serverData.schemaData,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser
	};
};
