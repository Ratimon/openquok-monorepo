import { error } from '@sveltejs/kit';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { loadAlternativesHubPage } from '$lib/area-public/server/loadAlternativesHubPage.server';
import { getRootPathPublicAlternativesCategory } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import {
	isAlternativesPathCategorySlug,
	PUBLIC_ALTERNATIVES_PATH_CATEGORIES
} from '$lib/content/constants/hubs/alternativesPathCategories';
import { parseAlternativesHubFiltersFromUrl } from '$lib/content/constants/hubs/alternativesHubFilters';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug.trim().toLowerCase() : '';

	if (!categorySlug || !isAlternativesPathCategorySlug(categorySlug)) {
		throw error(404, 'Alternatives category not found');
	}

	const config = PUBLIC_ALTERNATIVES_PATH_CATEGORIES[categorySlug];
	const parsed = parseAlternativesHubFiltersFromUrl(event.url.searchParams);
	const filtersVm = {
		...parsed,
		category: config.hubFilterCategory
	};

	const baseHubVm = publicAlternativesPagePresenter.buildPathCategoryHubVm(categorySlug);

	const hubPage = await loadAlternativesHubPage(event, {
		customSlug: getRootPathPublicAlternativesCategory(categorySlug),
		filtersVm,
		baseHubVm,
		itemListName: config.metaTitle,
		breadcrumbVariant: 'category',
		categoryLabel: config.breadcrumbLabel,
		categorySlug
	});

	return {
		...hubPage,
		categorySlug,
		categoryBreadcrumbLabel: config.breadcrumbLabel
	};
}
