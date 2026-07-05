import {
	getRootPathPublicBuildingBlocksCategory
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicBuildingBlocksPagePresenter } from '$lib/area-public/index';
import { listingRepository } from '$lib/listings/index';
import { loadBuildingBlocksHubPage } from '$lib/listings/utils/loadBuildingBlocksHubPage.server';
import { formatBuildingBlocksFilterHeroTitle } from '$lib/listings/utils/formatBuildingBlocksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const [hub, categoryDetails] = await Promise.all([
		publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({
			fetch: event.fetch,
			limit: 50
		}),
		listingRepository.getActiveCategories(event.fetch)
	]);
	const detail = categoryDetails.find((category) => category.slug === categorySlug);
	const hubCategory = hub.categories.find((category) => category.slug === categorySlug);

	const categoryName = detail?.name ?? hubCategory?.name ?? categorySlug;
	const heroTitle = formatBuildingBlocksFilterHeroTitle(categoryName);
	const heroDescription =
		detail?.description?.trim() ||
		`Browse skills and MCP building blocks in the ${categoryName} category.`;

	return loadBuildingBlocksHubPage(event, {
		fixedCategorySlug: categorySlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicBuildingBlocksCategory(categorySlug)
	});
}
