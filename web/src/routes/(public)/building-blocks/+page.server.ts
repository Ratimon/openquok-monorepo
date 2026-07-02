import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicExtensionsPagePresenter } from '$lib/area-public';
import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getListingPresenter } from '$lib/listings/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters = publicExtensionsPagePresenter.parseFiltersFromUrl(url.searchParams);
	const hub = await publicExtensionsPagePresenter.loadExtensionsHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	});
	const filteredExtensions = publicExtensionsPagePresenter.applyClientFilters(
		hub.extensions,
		filters,
		tagFilterVm
	);

	const statsVm = getListingPresenter.computeHubStats(hub.extensions, hub.categories);

	const customTitle = hub.metaTitle;
	const customDescription = hub.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicBuildingBlocks(),
		customTags: [
			'agent extensions',
			'MCP servers',
			'agent skills',
			'OpenQuok extensions',
			'AI agent tools'
		],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
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
		]
	};

	return {
		pageMetaTags,
		isLoggedIn,
		metaTitle: hub.metaTitle,
		metaDescription: hub.metaDescription,
		extensionsVm: filteredExtensions,
		allExtensionsVm: hub.extensions,
		categoriesVm: hub.categories,
		statsVm,
		filtersVm: filters,
		tagFilterVm,
		totalCount: hub.totalCount,
		schemaData
	};
}
