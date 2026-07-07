import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { CanvasChannelHubLinkViewModel } from '$lib/canvas';
import type {
	SkillBuilderChannelHubLinkViewModel,
	ToolsIndexToolCardViewModel
} from '$lib/skill-builder/skillBuilder.types';

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
			metaTitle: string;
			metaDescription: string;
			toolsVm: ToolsIndexToolCardViewModel[];
			skillBuilderChannelsVm: SkillBuilderChannelHubLinkViewModel[];
			photoEditorChannelsVm: CanvasChannelHubLinkViewModel[];
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			toolsVm: serverData.toolsVm,
			skillBuilderChannelsVm: serverData.skillBuilderChannelsVm,
			photoEditorChannelsVm: serverData.photoEditorChannelsVm,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor
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
