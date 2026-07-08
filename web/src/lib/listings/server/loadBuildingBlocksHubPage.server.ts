import type { MetaTagsProps } from 'svelte-meta-tags';
import type { ServerLoadEvent } from '@sveltejs/kit';

import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicBuildingBlocksPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import type { ExtensionsHubFilters } from '$lib/listings/listing.types';
import { getListingPresenter } from '$lib/listings/index';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createBuildingBlocksItemListSchema,
	createCategoryAboutSchema,
	createCollectionPageSchema,
	createTagAboutSchema
} from '$lib/listings/utils/createBuildingBlocksSeoSchema';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

type BuildingBlocksHubLoadOverrides = {
	fixedCategorySlug?: string;
	fixedTagSlug?: string;
	fixedTagGroupSlug?: string;
	heroTitle?: string;
	heroDescription?: string;
	customSlug?: string;
	categoryTermName?: string;
	categoryTermDescription?: string;
	tagTermName?: string;
	tagTermDescription?: string;
};

export async function loadBuildingBlocksHubPage(
	event: ServerLoadEvent,
	overrides: BuildingBlocksHubLoadOverrides = {}
) {
	const { url, fetch, cookies, parent } = event;
	const {
		fixedCategorySlug,
		fixedTagSlug,
		fixedTagGroupSlug,
		heroTitle,
		heroDescription,
		customSlug,
		categoryTermName,
		categoryTermDescription,
		tagTermName,
		tagTermDescription
	} = overrides;

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters: ExtensionsHubFilters = {
		...publicBuildingBlocksPagePresenter.parseFiltersFromUrl(url.searchParams)
	};
	if (fixedCategorySlug) {
		filters.category = fixedCategorySlug;
	}
	if (fixedTagSlug) {
		filters.tags = [fixedTagSlug];
		filters.tagGroup = undefined;
	} else if (fixedTagGroupSlug) {
		filters.tagGroup = fixedTagGroupSlug;
		filters.tags = undefined;
	}

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch, limit: 50 });
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(fetch);
	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	});
	const filteredBuildingBlocks = publicBuildingBlocksPagePresenter.applyClientFilters(
		hub.extensions,
		filters,
		tagFilterVm
	);

	const statsVm = getListingPresenter.computeHubStats(hub.extensions, hub.categories);

	const customTitle = heroTitle ?? PUBLIC_BUILDING_BLOCKS_HUB.title;
	const customDescription = heroDescription ?? PUBLIC_BUILDING_BLOCKS_HUB.description;
	const seoKeywords = PUBLIC_BUILDING_BLOCKS_HUB.seoKeywords.filter(
		(keyword) => typeof keyword === 'string' && keyword.trim().length > 0
	);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: customSlug ?? getRootPathPublicBuildingBlocks(),
		customTags: seoKeywords,
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

	const aboutNodes = [
		fixedCategorySlug
			? createCategoryAboutSchema({
					origin: url.origin,
					slug: fixedCategorySlug,
					name: categoryTermName ?? customTitle,
					description: categoryTermDescription ?? customDescription
				})
			: null,
		fixedTagSlug
			? createTagAboutSchema({
					origin: url.origin,
					slug: fixedTagSlug,
					name: tagTermName ?? customTitle,
					description: tagTermDescription ?? customDescription
				})
			: null,
		fixedTagGroupSlug
			? createTagAboutSchema({
					origin: url.origin,
					slug: fixedTagGroupSlug,
					name: tagTermName ?? customTitle,
					description: tagTermDescription ?? customDescription
				})
			: null
	].filter((node): node is Record<string, unknown> => node !== null);

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			createCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: `${canonical}#building-blocks-list`,
				about: aboutNodes.length > 0 ? aboutNodes : undefined
			}),
			createBuildingBlocksItemListSchema({
				canonical,
				origin: url.origin,
				name: customTitle,
				description: customDescription,
				buildingBlocks: filteredBuildingBlocks
			}),
			...aboutNodes,
			...(fixedCategorySlug || fixedTagSlug || fixedTagGroupSlug
				? []
				: [
						createPublicFaqSEOSchema({
							pageUrl: `${canonical}#faq`,
							name: PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqTitle,
							description: PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqDescription,
							items: PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqItems
						})
					])
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		buildingBlocksVm: filteredBuildingBlocks,
		allBuildingBlocksVm: hub.extensions,
		categoriesVm: hub.categories,
		statsVm,
		filtersVm: filters,
		tagFilterVm,
		totalCount: hub.totalCount,
		schemaData,
		heroTitle: customTitle,
		heroDescription: customDescription,
		heroSubtitle: PUBLIC_BUILDING_BLOCKS_HUB.subtitle
	};
}
