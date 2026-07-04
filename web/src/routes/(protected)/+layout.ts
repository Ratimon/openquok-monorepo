import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { authenticationRepository } from '$lib/user-auth/index';
import { syncEmailVerificationState } from '$lib/user-auth/utils/syncEmailVerificationState';
import { getRootPathSignin, getRootPathVerifySignup } from '$lib/user-auth/constants/getRootpathUserAuth';
import { url } from '$lib/utils/path';

export const ssr = false;

export const load: LayoutLoad = async ({ url: loadUrl, parent, fetch }) => {
	await parent();
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

	const emailVerified = await syncEmailVerificationState(fetch);
	if (!emailVerified) {
		const email = authenticationRepository.currentUser?.email?.trim();
		const verifyPath = url(getRootPathVerifySignup());
		const verifyUrl = email
			? `${verifyPath}?email=${encodeURIComponent(email)}`
			: verifyPath;
		throw redirect(302, verifyUrl);
	}

	return {
		currentUser: authenticationRepository.currentUser
	};
};
