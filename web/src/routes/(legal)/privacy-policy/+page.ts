import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isSuperAdmin = currentUser?.isSuperAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			companyInformationPm: unknown;
			companyName: string;
			supportEmail: string;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isSuperAdmin,
			isAdmin,
			isEditor,
			companyInformationPm: serverData.companyInformationPm,
			companyName: serverData.companyName,
			supportEmail: serverData.supportEmail
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isSuperAdmin,
		isAdmin,
		isEditor
	};
};
