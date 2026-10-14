import { redirect } from '@sveltejs/kit';

import { getRootPathAccount } from '$lib/area-protected';
import { route } from '$lib/utils/path';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
	await parent();
	const accountPath = route(getRootPathAccount());
	const params = new URLSearchParams(url.searchParams);
	params.set('tab', 'products');
	redirect(302, `${accountPath}?${params.toString()}`);
};
