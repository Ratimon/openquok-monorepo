import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
	if (browser) {
		// Fallback: if Supabase redirects back to the frontend Site URL with `?code=...`,
		// forward to the backend callback so it can exchange the code and set cookies.
		// We scope this to the landing page to avoid interfering with other flows that may also use `code`.
		const code = url.searchParams.get('code');
		if (code && url.pathname === '/') {
			try {
				const { CONFIG_SCHEMA_BACKEND } = await import('$lib/config/constants/config');
				let base = normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
				if (!base) base = url.origin;
				const callback = new URL('/api/v1/auth/oauth/google/callback', `${base}/`);
				callback.searchParams.set('code', code);
				callback.searchParams.set('next', '/account');
				// Let +layout.svelte show a blocking message, then redirect (avoids a flash of the homepage).
				return {
					...(data || {}),
					currentUser: null,
					authStatus: 'CHECKING',
					isLoggedIn: false,
					oauthCodeRedirectPending: true,
					oauthCodeRedirectUrl: callback.toString()
				};
			} catch {
				// continue to normal auth below
			}
		}

		// Security: authenticationRepository only on client — never in +layout.server.ts / +page.server.ts
		try {
			const { authenticationRepository } = await import('$lib/user-auth/index');
			await authenticationRepository.checkAuth(fetch);
			return {
				...(data || {}),
				currentUser: authenticationRepository.currentUser,
				authStatus: authenticationRepository.currentAuthStatus.status,
				isLoggedIn: authenticationRepository.isAuthenticated()
			};
		} catch {
			// Ensure failed auth check never blocks navigation (e.g. refresh 401, network error)
			const { authenticationRepository } = await import('$lib/user-auth/index');
			authenticationRepository.forceUnauthenticated();
			return {
				...(data || {}),
				currentUser: null,
				authStatus: 'UNAUTHENTICATED',
				isLoggedIn: false
			};
		}
	}
	return {
		...(data || {}),
		currentUser: null,
		authStatus: 'UNAUTHENTICATED',
		isLoggedIn: false
	};
};
