import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { getRootPathOauthAuthorize } from '$lib/user-auth/constants/getRootpathUserAuth';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { companyInformationPm, marketingInformationPm } = await parent();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: 'Authorize application',
		customDescription: 'Approve an application to access your OpenQuok workspace.',
		customSlug: getRootPathOauthAuthorize(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		...withCanonicalMetaTags(metaTags, buildCanonicalUrl(url)),
		robots: 'noindex, nofollow'
	}) satisfies MetaTagsProps;

	return { pageMetaTags };
};
