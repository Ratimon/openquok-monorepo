import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicRoadmapPagePresenter } from '$lib/area-public';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const {
		metaTitle: customTitle,
		metaDescription: customDescription,
		roadmapItems,
		roadmapColumnOptionsVm,
		roadmapCategories
	} = publicRoadmapPagePresenter.loadRoadmapHubStateless();

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
		roadmapItems,
		roadmapColumnOptionsVm,
		roadmapCategories,
		metaTitle: customTitle,
		metaDescription: customDescription
	};
}
