import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { getRootPathJoinOrg } from '$lib/user-auth/constants/getRootpathUserAuth';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { companyInformationPm, marketingInformationPm } = await parent();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: 'Join workspace',
		customDescription: 'Accept a workspace invite and join your team on OpenQuok.',
		customSlug: getRootPathJoinOrg(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		...withCanonicalMetaTags(metaTags, buildCanonicalUrl(url)),
		robots: 'noindex, nofollow'
	}) satisfies MetaTagsProps;

	return { pageMetaTags };
};
