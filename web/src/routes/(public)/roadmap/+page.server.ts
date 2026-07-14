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
			mainEntity: {
				'@id': `${canonical}#roadmap`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		},
		{
			'@type': 'ItemList',
			'@id': `${canonical}#roadmap`,
			name: customTitle,
			description: customDescription,
			url: canonical,
			numberOfItems: roadmapItems.length,
			itemListElement: roadmapItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.title,
				item: {
					'@type': 'Thing',
					name: item.title,
					identifier: item.id
				}
			}))
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
