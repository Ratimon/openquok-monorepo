import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	// Always get parent data for auth state (works on both server and client)
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	// On client, get accurate auth state from parent (root layout)
	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			companyInformationPm: unknown;
			marketingInformationPm: unknown;
			rootBlog: string;
			slug: string;
			currentPostVm: unknown;
			otherPostsVm: unknown;
			comments: unknown;
			schemaData: Record<string, unknown>;
		};

		const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
		const isSuperAdmin = currentUser?.isSuperAdmin || false;
		const isAdmin = roles?.includes('admin') || false;
		const isEditor = roles?.includes('editor') || false;

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isSuperAdmin,
			isAdmin,
			isEditor,
			companyInformationPm: serverData.companyInformationPm,
			marketingInformationPm: serverData.marketingInformationPm,
			rootBlog: serverData.rootBlog,
			slug: serverData.slug,
			currentPostVm: serverData.currentPostVm,
			otherPostsVm: serverData.otherPostsVm,
			comments: serverData.comments,
			schemaData: serverData.schemaData
		};
	}

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isSuperAdmin = currentUser?.isSuperAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isSuperAdmin,
		isAdmin,
		isEditor
	};
};
