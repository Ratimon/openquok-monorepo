import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ListingsHubBreadcrumbKind,
	ListingsHubBreadcrumbVariant
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
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
			heroTitle: string;
			metaTitle: string;
			metaDescription: string;
			listingsBreadcrumb: {
				kind: ListingsHubBreadcrumbKind;
				variant: ListingsHubBreadcrumbVariant;
				siteLabel?: string | null;
			};
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			siteVm: serverData.siteVm,
			schemaData: serverData.schemaData,
			heroTitle: serverData.heroTitle,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			listingsBreadcrumb: serverData.listingsBreadcrumb
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser
	};
};
