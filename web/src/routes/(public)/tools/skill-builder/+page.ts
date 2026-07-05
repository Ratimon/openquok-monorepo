import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { SkillBuilderPageViewModel } from '$lib/skill-builder/skillBuilder.types';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as SkillBuilderPageViewModel & {
			pageMetaTags: MetaTagsProps;
			isLoggedIn?: boolean;
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			selectedBuildingBlockSlugs: serverData.selectedBuildingBlockSlugs,
			selectedBuildingBlocks: serverData.selectedBuildingBlocks,
			initialWorkflowSteps: serverData.initialWorkflowSteps,
			stackTitle: serverData.stackTitle,
			stackSlug: serverData.stackSlug,
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
