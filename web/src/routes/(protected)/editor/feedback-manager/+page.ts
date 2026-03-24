import { browser } from '$app/environment';

import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ parent, data, url }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isSuperAdmin = currentUser?.isSuperAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	const { createMetaData } = await import('$lib/utils/createMetaData');
	const { CONFIG_SCHEMA_MARKETING } = await import('$lib/config/constants/config');
	const metaTags = await createMetaData({
		customTitle: 'Editor: Feedback manager',
		companyInformation: (parentData as { companyInformationPm?: any }).companyInformationPm ?? null,
		marketingInformation: (parentData as { marketingInformationPm?: any }).marketingInformationPm ?? null,
		requestUrl: url
	});

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags
	});

	const out = {
		pageMetaTags,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isSuperAdmin,
		isAdmin,
		isEditor
	};

	if (browser && data) {
		return out;
	}

	return out;
};
