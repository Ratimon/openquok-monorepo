import type { MetaTagsProps } from 'svelte-meta-tags';

import { getCompanyConfigDefaults } from '$lib/config/constants/config';
import { getAuthDocumentTitle } from '$lib/user-auth/constants/getRootpathUserAuth';

export const ssr = true;

export async function load({ parent, url }) {
	const parentData = await parent();
	const companyName =
		(typeof parentData.companyInformationPm?.config?.NAME === 'string' &&
			parentData.companyInformationPm.config.NAME.trim()) ||
		(typeof parentData.companyNameVm === 'string' && parentData.companyNameVm.trim()) ||
		String(getCompanyConfigDefaults().NAME ?? 'OpenQuok');

	const pageMetaTags = Object.freeze({
		robots: 'noindex, nofollow',
		title: getAuthDocumentTitle(url.pathname),
		titleTemplate: `%s | ${companyName}`
	}) satisfies MetaTagsProps;

	return {
		...parentData,
		pageMetaTags
	};
}
