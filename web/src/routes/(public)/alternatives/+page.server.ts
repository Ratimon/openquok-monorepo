import { redirect } from '@sveltejs/kit';

import { publicAlternativesPagePresenter } from '$lib/area-public';
import { loadAlternativesHubPage } from '$lib/area-public/server/loadAlternativesHubPage.server';
import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { PUBLIC_ALTERNATIVES_HUB } from '$lib/content/constants/hubs/alternatives';
import {
	buildAlternativesCategoryHubUrl,
	parseAlternativesHubFiltersFromUrl
} from '$lib/content/constants/hubs/alternativesHubFilters';
import { alternativesPathCategorySlugForHubCategory } from '$lib/content/constants/hubs/alternativesPathCategories';

export const ssr = true;

export async function load(event) {
	const filtersVm = parseAlternativesHubFiltersFromUrl(event.url.searchParams);

	if (filtersVm.category === 'social' || filtersVm.category === 'directory') {
		const slug = alternativesPathCategorySlugForHubCategory(filtersVm.category);
		throw redirect(308, buildAlternativesCategoryHubUrl(slug, filtersVm, {}));
	}

	const baseHubVm = publicAlternativesPagePresenter.buildHubVm();

	return loadAlternativesHubPage(event, {
		customSlug: getRootPathPublicAlternatives(),
		filtersVm,
		baseHubVm,
		itemListName: PUBLIC_ALTERNATIVES_HUB.metaTitle,
		breadcrumbVariant: 'hub'
	});
}
