import { DEFAULT_BUILD_BACKLINKS_SORT } from '$lib/link-directory/constants/buildBacklinksSortOptions';
import type { BuildBacklinksHubFilters } from '$lib/link-directory/link-directory.types';
import { parseBuildBacklinksHubQueryFiltersFromUrl } from '$lib/link-directory/utils/buildBuildBacklinksHubNavigationUrl';
import type { ExtensionSort, ExtensionTypeFilter } from '$lib/listings/listing.types';
import {
	HUB_LIST_DEFAULT_PAGE_SIZE,
	parseHubListPagination
} from '$lib/listings/utils/hubListPagination';
import { parseExtensionsHubQueryFiltersFromUrl } from '$lib/listings/utils/buildExtensionsHubNavigationUrl';

export type SavedHubTabId = 'libs' | 'backlinks';
export type SavedLibsSegmentId = 'browse' | 'library';
export type SavedLibsListingKindFilter = 'all' | 'extension' | 'stack';

const TAB_PARAM = 'tab';
const LIBS_PARAM = 'libs';
const BOOKMARKED_PARAM = 'bookmarked';

/** Libs browse filters encoded on `/account/saved` (query-based; public hubs use path segments). */
export type AccountSavedLibsUrlFilters = {
	search: string;
	category: string | null;
	tags: string[];
	tagGroup: string | null;
	listingKind: SavedLibsListingKindFilter;
	sort: ExtensionSort;
	extensionType: ExtensionTypeFilter;
};

/** Backlinks catalog filters under `?tab=backlinks` (category/tags in query on account). */
export type AccountSavedBacklinksUrlFilters = BuildBacklinksHubFilters;

const DEFAULT_LIBS_URL_FILTERS: AccountSavedLibsUrlFilters = {
	search: '',
	category: null,
	tags: [],
	tagGroup: null,
	listingKind: 'all',
	sort: 'newest',
	extensionType: 'all'
};

function parseCsvSlugs(raw: string | null): string[] {
	if (!raw?.trim()) return [];
	return raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
}

/** Top-level Saved hub tab from `?tab=` (defaults to Libs). */
export function parseSavedHubTab(value: string | null): SavedHubTabId {
	if (value === 'backlinks') return 'backlinks';
	return 'libs';
}

/** Libs inner segment from `?libs=` and legacy `?tab=explore|mine`. */
export function parseSavedLibsSegment(
	tabParam: string | null,
	libsParam: string | null
): SavedLibsSegmentId {
	if (libsParam === 'library') return 'library';
	if (libsParam === 'browse') return 'browse';
	if (tabParam === 'mine') return 'library';
	if (tabParam === 'explore') return 'browse';
	return 'browse';
}

export function parseSavedBookmarkedFilter(value: string | null): boolean {
	return value === '1' || value === 'true';
}

/** Parse libs browse filters from the account saved hub query string. */
export function parseAccountSavedLibsFiltersFromUrl(
	searchParams: URLSearchParams
): AccountSavedLibsUrlFilters {
	const query = parseExtensionsHubQueryFiltersFromUrl(searchParams);
	const kindRaw = searchParams.get('kind');
	const listingKind: SavedLibsListingKindFilter =
		kindRaw === 'extension' || kindRaw === 'stack' ? kindRaw : 'all';
	const category = searchParams.get('category')?.trim() ?? '';
	const tagGroup = searchParams.get('tagGroup')?.trim() ?? '';

	return {
		search: query.search ?? '',
		category: category || null,
		tags: parseCsvSlugs(searchParams.get('tags')),
		tagGroup: tagGroup || null,
		listingKind,
		sort: query.sort,
		extensionType: query.type
	};
}

/** Parse backlinks catalog filters from the account saved hub query string. */
export function parseAccountSavedBacklinksFiltersFromUrl(
	searchParams: URLSearchParams
): AccountSavedBacklinksUrlFilters {
	const query = parseBuildBacklinksHubQueryFiltersFromUrl(searchParams);
	const category = searchParams.get('category')?.trim();
	const tags = parseCsvSlugs(searchParams.get('tags'));

	return {
		sort: query.sort ?? DEFAULT_BUILD_BACKLINKS_SORT,
		...(query.search ? { search: query.search } : {}),
		...(category ? { category } : {}),
		...(tags.length ? { tags } : {}),
		...(query.costTiers?.length ? { costTiers: query.costTiers } : {}),
		...(query.dofollow?.length ? { dofollow: query.dofollow } : {}),
		...(query.effort?.length ? { effort: query.effort } : {}),
		...(query.approvalMode?.length ? { approvalMode: query.approvalMode } : {}),
		...(query.opportunityTypeSlugs?.length
			? { opportunityTypeSlugs: query.opportunityTypeSlugs }
			: {}),
		...(parseSavedBookmarkedFilter(searchParams.get(BOOKMARKED_PARAM))
			? { bookmarkedOnly: true }
			: {})
	};
}

function appendLibsBrowseFilterParams(
	params: URLSearchParams,
	filters: AccountSavedLibsUrlFilters
): void {
	const merged = { ...DEFAULT_LIBS_URL_FILTERS, ...filters };
	if (merged.extensionType !== 'all') params.set('type', merged.extensionType);
	if (merged.sort !== 'newest') params.set('sort', merged.sort);
	if (merged.search.trim()) params.set('search', merged.search.trim());
	if (merged.category?.trim()) params.set('category', merged.category.trim());
	if (merged.tagGroup?.trim()) params.set('tagGroup', merged.tagGroup.trim());
	if (merged.tags.length) params.set('tags', merged.tags.join(','));
	if (merged.listingKind !== 'all') params.set('kind', merged.listingKind);
}

function appendBacklinksFilterParams(
	params: URLSearchParams,
	filters: AccountSavedBacklinksUrlFilters
): void {
	if (filters.sort !== DEFAULT_BUILD_BACKLINKS_SORT) params.set('sort', filters.sort);
	if (filters.search?.trim()) params.set('search', filters.search.trim());
	if (filters.category?.trim()) params.set('category', filters.category.trim());
	if (filters.tags?.length) params.set('tags', filters.tags.join(','));
	if (filters.costTiers?.length) params.set('cost', filters.costTiers.join(','));
	if (filters.dofollow?.length) params.set('dofollow', filters.dofollow.join(','));
	if (filters.effort?.length) params.set('effort', filters.effort.join(','));
	if (filters.approvalMode?.length) params.set('approval', filters.approvalMode.join(','));
	if (filters.opportunityTypeSlugs?.length) {
		params.set('opportunityTypeSlugs', filters.opportunityTypeSlugs.join(','));
	}
	if (filters.bookmarkedOnly) {
		params.set(BOOKMARKED_PARAM, '1');
	}
}

export function buildAccountSavedHubSearchParams(options: {
	tab: SavedHubTabId;
	libsSegment?: SavedLibsSegmentId;
	bookmarkedOnly?: boolean;
	libsFilters?: Partial<AccountSavedLibsUrlFilters>;
	backlinksFilters?: Partial<AccountSavedBacklinksUrlFilters>;
}): string {
	const params = new URLSearchParams();

	if (options.tab === 'backlinks') {
		params.set(TAB_PARAM, 'backlinks');
		if (options.bookmarkedOnly) {
			params.set(BOOKMARKED_PARAM, '1');
		}
		if (options.backlinksFilters) {
			appendBacklinksFilterParams(params, {
				sort: DEFAULT_BUILD_BACKLINKS_SORT,
				...options.backlinksFilters
			});
		}
		return params.toString();
	}

	params.set(TAB_PARAM, 'libs');
	if (options.libsSegment === 'library') {
		params.set(LIBS_PARAM, 'library');
	}
	if (options.bookmarkedOnly) {
		params.set(BOOKMARKED_PARAM, '1');
	}
	if (options.libsFilters) {
		appendLibsBrowseFilterParams(params, {
			...DEFAULT_LIBS_URL_FILTERS,
			...options.libsFilters
		});
	}
	return params.toString();
}

/** Build `/account/saved?tab=backlinks&…` for in-place catalog filters (category/tags are query params). */
export function buildAccountSavedBacklinksNavigationUrl(
	pathname: string,
	current: AccountSavedBacklinksUrlFilters,
	overrides: Partial<AccountSavedBacklinksUrlFilters>,
	options?: { preservePaginationFrom?: URLSearchParams }
): string {
	const next: AccountSavedBacklinksUrlFilters = { ...current, ...overrides };
	const params = new URLSearchParams(
		buildAccountSavedHubSearchParams({ tab: 'backlinks', backlinksFilters: next })
	);

	const preserve = options?.preservePaginationFrom;
	if (preserve) {
		const { page, itemsPerPage } = parseHubListPagination(preserve);
		if (page > 1) params.set('page', String(page));
		if (itemsPerPage !== HUB_LIST_DEFAULT_PAGE_SIZE) {
			params.set('ipp', String(itemsPerPage));
		}
	}

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}
