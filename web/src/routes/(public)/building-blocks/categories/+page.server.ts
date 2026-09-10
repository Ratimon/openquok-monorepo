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
import {
	createCategoryTermSetSchema,
	createCollectionPageSchema
} from '$lib/listings/utils/createBuildingBlocksSeoSchema';
import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, fetch, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = 'Social Scheduling Building Block Categories';
	const customDescription =
		'Browse building block categories for social media scheduling — skills and MCP servers grouped by platform, topic, and marketing use case.';
	const customSlug = getRootPathPublicBuildingBlocksCategories();

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customTags: [...PUBLIC_BUILDING_BLOCKS_HUB.seoKeywords],
		customSlug,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch, limit: 50 });
	const categoryDetails = await listingRepository.getActiveCategories(fetch);
	const categories = getListingPresenter.buildExtensionCategoriesOverviewVm(
		hub.extensions,
		hub.categories,
		categoryDetails
	);
	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: `${canonical}#categories-set`
			}),
			createCategoryTermSetSchema({
				canonical,
				origin: url.origin,
				name: 'Building block categories',
				description: customDescription,
				categories
			})
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		categories,
		schemaData
	};
}
