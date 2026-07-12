import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const hubVm = publicAlternativesPagePresenter.buildHubVm();
	const customTitle = `${hubVm.metaTitle} | ${companyName}`;
	const customDescription = hubVm.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicAlternatives(),
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

	const alternativePages = hubVm.entries.map((entry) => ({
		name: entry.title,
		url: new URL(entry.href, url.origin).href
	}));

	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: hubVm.metaTitle,
			description: hubVm.metaDescription,
			url: canonical,
			mainEntity: {
				'@id': `${canonical}#alternatives`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		},
		{
			'@type': 'ItemList',
			'@id': `${canonical}#alternatives`,
			name: 'Social media scheduler alternatives',
			url: canonical,
			numberOfItems: alternativePages.length,
			itemListElement: alternativePages.map((page, index) => ({
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
