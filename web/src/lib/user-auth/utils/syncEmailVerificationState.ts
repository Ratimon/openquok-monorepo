import { profileRepository } from '$lib/account';
import { authenticationRepository } from '$lib/user-auth';

/**
 * Reconcile `isEmailVerified` from GET /users/me (auth store can lag after verify-signup).
 */
export async function syncEmailVerificationState(
	fetch?: typeof globalThis.fetch
): Promise<boolean> {
	try {
		await authenticationRepository.checkAuth(fetch, { forceProfile: true });
	} catch {
		// Fall through to direct profile read.
	}

	if (authenticationRepository.currentUser?.isEmailVerified === true) {
		return true;
	}

	const profile = await profileRepository.getProfile({ fetch });
	if (profile?.isEmailVerified === true) {
		authenticationRepository.updateStoredProfile({ isEmailVerified: true });
		return true;
	}

	return false;
}
