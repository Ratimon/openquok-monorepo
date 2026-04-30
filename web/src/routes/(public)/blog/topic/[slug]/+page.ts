import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	BlogPostPublicViewModel,
	BlogTopicOverviewPublicViewModel
} from '$lib/blogs/GetBlog.presenter.svelte';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			companyInformationPm: unknown;
			marketingInformationPm: unknown;
			topicSlug: string;
			topic: BlogTopicOverviewPublicViewModel | null;
			posts: BlogPostPublicViewModel[];
			count: number;
			topicsNav: BlogTopicOverviewPublicViewModel[];
			page: number;
			itemsPerPage: number;
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
			topicSlug: serverData.topicSlug,
			topic: serverData.topic,
			posts: serverData.posts,
			count: serverData.count,
			topicsNav: serverData.topicsNav,
			page: serverData.page,
			itemsPerPage: serverData.itemsPerPage
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
