import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Link } from '$lib/ui/nav-bars/Link';

import { PUBLIC_NAVBAR_LINKS, PUBLIC_FOOTER_LINKS } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url }) => {
	const parentData = await parent();
	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const footerNavigationLinks = { ...PUBLIC_FOOTER_LINKS };

	// SEO: landing page meta (SSR-safe, used by root layout for <title> and meta description)
	const pageMetaTags = parentData?.baseMetaTags satisfies MetaTagsProps;

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		footerNavigationLinks,
	};
};
