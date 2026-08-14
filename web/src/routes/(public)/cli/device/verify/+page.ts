import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = await parent();

	if (browser && data) {
		const serverData = data as { pageMetaTags: MetaTagsProps; prefilledCode: string };
		return {
			pageMetaTags: serverData.pageMetaTags,
			prefilledCode: serverData.prefilledCode,
			isLoggedIn: accurateIsLoggedIn,
			currentUser
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser
	};
};
