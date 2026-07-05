import type { MetaTagsProps } from 'svelte-meta-tags';

import {
	getRootPathPublicBuildingBlocksCategories
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicBuildingBlocksPagePresenter } from '$lib/area-public/index';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getListingPresenter, listingRepository } from '$lib/listings/index';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Building Block Categories';
	const customDescription =
		'Browse all building block categories — skills and MCP servers grouped by topic.';
	const customSlug = getRootPathPublicBuildingBlocksCategories();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: ['building blocks', 'categories', 'agent skills', 'MCP servers'],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch, limit: 50 });
	const categoryDetails = await listingRepository.getActiveCategories(fetch);
	const categories = getListingPresenter.buildExtensionCategoriesOverviewVm(
		hub.extensions,
		hub.categories,
		categoryDetails
	);

	return {
		pageMetaTags,
		isLoggedIn,
		categories
	};
}
