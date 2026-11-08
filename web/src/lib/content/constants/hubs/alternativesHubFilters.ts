import {
	getRootPathPublicAlternatives,
	getRootPathPublicAlternativesCategory,
	getRootPathPublicAlternativesTarget
} from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	alternativesPathCategorySlugForHubCategory,
	type AlternativesPathCategorySlug
} from '$lib/content/constants/hubs/alternativesPathCategories';
import type { CompareProductSlug } from '$lib/content/constants/competitors/types';
import { route } from '$lib/utils/path';

export type AlternativesHubCategory = 'all' | 'social' | 'directory';

export type AlternativesHubSort = 'price_asc' | 'platforms_desc' | 'name_asc';

export type AlternativesHubFilters = {
	category: AlternativesHubCategory;
	sort: AlternativesHubSort;
	search?: string;
};

export type AlternativesHubCategoryOption = {
	id: AlternativesHubCategory;
	label: string;
};

export type AlternativesHubSortOption = {
	id: AlternativesHubSort;
	label: string;
};

export const DEFAULT_ALTERNATIVES_HUB_CATEGORY: AlternativesHubCategory = 'all';

export const DEFAULT_ALTERNATIVES_HUB_SORT: AlternativesHubSort = 'name_asc';

export const ALTERNATIVES_HUB_CATEGORY_OPTIONS: readonly AlternativesHubCategoryOption[] = [
	{ id: 'all', label: 'All categories' },
	{ id: 'social', label: 'Social' },
	{ id: 'directory', label: 'Directory' }
];

export const ALTERNATIVES_HUB_SORT_OPTIONS: readonly AlternativesHubSortOption[] = [
	{ id: 'price_asc', label: 'Price: low to high' },
	{ id: 'platforms_desc', label: 'Most platforms' },
	{ id: 'name_asc', label: 'Name A–Z' }
];

const CATEGORY_VALUES = new Set<string>(['all', 'social', 'directory']);
const SORT_VALUES = new Set<string>(['price_asc', 'platforms_desc', 'name_asc']);

export function parseAlternativesHubFiltersFromUrl(
	searchParams: URLSearchParams
): AlternativesHubFilters {
	const categoryRaw = searchParams.get('category');
	const category =
		categoryRaw && CATEGORY_VALUES.has(categoryRaw)
			? (categoryRaw as AlternativesHubCategory)
			: DEFAULT_ALTERNATIVES_HUB_CATEGORY;

	const sortRaw = searchParams.get('sort');
	const sort =
		sortRaw && SORT_VALUES.has(sortRaw)
			? (sortRaw as AlternativesHubSort)
			: DEFAULT_ALTERNATIVES_HUB_SORT;

	const search = searchParams.get('search')?.trim();

	return {
		category,
		sort,
		...(search ? { search } : {})
	};
}

function appendAlternativesHubQueryParams(filters: AlternativesHubFilters): string {
	const params = new URLSearchParams();
	if (filters.sort !== DEFAULT_ALTERNATIVES_HUB_SORT) {
		params.set('sort', filters.sort);
	}
	if (filters.search?.trim()) {
		params.set('search', filters.search.trim());
	}
	const query = params.toString();
	return query ? `?${query}` : '';
}

export function buildAlternativesHubUrl(
	current: AlternativesHubFilters,
	overrides: Partial<AlternativesHubFilters>
): string {
	const next: AlternativesHubFilters = { ...current, ...overrides };
	return `${route(getRootPathPublicAlternatives())}${appendAlternativesHubQueryParams(next)}`;
}

/** Main hub sort/search; social/directory selections route to `/alternatives/categories/{slug}`. */
export function buildAlternativesHubNavigationUrl(
	current: AlternativesHubFilters,
	overrides: Partial<AlternativesHubFilters>
): string {
	const next: AlternativesHubFilters = { ...current, ...overrides };

	if (next.category === 'social' || next.category === 'directory') {
		const slug = alternativesPathCategorySlugForHubCategory(next.category);
		return buildAlternativesCategoryHubUrl(slug, next, {});
	}

	return buildAlternativesHubUrl(
		{ ...next, category: DEFAULT_ALTERNATIVES_HUB_CATEGORY },
		{}
	);
}

/** Category hub URLs omit `category` query — category comes from the path. */
function appendAlternativesCategoryHubQueryParams(
	filters: AlternativesHubFilters
): string {
	const params = new URLSearchParams();
	if (filters.sort !== DEFAULT_ALTERNATIVES_HUB_SORT) {
		params.set('sort', filters.sort);
	}
	if (filters.search?.trim()) {
		params.set('search', filters.search.trim());
	}
	const query = params.toString();
	return query ? `?${query}` : '';
}

export function buildAlternativesCategoryHubUrl(
	categorySlug: AlternativesPathCategorySlug,
	current: AlternativesHubFilters,
	overrides: Partial<AlternativesHubFilters>
): string {
	const next: AlternativesHubFilters = { ...current, ...overrides };
	return `${route(getRootPathPublicAlternativesCategory(categorySlug))}${appendAlternativesCategoryHubQueryParams(next)}`;
}

export type AlternativesDetailFilters = {
	sort: AlternativesHubSort;
};

export function parseAlternativesDetailFiltersFromUrl(
	searchParams: URLSearchParams
): AlternativesDetailFilters {
	const sortRaw = searchParams.get('sort');
	const sort =
		sortRaw && SORT_VALUES.has(sortRaw)
			? (sortRaw as AlternativesHubSort)
			: DEFAULT_ALTERNATIVES_HUB_SORT;

	return { sort };
}

export function buildAlternativesDetailUrl(
	targetSlug: CompareProductSlug,
	current: AlternativesDetailFilters,
	overrides: Partial<AlternativesDetailFilters>
): string {
	const next: AlternativesDetailFilters = { ...current, ...overrides };
	const base = route(getRootPathPublicAlternativesTarget(targetSlug));
	if (next.sort === DEFAULT_ALTERNATIVES_HUB_SORT) {
		return base;
	}
	return `${base}?sort=${next.sort}`;
}
