import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	PhotoEditorChannelHubLinkViewModel,
	PhotoEditorPageViewModel
} from '$lib/photo-editor/photoEditor.types';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as PhotoEditorPageViewModel & {
			pageMetaTags: MetaTagsProps;
			isLoggedIn?: boolean;
			schemaData: unknown;
			photoEditorChannelsVm: PhotoEditorChannelHubLinkViewModel[];
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			channelSlug: serverData.channelSlug,
			channelLabel: serverData.channelLabel,
			focusedProviderIdentifier: serverData.focusedProviderIdentifier,
			defaultAspectRatioId: serverData.defaultAspectRatioId,
			aspectPlatformGroupId: serverData.aspectPlatformGroupId,
			composerMode: serverData.composerMode,
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
