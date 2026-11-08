import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PublicSelfHostingLinkCardItem } from '$lib/content/constants/marketing/self-hosting-landing';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const { isLoggedIn: accurateIsLoggedIn } = await parent();

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			schemaData: unknown;
			socialIntegrationLinkCardItems: PublicSelfHostingLinkCardItem[];
			directoryIntegrationLinkCardItems: PublicSelfHostingLinkCardItem[];
			isLoggedIn: boolean;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			schemaData: serverData.schemaData,
			socialIntegrationLinkCardItems: serverData.socialIntegrationLinkCardItems,
			directoryIntegrationLinkCardItems: serverData.directoryIntegrationLinkCardItems,
			isLoggedIn: accurateIsLoggedIn
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn
	};
};
