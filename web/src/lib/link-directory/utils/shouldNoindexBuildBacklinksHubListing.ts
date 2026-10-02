import { DEFAULT_BUILD_BACKLINKS_SORT } from '$lib/link-directory/constants/buildBacklinksSortOptions';
import { parseHubListPagination } from '$lib/listings/utils/hubListPagination';

const FACET_QUERY_KEYS = ['cost', 'dofollow', 'effort', 'approval', 'opportunityTypeSlugs'] as const;

/**
 * Hub listing URLs with query-driven views (pagination, search, facets, sort, page size)
 * should not be indexed; path-only hub, category, and tag pages stay indexable.
 */
export function shouldNoindexBuildBacklinksHubListing(url: URL): boolean {
	const { page } = parseHubListPagination(url.searchParams);
	if (page > 1) {
		return true;
	}

	const search = url.searchParams.get('search')?.trim();
	if (search) {
		return true;
	}

	if (url.searchParams.has('ipp')) {
		return true;
	}

	const sortRaw = url.searchParams.get('sort');
	if (sortRaw !== null && sortRaw !== DEFAULT_BUILD_BACKLINKS_SORT) {
		return true;
	}

	for (const key of FACET_QUERY_KEYS) {
		if (url.searchParams.has(key)) {
			return true;
		}
	}

	return false;
}
