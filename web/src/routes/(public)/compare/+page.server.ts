import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicComparePagePresenter } from '$lib/area-public';
import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = publicComparePagePresenter.buildHubVm();
	const customTitle = `${hubVm.metaTitle} | ${companyName}`;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicCompare(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const comparisonPages = hubVm.pairs.map((pair) => ({
		name: `${hubVm.baseProductName} vs ${pair.name} comparison`,
		url: new URL(pair.href, url.origin).href
	}));

	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: hubVm.metaTitle,
			description: hubVm.metaDescription,
			url: canonical,
			mainEntity: {
				'@id': `${canonical}#comparisons`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		},
		{
			'@type': 'ItemList',
			'@id': `${canonical}#comparisons`,
			name: 'Comparison pages',
			url: canonical,
			numberOfItems: comparisonPages.length,
			itemListElement: comparisonPages.map((page, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'WebPage',
					'@id': `${page.url}#webpage`,
					name: page.name,
					url: page.url,
					isPartOf: {
						'@type': 'WebSite',
						name: companyName,
						url: url.origin
					}
				}
			}))
		}
	]);

	return {
		pageMetaTags,
		isLoggedIn,
		hubVm,
		schemaData
	};
}
