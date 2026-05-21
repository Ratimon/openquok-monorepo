import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: LayoutLoad = async ({ parent }) => {
	const parentData = await parent();
	const currentUser = (parentData as App.LayoutData)?.currentUser ?? null;

	const roles = currentUser?.roles ?? [];
	const isEditor = Array.isArray(roles) && roles.includes('editor');
	const isAdmin = Array.isArray(roles) && roles.includes('admin');
	const isPlatformAdmin = (currentUser as any)?.isPlatformAdmin === true;

	if (!isEditor && !isPlatformAdmin) {
		throw redirect(302, '/');
	}

	return {
		...parentData,
		isEditor,
		isAdmin,
		isPlatformAdmin
	};
};

