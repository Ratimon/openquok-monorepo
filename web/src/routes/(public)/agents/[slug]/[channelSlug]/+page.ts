import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

	import type { PublicAgentViewModel } from '$lib/area-public/PublicAgentByPage.presenter.svelte';
	import type { PublicAgentChannelHubLinkViewModel } from '$lib/content/constants/publicAgentChannelConfig';
	import type { PublicListingsPreviewVm } from '$lib/listings/server/loadAgentListingsPreview.server';

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
			landingVm: PublicAgentViewModel;
			listingsPreviewVm: PublicListingsPreviewVm | null;
			schemaData: unknown;
			channelSlug: string;
			channelLabel: string;
			cliExamplesPath: string;
			agentSlug: string;
			isChannelComingSoon: boolean;
			agentChannelLinksVm: PublicAgentChannelHubLinkViewModel[];
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			landingVm: serverData.landingVm,
			listingsPreviewVm: serverData.listingsPreviewVm,
			schemaData: serverData.schemaData,
			channelSlug: serverData.channelSlug,
			channelLabel: serverData.channelLabel,
			cliExamplesPath: serverData.cliExamplesPath,
			agentSlug: serverData.agentSlug,
			isChannelComingSoon: serverData.isChannelComingSoon,
			agentChannelLinksVm: serverData.agentChannelLinksVm
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
