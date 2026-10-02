import type { LayoutServerLoad } from './$types';
import {
	CONFIG_SCHEMA_COMPANY,
	PUBLIC_NAVBAR_LINKS,
	PUBLIC_NAVBAR_MOBILE_LINKS
} from '$lib/config/constants/config';
import { createPublicHeaderNavigationSchema } from '$lib/seo/createPublicHeaderNavigationSchema';
import { applyPublicCmsPageCacheHeaders } from '$lib/seo/publicCmsPageCache';
import type { Link } from '$lib/ui/nav-bars/Link';

export const ssr = true;

export const load: LayoutServerLoad = async ({ cookies, parent, setHeaders, url }) => {
	const parentData = await parent();
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	if (!isLoggedIn) {
		applyPublicCmsPageCacheHeaders(setHeaders);
	}

	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_MOBILE_LINKS];

	const companyUrl =
		(typeof parentData.companyInformationPm?.config?.URL === 'string' &&
			parentData.companyInformationPm.config.URL) ||
		String(CONFIG_SCHEMA_COMPANY.URL.default);

	const headerNavigationSchemaData = createPublicHeaderNavigationSchema({
		origin: url.origin,
		companyUrl
	});

	return {
		...parentData,
		isLoggedIn,
		navbarDesktopLinks,
		navbarMobileLinks,
		maintenanceMode: parentData.maintenanceMode ?? 'off',
		headerNavigationSchemaData
	};
};
