import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicRoadmapPagePresenter } from '$lib/area-public';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_ROADMAP_HUB_FAQ } from '$lib/content/constants/publicRoadmapHubFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

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

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical);

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
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
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_ROADMAP_HUB_FAQ.faqTitle,
				description: PUBLIC_ROADMAP_HUB_FAQ.faqDescription,
				items: PUBLIC_ROADMAP_HUB_FAQ.faqItems
			})
		])
	);

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
