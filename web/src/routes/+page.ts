import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { Link } from '$lib/ui/nav-bars/Link';

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
			navbarDesktopLinks: Link[];
			navbarMobileLinks: Link[];
			footerNavigationLinks: Record<string, { label: string; href: string }[]>;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			navbarDesktopLinks: serverData.navbarDesktopLinks,
			navbarMobileLinks: serverData.navbarMobileLinks,
			footerNavigationLinks: serverData.footerNavigationLinks,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isSuperAdmin,
			isAdmin,
			isEditor
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
