import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { authenticationRepository } from '$lib/user-auth/index';
import { getRootPathSignin, getRootPathVerifySignup } from '$lib/user-auth/constants/getRootpathUserAuth';
import { url } from '$lib/utils/path';

export const ssr = false;

export const load: LayoutLoad = async ({ url: loadUrl, parent, fetch }) => {
	await parent();
	// Root layout may SSR as signed-out before the client runs `checkAuth`, or hydration can race.
	// One client-side auth sync avoids bouncing to sign-in right after OAuth when cookies are valid.
	if (browser && !authenticationRepository.isAuthenticated()) {
		try {
			await authenticationRepository.checkAuth(fetch);
		} catch {
			// Same tolerance as root +layout.ts — navigation should not hard-fail on transient errors.
		}
	}

	if (!authenticationRepository.isAuthenticated()) {
		let redirectPath = loadUrl.pathname + loadUrl.search;
		if (redirectPath.startsWith('//')) redirectPath = '/';
		if (!redirectPath.startsWith('/')) redirectPath = '/' + redirectPath;
		const redirectURL = encodeURIComponent(redirectPath);
		const signinPath = url(getRootPathSignin());
		const signinUrl = `${signinPath}?redirectURL=${redirectURL}`;
		throw redirect(302, signinUrl);
	}

	let user = authenticationRepository.currentUser;
	if (user && user.isEmailVerified !== true) {
		try {
			await authenticationRepository.checkAuth(fetch, { forceProfile: true });
			user = authenticationRepository.currentUser;
		} catch {
			// Keep prior user; redirect below if still unverified
		}
	}
	if (user && user.isEmailVerified !== true) {
		const verifyPath = url(getRootPathVerifySignup());
		const verifyUrl = `${verifyPath}?email=${encodeURIComponent(user.email)}`;
		throw redirect(302, verifyUrl);
	}

	return {
		currentUser: authenticationRepository.currentUser
	};
};
