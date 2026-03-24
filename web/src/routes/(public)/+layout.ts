import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ data, parent }) => {
	// On client, use accurate auth state from root layout
	if (browser) {
		const parentData = await parent();
		return {
			...data,
			isLoggedIn: parentData?.isLoggedIn ?? data?.isLoggedIn
		};
	}
	return data;
};
