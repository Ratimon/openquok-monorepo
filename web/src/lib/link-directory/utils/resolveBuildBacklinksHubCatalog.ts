import {
	buildPublishedQueryFromTagSlugs,
	type BuildBacklinksPublishedTagQuery,
	isBuildBacklinksEditorialTagSlug,
	mergePublishedSiteFilterArrays
} from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import type {
	BuildBacklinksHubFilters,
	LinkDirectoryCategoryDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';
import { mapBuildBacklinksSortToApi } from '$lib/link-directory/utils/buildBuildBacklinksHubNavigationUrl';
import {
	toBuildBacklinksHubStatsViewModel,
	type BuildBacklinksHubStatsViewModel
} from '$lib/link-directory/utils/buildBuildBacklinksHubStats';
import {
	HUB_LIST_FETCH_LIMIT,
	paginateHubList,
	type HubListPagination
} from '$lib/listings/utils/hubListPagination';

export type ResolveBuildBacklinksHubCatalogResult = {
	sitesVm: LinkDirectorySiteDto[];
	categoriesVm: LinkDirectoryCategoryDto[];
	tagsVm: LinkDirectoryTagDto[];
	filtersVm: BuildBacklinksHubFilters;
	filteredCount: number;
	page: number;
	itemsPerPage: number;
	totalPages: number;
	listOffset: number;
	statsVm: BuildBacklinksHubStatsViewModel | null;
	tagNotFound: boolean;
};

export async function resolveBuildBacklinksHubCatalog(options: {
	filters: BuildBacklinksHubFilters;
	pagination: HubListPagination;
	fetch?: typeof globalThis.fetch;
	loadHubStats?: boolean;
	/** When `filters.bookmarkedOnly`, intersect results with this shortlist (client bookmarks). */
	bookmarkedSiteSlugs?: string[];
}): Promise<ResolveBuildBacklinksHubCatalogResult> {
	const { filters, pagination, fetch, loadHubStats = false, bookmarkedSiteSlugs = [] } = options;
	const { page, itemsPerPage } = pagination;
	const bookmarkedOnly = filters.bookmarkedOnly === true;
	const bookmarkedSlugSet = new Set(bookmarkedSiteSlugs);

	if (bookmarkedOnly && bookmarkedSlugSet.size === 0) {
		const [categoriesVm, tagsVm, publishedHubStats] = await Promise.all([
			linkDirectoryRepository.getActiveCategories(fetch),
			linkDirectoryRepository.getActiveTags(fetch),
			loadHubStats
				? linkDirectoryRepository.getPublishedHubStats(fetch)
				: Promise.resolve(null)
		]);
		const statsVm =
			publishedHubStats != null
				? toBuildBacklinksHubStatsViewModel({
						...publishedHubStats,
						categoryCount: categoriesVm.length
					})
				: null;
		return {
			sitesVm: [],
			categoriesVm,
			tagsVm: tagsVm.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug)),
			filtersVm: filters,
			filteredCount: 0,
			page,
			itemsPerPage,
			totalPages: 1,
			listOffset: 0,
			statsVm,
			tagNotFound: false
		};
	}

	const skip = bookmarkedOnly ? 0 : (page - 1) * itemsPerPage;
	const fetchLimit = bookmarkedOnly ? HUB_LIST_FETCH_LIMIT : itemsPerPage;
	const sortApi = mapBuildBacklinksSortToApi(filters.sort);

	let tagNotFound = false;
	let tagPublishedQuery: BuildBacklinksPublishedTagQuery | undefined;
	if (filters.tags?.length) {
		const tagResolution = buildPublishedQueryFromTagSlugs(filters.tags);
		if (!tagResolution.ok) {
			tagNotFound = true;
		} else {
			tagPublishedQuery = tagResolution.query;
		}
	}

	const [categoriesVm, tagsVm, published, publishedHubStats] = await Promise.all([
		linkDirectoryRepository.getActiveCategories(fetch),
		linkDirectoryRepository.getActiveTags(fetch),
		tagNotFound
			? Promise.resolve({ sites: [] as LinkDirectorySiteDto[], count: 0 })
			: linkDirectoryRepository.getPublishedSites({
					limit: fetchLimit,
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
		loadHubStats
			? linkDirectoryRepository.getPublishedHubStats(fetch)
			: Promise.resolve(null)
	]);

	let sitesVm = published.sites;
	let filteredCount = published.count;

	if (bookmarkedOnly) {
		sitesVm = sitesVm.filter((site) => bookmarkedSlugSet.has(site.slug));
		filteredCount = sitesVm.length;
		const paginated = paginateHubList(sitesVm, page, itemsPerPage);
		sitesVm = paginated.items;
		filteredCount = paginated.count;
	}

	const totalPages = Math.max(1, Math.ceil(filteredCount / Math.max(itemsPerPage, 1)));
	const listOffset = bookmarkedOnly ? (page - 1) * itemsPerPage : skip;

	const statsVm =
		publishedHubStats != null
			? toBuildBacklinksHubStatsViewModel({
					...publishedHubStats,
					categoryCount: categoriesVm.length
				})
			: null;

	return {
		sitesVm,
		categoriesVm,
		tagsVm: tagsVm.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug)),
		filtersVm: filters,
		filteredCount,
		page,
		itemsPerPage,
		totalPages,
		listOffset,
		statsVm,
		tagNotFound
	};
}
