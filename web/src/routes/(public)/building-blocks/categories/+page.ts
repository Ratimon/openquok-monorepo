import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ListingsHubBreadcrumbKind,
	ListingsHubBreadcrumbVariant
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import type { ExtensionCategoryOverviewItemViewModel } from '$lib/listings/listing.types';

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
			categories: ExtensionCategoryOverviewItemViewModel[];
			schemaData: unknown;
			listingsBreadcrumb: {
				kind: ListingsHubBreadcrumbKind;
				variant: ListingsHubBreadcrumbVariant;
				categoryLabel?: string | null;
				categorySlug?: string | null;
				tagLabel?: string | null;
			};
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			categories: serverData.categories,
			schemaData: serverData.schemaData,
			listingsBreadcrumb: serverData.listingsBreadcrumb
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
