import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	if (browser) {
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
