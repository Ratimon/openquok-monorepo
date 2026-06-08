// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
import type { Link } from '$lib/ui/nav-bars/Link';

declare global {
	interface Window {
		dataLayer: IArguments[];
		/* eslint-disable @typescript-eslint/no-explicit-any */
		gtag?: (...args: any[]) => void;
		fbq?: (...args: any[]) => void;
	}

	namespace App {

		interface LayoutData {
			baseMetaTags?: BaseMetaTags;
			pageMetaTags?: BaseMetaTags;
			authStatus?: AuthStatus | string;
			isLoggedIn?: boolean;
			/** Set when `/?code=...` must be forwarded to the backend OAuth callback (show interstitial first). */
			oauthCodeRedirectPending?: boolean;
			oauthCodeRedirectUrl?: string;
			/** Authenticated user; matches backend AuthUserDTO / BasicUserAuthProgrammerModel */
			currentUser?: import('$lib/user-auth/Authentication.repository.svelte').BasicUserAuthProgrammerModel | null;
			companyNameVm?: string | null;
			companyUrlVm?: string | null;
			companyYearVm?: string | null;
			marketingInformationVm?: Record<string, string> | null;
		}

		interface HomePageData extends LayoutData {
			navbarDesktopLinks?: Link[];
			navbarMobileLinks?: Link[];
			footerNavigationLinks?: Record<string, { label: string; href: string }[]>;
			landingPageConfigVm?: Record<string, string>;
			publicFaqConfigVm?: Record<string, string>;
			publicFaqItemsVm?: import('$lib/content/constants/publicFaqCatalog').PublicFaqItem[];
			pageMetaTags?: BaseMetaTags;
			schemaData?: Record<string, unknown>;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
