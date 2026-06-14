import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { Link } from '$lib/ui/nav-bars/Link';
import type { PageLoad } from './$types';

import { browser } from '$app/environment';

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
			navbarDesktopLinks: Link[];
			navbarMobileLinks: Link[];
			footerNavigationLinks: Record<string, { label: string; href: string }[]>;
			landingPageConfigVm: Record<string, string>;
			publicFaqConfigVm: Record<string, string>;
			publicFaqItemsVm: PublicFaqItem[];
			schemaData: Record<string, unknown>;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			navbarDesktopLinks: serverData.navbarDesktopLinks,
			navbarMobileLinks: serverData.navbarMobileLinks,
			footerNavigationLinks: serverData.footerNavigationLinks,
			landingPageConfigVm: serverData.landingPageConfigVm,
			publicFaqConfigVm: serverData.publicFaqConfigVm,
			publicFaqItemsVm: serverData.publicFaqItemsVm,
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
