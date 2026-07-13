import type { MetaTagsProps } from 'svelte-meta-tags';

import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	ROADMAP_CATEGORIES,
	ROADMAP_COLUMNS,
	ROADMAP_ITEMS
} from '$lib/roadmap/constants/roadmapCatalog';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Roadmap';
	const customDescription =
		'See what we are planning, building, and shipping next for OpenQuok. Upvote ideas and share feedback.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: 'roadmap',
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: customTitle,
			description: customDescription,
			url: canonical,
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		}
	]);

	return {
		pageMetaTags,
		schemaData,
		isLoggedIn,
		roadmapItems: ROADMAP_ITEMS,
		roadmapColumns: ROADMAP_COLUMNS,
		roadmapCategories: ROADMAP_CATEGORIES,
		metaTitle: customTitle,
		metaDescription: customDescription
	};
}
