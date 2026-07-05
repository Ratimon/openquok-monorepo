import {
	getRootPathPublicBuildingBlocks,
	getRootPathPublicBuildingBlocksCategory,
	getRootPathPublicBuildingBlocksCategoryTag,
	getRootPathPublicBuildingBlocksTag
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import type {
	ExtensionSort,
	ExtensionTypeFilter,
	ExtensionsHubFilters
} from '$lib/listings/listing.types';
import { route } from '$lib/utils/path';

/** Parse sort / type / search from the query string (category and tags use path segments). */
export function parseExtensionsHubQueryFiltersFromUrl(
	searchParams: URLSearchParams
): Pick<ExtensionsHubFilters, 'type' | 'sort' | 'search'> {
	const type = searchParams.get('type');
	const sort = searchParams.get('sort');
	const search = searchParams.get('search')?.trim();

	const typeFilter: ExtensionTypeFilter =
		type === 'skills' || type === 'mcp' || type === 'both' || type === 'official' ? type : 'all';
	const sortFilter: ExtensionSort =
		sort === 'oldest' || sort === 'popular' || sort === 'views' ? sort : 'newest';

	return {
		type: typeFilter,
		sort: sortFilter,
		...(search ? { search } : {})
	};
}

/** Non-SEO query params only (sort, type, search). Category/tag filters live in the path. */
function appendHubQueryParams(filters: ExtensionsHubFilters): string {
	const params = new URLSearchParams();
	if (filters.type !== 'all') params.set('type', filters.type);
	if (filters.sort !== 'newest') params.set('sort', filters.sort);
	if (filters.search?.trim()) params.set('search', filters.search.trim());
	const query = params.toString();
	return query ? `?${query}` : '';
}

function tagPathSlugFromFilters(filters: ExtensionsHubFilters): string | undefined {
	const singleTag = filters.tags?.length === 1 ? filters.tags[0]?.trim() : undefined;
	const tagGroup = filters.tagGroup?.trim();
	return singleTag || tagGroup || undefined;
}

/** Canonical path for category / tag / combined filters (no query). */
export function resolveExtensionsHubPath(filters: ExtensionsHubFilters): string {
	const category = filters.category?.trim();
	const tagPathSlug = tagPathSlugFromFilters(filters);

	if (category && tagPathSlug) {
		return route(getRootPathPublicBuildingBlocksCategoryTag(category, tagPathSlug));
	}
	if (category) {
		return route(getRootPathPublicBuildingBlocksCategory(category));
	}
	if (tagPathSlug) {
		return route(getRootPathPublicBuildingBlocksTag(tagPathSlug));
	}
	return route(getRootPathPublicBuildingBlocks());
}

/** Build hub URLs: path encodes category/tag; query encodes sort/type/search only. */
export function buildExtensionsHubNavigationUrl(
	current: ExtensionsHubFilters,
	overrides: Partial<ExtensionsHubFilters>
): string {
	const next: ExtensionsHubFilters = { ...current, ...overrides };
	return `${resolveExtensionsHubPath(next)}${appendHubQueryParams(next)}`;
}
