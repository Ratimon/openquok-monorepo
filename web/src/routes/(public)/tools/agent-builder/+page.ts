import { browser } from '$app/environment';

import type { AgentBuilderPageViewModel } from '$lib/stack-builder/stackBuilder.types';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as AgentBuilderPageViewModel & { isLoggedIn?: boolean };

		return {
			...serverData,
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
