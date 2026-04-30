import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { BlogPostPublicViewModel } from '$lib/blogs/index';
import type { BlogTopicOverviewPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';

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
			heroTitle: string;
			heroDescription: string;
			posts: BlogPostPublicViewModel[];
			count: number;
			topicsNav: BlogTopicOverviewPublicViewModel[];
			page: number;
			itemsPerPage: number;
			topicId: string | null;
			authorId: string | null;
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
			heroTitle: serverData.heroTitle,
			heroDescription: serverData.heroDescription,
			posts: serverData.posts,
			count: serverData.count,
			topicsNav: serverData.topicsNav,
			page: serverData.page,
			itemsPerPage: serverData.itemsPerPage,
			topicId: serverData.topicId,
			authorId: serverData.authorId
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
