import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageLoad } from './$types';
import type { PublicPreviewPostViewModel } from '$lib/posts/index';
import type { PostCommentViewModel } from '$lib/posts';

export const load: PageLoad = async ({ parent, data }) => {
	// Keep parity with the blog route pattern: always pull parent for auth state,
	// then forward server data (including JSON-LD) for client-side navigations.
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn } = parentData as { isLoggedIn?: boolean };

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			postVm: PublicPreviewPostViewModel | null;
			commentsVm?: PostCommentViewModel[];
			schemaData?: Record<string, unknown>;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			postVm: serverData.postVm,
			commentsVm: serverData.commentsVm,
			schemaData: serverData.schemaData,
			isLoggedIn: Boolean(accurateIsLoggedIn)
		};
	}

	return {
		...data,
		isLoggedIn: Boolean(accurateIsLoggedIn)
	};
};

