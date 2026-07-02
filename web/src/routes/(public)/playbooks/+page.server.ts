import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicStacksPagePresenter } from '$lib/area-public';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { getListingPresenter } from '$lib/listings/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters = publicStacksPagePresenter.parseFiltersFromUrl(url.searchParams);
	const hub = await publicStacksPagePresenter.loadStacksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});
	const filteredStacks = publicStacksPagePresenter.applyClientFilters(hub.stacks, filters, tagFilterVm);
	const statsVm = getListingPresenter.computeStacksHubStats(hub.stacks, hub.categories);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${hub.metaTitle} | ${companyName}`,
		customDescription: hub.metaDescription,
		customSlug: getRootPathPublicPlaybooks(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: hub.metaTitle,
				description: hub.metaDescription,
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
		pageMetaTags: metaTags,
		isLoggedIn,
		stacksVm: filteredStacks,
		allStacksVm: hub.stacks,
		categoriesVm: hub.categories,
		statsVm,
		filtersVm: filters,
		tagFilterVm,
		totalCount: hub.totalCount,
		metaTitle: hub.metaTitle,
		metaDescription: hub.metaDescription,
		schemaData
	};
}
