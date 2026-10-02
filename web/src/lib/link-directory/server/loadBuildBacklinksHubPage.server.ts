import { error } from '@sveltejs/kit';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { DefinedTerm } from 'schema-dts';

import { getRootPathPublicBuildBacklinks } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	buildPublishedQueryFromTagSlugs,
	type BuildBacklinksPublishedTagQuery,
	isBuildBacklinksEditorialTagSlug,
	mergePublishedSiteFilterArrays
} from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import type { BuildBacklinksHubFilters } from '$lib/link-directory/link-directory.types';
import {
	createBuildBacklinksCategoryAboutSchema,
	createBuildBacklinksCollectionPageSchema,
	createBuildBacklinksItemListSchema,
	createBuildBacklinksTagAboutSchema
} from '$lib/link-directory/utils/createBuildBacklinksSeoSchema';
import {
	mapBuildBacklinksSortToApi,
	parseBuildBacklinksHubQueryFiltersFromUrl
} from '$lib/link-directory/utils/buildBuildBacklinksHubNavigationUrl';
import {
	buildListingsHubBreadcrumbItems,
	deriveListingsHubBreadcrumbVariant
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
import { parseHubListPagination } from '$lib/listings/utils/hubListPagination';
import {
	formatBuildBacklinksHubHeroDescription,
	toBuildBacklinksHubStatsViewModel
} from '$lib/link-directory/utils/buildBuildBacklinksHubStats';
import { shouldNoindexBuildBacklinksHubListing } from '$lib/link-directory/utils/shouldNoindexBuildBacklinksHubListing';

export const ssr = true;

type BuildBacklinksHubLoadOverrides = {
	fixedCategorySlug?: string;
	fixedTagSlug?: string;
	heroTitle?: string;
	heroDescription?: string;
	customSlug?: string;
	categoryTermName?: string;
	categoryTermDescription?: string;
	tagTermName?: string;
	tagTermDescription?: string;
};

export async function loadBuildBacklinksHubPage(
	event: ServerLoadEvent,
	overrides: BuildBacklinksHubLoadOverrides = {}
) {
	const { url, fetch, cookies, parent } = event;
	const {
		fixedCategorySlug,
		fixedTagSlug,
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

	const queryFilters = parseBuildBacklinksHubQueryFiltersFromUrl(url.searchParams);
	const filters: BuildBacklinksHubFilters = {
		sort: queryFilters.sort,
		...(queryFilters.search ? { search: queryFilters.search } : {}),
		...(queryFilters.costTiers ? { costTiers: queryFilters.costTiers } : {}),
		...(queryFilters.dofollow ? { dofollow: queryFilters.dofollow } : {}),
		...(queryFilters.effort ? { effort: queryFilters.effort } : {}),
		...(queryFilters.approvalMode ? { approvalMode: queryFilters.approvalMode } : {}),
		...(queryFilters.opportunityTypeSlugs
			? { opportunityTypeSlugs: queryFilters.opportunityTypeSlugs }
			: {})
	};

	if (fixedCategorySlug) {
		filters.category = fixedCategorySlug;
	}
	if (fixedTagSlug) {
		filters.tags = [fixedTagSlug];
	}

	let tagPublishedQuery: BuildBacklinksPublishedTagQuery | undefined;
	if (filters.tags?.length) {
		const tagResolution = buildPublishedQueryFromTagSlugs(filters.tags);
		if (!tagResolution.ok) {
			throw error(404, 'Tag not found');
		}
		tagPublishedQuery = tagResolution.query;
	}

	const { page, itemsPerPage } = parseHubListPagination(url.searchParams);
	const skip = (page - 1) * itemsPerPage;
	const sortApi = mapBuildBacklinksSortToApi(filters.sort);

	const isMainHub = !fixedCategorySlug && !fixedTagSlug;

	const [categoriesVm, tagsVm, published, publishedHubStats] = await Promise.all([
		linkDirectoryRepository.getActiveCategories(fetch),
		linkDirectoryRepository.getActiveTags(fetch),
		linkDirectoryRepository.getPublishedSites({
			limit: itemsPerPage,
			skip,
			searchTerm: filters.search,
			tagSlugs: tagPublishedQuery?.tagSlugs,
			categorySlug: filters.category,
			costTiers: mergePublishedSiteFilterArrays(filters.costTiers, tagPublishedQuery?.costTiers),
			dofollow: mergePublishedSiteFilterArrays(filters.dofollow, tagPublishedQuery?.dofollow),
			effort: filters.effort,
			approvalMode: mergePublishedSiteFilterArrays(
				filters.approvalMode,
				tagPublishedQuery?.approvalMode
			),
			opportunityTypeSlugs: mergePublishedSiteFilterArrays(
				filters.opportunityTypeSlugs,
				tagPublishedQuery?.opportunityTypeSlugs
			),
			sortByKey: sortApi.sortByKey,
			sortByOrder: sortApi.sortByOrder,
			fetch
		}),
		isMainHub ? linkDirectoryRepository.getPublishedHubStats(fetch) : Promise.resolve(null)
	]);

	const filteredCount = published.count;
	const totalPages = Math.max(1, Math.ceil(filteredCount / Math.max(itemsPerPage, 1)));
	const listOffset = skip;

	const statsVm =
		publishedHubStats != null
			? toBuildBacklinksHubStatsViewModel({
					...publishedHubStats,
					categoryCount: categoriesVm.length
				})
			: null;

	const customTitle = heroTitle ?? PUBLIC_BUILD_BACKLINKS_HUB.title;
	const customDescription =
		heroDescription ??
		(statsVm ? formatBuildBacklinksHubHeroDescription(statsVm) : PUBLIC_BUILD_BACKLINKS_HUB.description);
	const seoKeywords = PUBLIC_BUILD_BACKLINKS_HUB.seoKeywords.filter(
		(keyword) => typeof keyword === 'string' && keyword.trim().length > 0
	);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: customSlug ?? getRootPathPublicBuildBacklinks(),
		customTags: seoKeywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const noindexHubListing = shouldNoindexBuildBacklinksHubListing(url);

	const pageMetaTags = Object.freeze({
		...withCanonicalMetaTags(metaTags, canonical, {
			openGraph: {
				title: customTitle,
				description: customDescription
			},
			twitter: {
				title: customTitle,
				description: customDescription
			}
		}),
		...(noindexHubListing ? { robots: 'noindex, follow' } : {})
	}) satisfies MetaTagsProps;

	const aboutNodes = [
		fixedCategorySlug
			? createBuildBacklinksCategoryAboutSchema({
					origin: url.origin,
					slug: fixedCategorySlug,
					name: categoryTermName ?? customTitle,
					description: categoryTermDescription ?? customDescription
				})
			: null,
		fixedTagSlug
			? createBuildBacklinksTagAboutSchema({
					origin: url.origin,
					slug: fixedTagSlug,
					name: tagTermName ?? customTitle,
					description: tagTermDescription ?? customDescription
				})
			: null
	].filter((node): node is DefinedTerm => node !== null);

	const listingsBreadcrumbVariant = deriveListingsHubBreadcrumbVariant({
		fixedCategorySlug,
		fixedTagSlug
	});
	const listingsBreadcrumb = {
		kind: 'build-backlinks' as const,
		variant: listingsBreadcrumbVariant,
		categoryLabel: fixedCategorySlug ? (categoryTermName ?? null) : null,
		categorySlug: fixedCategorySlug ?? null,
		tagLabel: fixedTagSlug ? (tagTermName ?? null) : null
	};

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createBreadcrumbListSchema(
				buildListingsHubBreadcrumbItems(listingsBreadcrumb),
				url.origin
			),
			createBuildBacklinksCollectionPageSchema({
				canonical,
				origin: url.origin,
				companyName,
				name: customTitle,
				description: customDescription,
				mainEntityId: noindexHubListing ? undefined : `${canonical}#build-backlinks-list`,
				about: aboutNodes.length > 0 ? aboutNodes : undefined
			}),
			...(noindexHubListing
				? []
				: [
						createBuildBacklinksItemListSchema({
							canonical,
							origin: url.origin,
							name: customTitle,
							description: customDescription,
							sites: published.sites,
							totalCount: filteredCount,
							listOffset
						})
					]),
			...aboutNodes,
			...(noindexHubListing || fixedCategorySlug || fixedTagSlug
				? []
				: [
						createPublicFaqSEOSchema({
							pageUrl: `${canonical}#faq`,
							name: PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqTitle,
							description: PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqDescription,
							items: PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqItems
						})
					])
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		sitesVm: published.sites,
		categoriesVm,
		tagsVm: tagsVm.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug)),
		filtersVm: filters,
		filteredCount,
		page,
		itemsPerPage,
		totalPages,
		listOffset,
		schemaData,
		heroTitle: customTitle,
		heroDescription: customDescription,
		heroSubtitle: PUBLIC_BUILD_BACKLINKS_HUB.subtitle,
		showHubFaq: isMainHub,
		statsVm,
		listingsBreadcrumb
	};
}
