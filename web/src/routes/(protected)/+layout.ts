import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { authenticationRepository } from '$lib/user-auth/index';
import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
import { url } from '$lib/utils/path';

export const ssr = false;

export const load: LayoutLoad = async ({ url: loadUrl, parent, fetch }) => {
	await parent();
	await authenticationRepository.checkAuth(fetch);

	if (!authenticationRepository.isAuthenticated()) {
		let redirectPath = loadUrl.pathname + loadUrl.search;
		if (redirectPath.startsWith('//')) redirectPath = '/';
		if (!redirectPath.startsWith('/')) redirectPath = '/' + redirectPath;
		const redirectURL = encodeURIComponent(redirectPath);
		const signinPath = url(getRootPathSignin());
		const signinUrl = `${signinPath}?redirectURL=${redirectURL}`;
		throw redirect(302, signinUrl);
	}

	// Allow all authenticated users through; verification can be enforced per-page or by backend
	return {
		currentUser: authenticationRepository.currentUser
	};
};
