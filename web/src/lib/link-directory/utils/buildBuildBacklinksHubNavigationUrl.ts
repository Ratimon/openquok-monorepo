import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksCategory,
	getRootPathPublicBuildBacklinksTag
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import type {
	BuildBacklinksHubFilters,
	LinkDirectoryApprovalMode,
	LinkDirectoryCostTier,
	LinkDirectoryDofollow,
	LinkDirectoryEffort
} from '$lib/link-directory/link-directory.types';
import { DEFAULT_BUILD_BACKLINKS_SORT } from '$lib/link-directory/constants/buildBacklinksSortOptions';
import { route } from '$lib/utils/path';

const COST_TIERS: LinkDirectoryCostTier[] = ['free', 'freemium', 'paid'];
const BUILD_BACKLINKS_SORT_VALUES = new Set<string>([
	'dr_desc',
	'dr_asc',
	'visits_desc',
	'visits_asc',
	'title_asc',
	'title_desc'
]);
const DOFOLLOW_VALUES: LinkDirectoryDofollow[] = ['dofollow', 'nofollow', 'unknown'];
const EFFORT_VALUES: LinkDirectoryEffort[] = ['easy', 'medium', 'hard'];
const APPROVAL_VALUES: LinkDirectoryApprovalMode[] = ['instant', 'manual_review'];

function parseCsvEnum<T extends string>(raw: string | null, allowed: readonly T[]): T[] | undefined {
	if (!raw?.trim()) return undefined;
	const values = raw
		.split(',')
		.map((part) => part.trim())
		.filter((part): part is T => (allowed as readonly string[]).includes(part));
	return values.length > 0 ? values : undefined;
}

/** Parse sort / search / facet filters from the query string (category and tags use path segments). */
export function parseBuildBacklinksHubQueryFiltersFromUrl(
	searchParams: URLSearchParams
): Pick<
	BuildBacklinksHubFilters,
	| 'sort'
	| 'search'
	| 'costTiers'
	| 'dofollow'
	| 'effort'
	| 'approvalMode'
	| 'opportunityTypeSlugs'
> {
	const sortRaw = searchParams.get('sort');
	const sort =
		sortRaw && BUILD_BACKLINKS_SORT_VALUES.has(sortRaw)
			? (sortRaw as BuildBacklinksHubFilters['sort'])
			: DEFAULT_BUILD_BACKLINKS_SORT;
	const search = searchParams.get('search')?.trim();
	const opportunityTypeSlugs = parseCsvFreeform(searchParams.get('opportunityTypeSlugs'));

	return {
		sort,
		...(search ? { search } : {}),
		costTiers: parseCsvEnum(searchParams.get('cost'), COST_TIERS),
		dofollow: parseCsvEnum(searchParams.get('dofollow'), DOFOLLOW_VALUES),
		effort: parseCsvEnum(searchParams.get('effort'), EFFORT_VALUES),
		approvalMode: parseCsvEnum(searchParams.get('approval'), APPROVAL_VALUES),
		...(opportunityTypeSlugs?.length ? { opportunityTypeSlugs } : {})
	};
}

function parseCsvFreeform(raw: string | null): string[] | undefined {
	if (!raw?.trim()) return undefined;
	const values = raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	return values.length > 0 ? values : undefined;
}

export function mapBuildBacklinksSortToApi(sort: BuildBacklinksHubFilters['sort']): {
	sortByKey: string;
	sortByOrder: boolean;
} {
	switch (sort) {
		case 'dr_asc':
			return { sortByKey: 'domain_rating', sortByOrder: true };
		case 'visits_desc':
			return { sortByKey: 'monthly_visits', sortByOrder: false };
		case 'visits_asc':
			return { sortByKey: 'monthly_visits', sortByOrder: true };
		case 'title_asc':
			return { sortByKey: 'title', sortByOrder: true };
		case 'title_desc':
			return { sortByKey: 'title', sortByOrder: false };
		case 'dr_desc':
		default:
			return { sortByKey: 'domain_rating', sortByOrder: false };
	}
}

function appendHubQueryParams(filters: BuildBacklinksHubFilters): string {
	const params = new URLSearchParams();
	if (filters.sort !== DEFAULT_BUILD_BACKLINKS_SORT) params.set('sort', filters.sort);
	if (filters.search?.trim()) params.set('search', filters.search.trim());
	if (filters.costTiers?.length) params.set('cost', filters.costTiers.join(','));
	if (filters.dofollow?.length) params.set('dofollow', filters.dofollow.join(','));
	if (filters.effort?.length) params.set('effort', filters.effort.join(','));
	if (filters.approvalMode?.length) params.set('approval', filters.approvalMode.join(','));
	if (filters.opportunityTypeSlugs?.length) {
		params.set('opportunityTypeSlugs', filters.opportunityTypeSlugs.join(','));
	}
	const query = params.toString();
	return query ? `?${query}` : '';
}

export function resolveBuildBacklinksHubPath(filters: BuildBacklinksHubFilters): string {
	const category = filters.category?.trim();
	const tag = filters.tags?.length === 1 ? filters.tags[0]?.trim() : undefined;

	if (category) {
		return route(getRootPathPublicBuildBacklinksCategory(category));
	}
	if (tag) {
		return route(getRootPathPublicBuildBacklinksTag(tag));
	}
	return route(getRootPathPublicBuildBacklinks());
}

export function buildBuildBacklinksHubNavigationUrl(
	current: BuildBacklinksHubFilters,
	overrides: Partial<BuildBacklinksHubFilters>
): string {
	const next: BuildBacklinksHubFilters = { ...current, ...overrides };
	return `${resolveBuildBacklinksHubPath(next)}${appendHubQueryParams(next)}`;
}
