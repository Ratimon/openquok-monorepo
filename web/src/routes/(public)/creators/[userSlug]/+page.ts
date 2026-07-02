import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ExtensionCardViewModel,
	ListingCreatorViewModel,
	StackCardViewModel
} from '$lib/listings/index';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			userSlug: string;
			creator: ListingCreatorViewModel;
			buildingBlocks: ExtensionCardViewModel[];
			playbooks: StackCardViewModel[];
			displayName: string;
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
			userSlug: serverData.userSlug,
			creator: serverData.creator,
			buildingBlocks: serverData.buildingBlocks,
			playbooks: serverData.playbooks,
			displayName: serverData.displayName
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
