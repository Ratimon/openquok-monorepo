import { profileRepository } from '$lib/account';
import { authenticationRepository } from '$lib/user-auth/index';

/**
 * Reconcile `isEmailVerified` from GET /users/me (auth store can lag after verify-signup).
 *
 * Fast path: if the cached user already has `isEmailVerified === true`, skip the
 * network round-trip entirely. Only fall through to GET /me for users whose verification
 * state is unknown or explicitly false (e.g. right after the verification e-mail flow).
 */
export async function syncEmailVerificationState(
	fetch?: typeof globalThis.fetch
): Promise<boolean> {
	if (authenticationRepository.currentUser?.isEmailVerified === true) {
		return true;
	}

	try {
		await authenticationRepository.checkAuth(fetch, { forceProfile: true });
	} catch {
		// Fall through to direct profile read.
	}

	// Re-read after the async checkAuth may have updated the user profile.
	const refreshedUser = authenticationRepository.currentUser;
	if (refreshedUser?.isEmailVerified === true) {
		return true;
	}

	const profile = await profileRepository.getProfile({ fetch });
	if (profile?.isEmailVerified === true) {
		authenticationRepository.updateStoredProfile({ isEmailVerified: true });
		return true;
	}

	return false;
}
