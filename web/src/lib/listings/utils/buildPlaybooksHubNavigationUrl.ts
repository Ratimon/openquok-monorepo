import {
	getRootPathPublicPlaybooks,
	getRootPathPublicPlaybooksCategory,
	getRootPathPublicPlaybooksCategoryTag,
	getRootPathPublicPlaybooksTag
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import type { ExtensionSort, StacksHubFilters } from '$lib/listings/listing.types';
import { route } from '$lib/utils/path';

/** Parse sort / search from the query string (category and tags use path segments). */
export function parsePlaybooksHubQueryFiltersFromUrl(
	searchParams: URLSearchParams
): Pick<StacksHubFilters, 'sort' | 'search'> {
	const sort = searchParams.get('sort');
	const search = searchParams.get('search')?.trim();

	const sortFilter: ExtensionSort =
		sort === 'oldest' || sort === 'popular' || sort === 'views' ? sort : 'newest';

	return {
		sort: sortFilter,
		...(search ? { search } : {})
	};
}

/** Non-SEO query params only (sort, search). Category/tag filters live in the path. */
function appendHubQueryParams(filters: StacksHubFilters): string {
	const params = new URLSearchParams();
	if (filters.sort !== 'newest') params.set('sort', filters.sort);
	if (filters.search?.trim()) params.set('search', filters.search.trim());
	const query = params.toString();
	return query ? `?${query}` : '';
}

function tagPathSlugFromFilters(filters: StacksHubFilters): string | undefined {
	const singleTag = filters.tags?.length === 1 ? filters.tags[0]?.trim() : undefined;
	const tagGroup = filters.tagGroup?.trim();
	return singleTag || tagGroup || undefined;
}

/** Canonical path for category / tag / combined filters (no query). */
export function resolvePlaybooksHubPath(filters: StacksHubFilters): string {
	const category = filters.category?.trim();
	const tagPathSlug = tagPathSlugFromFilters(filters);

	if (category && tagPathSlug) {
		return route(getRootPathPublicPlaybooksCategoryTag(category, tagPathSlug));
	}
	if (category) {
		return route(getRootPathPublicPlaybooksCategory(category));
	}
	if (tagPathSlug) {
		return route(getRootPathPublicPlaybooksTag(tagPathSlug));
	}
	return route(getRootPathPublicPlaybooks());
}

/** Build hub URLs: path encodes category/tag; query encodes sort/search only. */
export function buildPlaybooksHubNavigationUrl(
	current: StacksHubFilters,
	overrides: Partial<StacksHubFilters>
): string {
	const next: StacksHubFilters = { ...current, ...overrides };
	return `${resolvePlaybooksHubPath(next)}${appendHubQueryParams(next)}`;
}
