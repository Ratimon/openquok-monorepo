import { redirect } from '@sveltejs/kit';

import { getRootPathAccount, getAccountStackEditorPath } from '$lib/area-protected';
import { route } from '$lib/utils/path';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	throw redirect(301, route(`${getRootPathAccount()}/${getAccountStackEditorPath(params.id)}`));
};
