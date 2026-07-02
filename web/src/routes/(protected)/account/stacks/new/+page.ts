import { redirect } from '@sveltejs/kit';

import { getRootPathAccount, getAccountNewPlaybookPath } from '$lib/area-protected';
import { route } from '$lib/utils/path';

import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	throw redirect(301, route(`${getRootPathAccount()}/${getAccountNewPlaybookPath()}`));
};
