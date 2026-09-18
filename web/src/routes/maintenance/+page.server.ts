import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';

import { getCompanyConfigDefaults } from '$lib/config/constants/config';
import { buildCanonicalUrl } from '$lib/seo/buildCanonicalUrl';

export const ssr = true;
export const prerender = false;

export const load: PageServerLoad = async ({ parent, url, setHeaders }) => {
	setHeaders({ 'X-Robots-Tag': 'noindex, nofollow' });

	const parentData = await parent();
	const companyName =
		(typeof parentData.companyInformationPm?.config?.NAME === 'string' &&
			parentData.companyInformationPm.config.NAME.trim()) ||
		(typeof parentData.companyNameVm === 'string' && parentData.companyNameVm.trim()) ||
		String(getCompanyConfigDefaults().NAME ?? 'OpenQuok');

	const title = 'Scheduled maintenance';
	const description =
		'The workspace is paused for scheduled maintenance. Public pages, docs, and the blog stay available.';

	const pageMetaTags = Object.freeze({
		robots: 'noindex, nofollow',
		title,
		titleTemplate: `%s | ${companyName}`,
		description,
		canonical: buildCanonicalUrl(url)
	}) satisfies MetaTagsProps;

	return {
		...parentData,
		pageMetaTags
	};
};
