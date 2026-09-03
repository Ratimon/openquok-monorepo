import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const { isLoggedIn: accurateIsLoggedIn } = await parent();

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			schemaData: unknown;
			isLoggedIn: boolean;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn
	};
};
