import { redirect } from '@sveltejs/kit';

import { getRootPathAccount, getAccountPlaybookEditorPath } from '$lib/area-protected';
import { route } from '$lib/utils/path';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	throw redirect(301, route(`${getRootPathAccount()}/${getAccountPlaybookEditorPath(params.id)}`));
};
