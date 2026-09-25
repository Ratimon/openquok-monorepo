import type { LayoutLoad } from './$types';
import { goto } from '$app/navigation';
import { authenticationRepository, getPostSigninRedirectTarget } from '$lib/user-auth/index';
import {
	getRootPathConfirmChangePassword,
	getRootPathForgotPassword,
	getRootPathSignin,
	getRootPathVerifySignup
} from '$lib/user-auth/constants/getRootpathUserAuth';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
import { url } from '$lib/utils/path';

export const ssr = false;

export const load: LayoutLoad = async ({ parent, data, url: loadUrl }) => {
	const { isLoggedIn } = await parent();

	const confirmChangePasswordPath = url(getRootPathConfirmChangePassword());
	const forgotPasswordPath = url(getRootPathForgotPassword());
	const signInPath = url(getRootPathSignin());
	const verifySignupPath = url(getRootPathVerifySignup());
	const isConfirmChangePassword = loadUrl.pathname === confirmChangePasswordPath;
	const isForgotPassword = loadUrl.pathname === forgotPasswordPath;
	const isSignIn = loadUrl.pathname === signInPath;
	const isVerifySignup = loadUrl.pathname === verifySignupPath;
	const stayOnSignInUnverified =
		isSignIn &&
		authenticationRepository.isAuthenticated() &&
		authenticationRepository.currentUser?.isEmailVerified === false;
	const allowAuthPage =
		isConfirmChangePassword || isForgotPassword || isVerifySignup || stayOnSignInUnverified;

	if (authenticationRepository.isAuthenticated() && !allowAuthPage) {
		const accountPath = url(getRootPathAccount());
		const destination = getPostSigninRedirectTarget(loadUrl.searchParams, accountPath);
		goto(destination, { replaceState: true });
	}

	return { ...data, isLoggedIn };
};
