import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PublicOpportunitiesPreviewVm } from '$lib/opportunities/server/loadAgentOpportunitiesPreview.server';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const { isLoggedIn: accurateIsLoggedIn } = await parent();

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			schemaData: unknown;
			isLoggedIn: boolean;
			landingPageConfigVm: Record<string, string>;
			opportunitiesPreviewVm: PublicOpportunitiesPreviewVm;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn,
			landingPageConfigVm: serverData.landingPageConfigVm,
			opportunitiesPreviewVm: serverData.opportunitiesPreviewVm
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn
	};
};
