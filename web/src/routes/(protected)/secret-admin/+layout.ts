import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: LayoutLoad = async ({ parent }) => {
	const parentData = await parent();
	const currentUser = (parentData as App.LayoutData)?.currentUser ?? null;
	const isSuperAdmin = (currentUser as { isSuperAdmin?: boolean })?.isSuperAdmin === true;

	if (!isSuperAdmin) {
		throw redirect(302, '/');
	}

	return {
		...parentData,
		isSuperAdmin
	};
};
