import type { PageLoad } from './$types';

import { createMetaData } from '$lib/utils/createMetaData';
import { CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';

export const ssr = false;

export const load: PageLoad = async ({ parent, url }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isSuperAdmin = currentUser?.isSuperAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	const metaTags = await createMetaData({
		customTitle: 'Secret admin: Queues (Bull Board)',
		companyInformation: null,
		marketingInformation: null,
		requestUrl: url
	});

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	});

	return {
		pageMetaTags,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isSuperAdmin,
		isAdmin,
		isEditor
	};
};
