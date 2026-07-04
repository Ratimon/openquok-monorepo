import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getProfilePresenter } from '$lib/account';
import { hasPublicUsername } from '$lib/account/utils/hasPublicUsername';
import {
	getRootPathAccount,
	getRootPathChooseUsername,
	getRootPathPlaybooksHub
} from '$lib/area-protected/getRootPathProtectedArea';
import { url, route } from '$lib/utils/path';
import type { LayoutLoad } from './$types';

export const ssr = false;

/** Listing editor routes require a public username for creator-scoped URLs. */
function listingEditorPathRequiresUsername(pathname: string): boolean {
	const playbooksRoot = route(`/${getRootPathAccount()}/${getRootPathPlaybooksHub()}`);
	if (!pathname.startsWith(playbooksRoot)) return false;
	const remainder = pathname.slice(playbooksRoot.length);
	return /^\/(building-block|playbook)\/(new|[^/]+)\/?$/.test(remainder);
}

export const load: LayoutLoad = async ({ parent, url: pageUrl }) => {
	await parent();

	if (!browser) return {};

	const chooseUsernamePath = route(`/${getRootPathAccount()}/${getRootPathChooseUsername()}`);
	if (pageUrl.pathname === chooseUsernamePath || pageUrl.pathname.startsWith(`${chooseUsernamePath}/`)) {
		return {};
	}

	if (!listingEditorPathRequiresUsername(pageUrl.pathname)) {
		return {};
	}

	const profile = await getProfilePresenter.loadProfileVm();
	if (hasPublicUsername(profile?.username)) {
		return {};
	}

	const redirectURL = encodeURIComponent(pageUrl.pathname + pageUrl.search);
	throw redirect(302, `${url(chooseUsernamePath)}?redirectURL=${redirectURL}`);
};
