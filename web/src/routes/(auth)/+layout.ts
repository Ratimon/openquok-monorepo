import type { LayoutLoad } from './$types';
import { goto } from '$app/navigation';
import { authenticationRepository } from '$lib/user-auth/index';
import {
	getRootPathConfirmChangePassword,
	getRootPathSignin,
	getRootPathVerifySignup
} from '$lib/user-auth/constants/getRootpathUserAuth';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
import { url } from '$lib/utils/path';

export const ssr = false;

export const load: LayoutLoad = async ({ parent, url: loadUrl }) => {
	const { isLoggedIn } = await parent();

	const confirmChangePasswordPath = url(getRootPathConfirmChangePassword());
	const signInPath = url(getRootPathSignin());
	const verifySignupPath = url(getRootPathVerifySignup());
	const isConfirmChangePassword = loadUrl.pathname === confirmChangePasswordPath;
	const isSignIn = loadUrl.pathname === signInPath;
	const isVerifySignup = loadUrl.pathname === verifySignupPath;
	// Allow sign-in so authenticated-but-unverified users can re-sign-in (no redirect loop with (protected)).
	const allowAuthPage = isConfirmChangePassword || isSignIn || isVerifySignup;

	if (authenticationRepository.isAuthenticated() && !allowAuthPage) {
		const accountPath = url(getRootPathAccount());
		goto(accountPath, { replaceState: true });
	}

	return { isLoggedIn };
};
