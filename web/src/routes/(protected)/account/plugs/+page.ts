import { browser } from '$app/environment';

import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/PublicInformation.repository.svelte';
import type { PageLoad } from './$types';

type ParentLayoutWithPublicInfo = {
	companyInformationPm?: CompanyInformationProgrammerModel | null;
	marketingInformationPm?: MarketingInformationProgrammerModel | null;
};

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
	const publicInfo = parentData as ParentLayoutWithPublicInfo;

	const metaTags = await createMetaData({
		customTitle: 'Account: Plugs',
		companyInformation: publicInfo.companyInformationPm ?? null,
		marketingInformation: publicInfo.marketingInformationPm ?? null,
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
