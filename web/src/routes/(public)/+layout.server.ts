import type { LayoutServerLoad } from './$types';
import {
	PUBLIC_NAVBAR_LINKS,
	PUBLIC_NAVBAR_MOBILE_LINKS,
	PUBLIC_FOOTER_LINKS
} from '$lib/config/constants/config';
import type { Link } from '$lib/ui/nav-bars/Link';

export const ssr = true;

export const load: LayoutServerLoad = async ({ cookies, parent }) => {
	const parentData = await parent();
	// Security: use cookies only for auth in SSR — never import authenticationRepository in server load
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const navbarDesktopLinks: Link[] = [...PUBLIC_NAVBAR_LINKS];
	const navbarMobileLinks: Link[] = [...PUBLIC_NAVBAR_MOBILE_LINKS];
	const footerNavigationLinks = { ...PUBLIC_FOOTER_LINKS };

	return {
		...parentData,
		isLoggedIn,
		navbarDesktopLinks,
		navbarMobileLinks,
		footerNavigationLinks
	};
};
