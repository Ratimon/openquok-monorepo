import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ExtensionCardViewModel, ExtensionDetailViewModel } from '$lib/listings/index';
import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

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
			buildingBlockVm: ExtensionDetailViewModel;
			relatedBuildingBlocksVm: ExtensionCardViewModel[];
			commentsVm: ListingCommentViewModel[];
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			buildingBlockVm: serverData.buildingBlockVm,
			relatedBuildingBlocksVm: serverData.relatedBuildingBlocksVm,
			commentsVm: serverData.commentsVm,
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
