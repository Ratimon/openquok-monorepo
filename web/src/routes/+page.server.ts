import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Link } from '$lib/ui/nav-bars/Link';

import {
	CONFIG_SCHEMA_LANDING_PAGE,
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
	let landingPageConfigVm: { [key: string]: string } = {};
	try {
		landingPageConfigVm = await configRepository.getModuleConfig('landing-page');
	} catch (error) {
		console.error('[+page.server] Failed to fetch landing page config:', error);
		landingPageConfigVm = {
			HERO_TITLE: String(CONFIG_SCHEMA_LANDING_PAGE.HERO_TITLE.default),
			HERO_SLOGAN: String(CONFIG_SCHEMA_LANDING_PAGE.HERO_SLOGAN.default),
			ACTIVE_TOP_BANNER: String(CONFIG_SCHEMA_LANDING_PAGE.ACTIVE_TOP_BANNER.default)
		};
	}

	return {
		pageMetaTags,
		navbarDesktopLinks,
		navbarMobileLinks,
		landingPageConfigVm,
		footerNavigationLinks
	};
};
