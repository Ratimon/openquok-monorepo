import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export async function load({ url, fetch, params, parent }) {
	const { companyInformationPm, marketingInformationPm } = await parent();

	const metaTags = await createMetaData({
		customTitle: 'Page Not Found',
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags,
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags: pageMetaTags,
	};
}
