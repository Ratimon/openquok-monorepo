import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Link } from '$lib/ui/nav-bars/Link';

import {
	getLandingPageConfigDefaults,
	PUBLIC_FOOTER_LINKS,
	PUBLIC_NAVBAR_LINKS
} from '$lib/config/constants/config';
import { configRepository } from '$lib/config/Config.repository.svelte';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { baseMetaTags } = await parent();
	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const footerNavigationLinks = { ...PUBLIC_FOOTER_LINKS };

	// "Openquok"
	const pageMetaTags = {
		...baseMetaTags,
		titleTemplate: '%s'
	} satisfies MetaTagsProps;

	// ✅ SAFE: Load landing page config using SSR
	let landingPageConfigPm: { [key: string]: string } = {};
	try {
		landingPageConfigPm = await configRepository
			.getPublicModuleConfig('landing_page');
	} catch (error) {
		console.error('[+page.server] Failed to fetch landing page config:', error);
		landingPageConfigPm = getLandingPageConfigDefaults();
	}

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		landingPageConfigPm,
		footerNavigationLinks
	};
};
