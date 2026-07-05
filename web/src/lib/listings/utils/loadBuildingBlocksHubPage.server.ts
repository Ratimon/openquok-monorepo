import type { MetaTagsProps } from 'svelte-meta-tags';
import type { ServerLoadEvent } from '@sveltejs/kit';

import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicExtensionsPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { getListingPresenter } from '$lib/listings/index';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

type BuildingBlocksHubLoadOverrides = {
	fixedCategorySlug?: string;
	fixedTagSlug?: string;
	fixedTagGroupSlug?: string;
	heroTitle?: string;
	heroDescription?: string;
	customSlug?: string;
};

export async function loadBuildingBlocksHubPage(
	event: ServerLoadEvent,
	overrides: BuildingBlocksHubLoadOverrides = {}
) {
	const { url, fetch, cookies, parent } = event;
	const { fixedCategorySlug, fixedTagSlug, fixedTagGroupSlug, heroTitle, heroDescription, customSlug } =
		overrides;

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const filters = publicExtensionsPagePresenter.parseFiltersFromUrl(url.searchParams);
	filters.category = undefined;
	filters.tags = undefined;
	filters.tagGroup = undefined;
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
			},
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
		extensionsVm: filteredExtensions,
		allExtensionsVm: hub.extensions,
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
