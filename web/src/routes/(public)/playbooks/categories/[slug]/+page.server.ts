import { getRootPathPublicPlaybooksCategory } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicStacksPagePresenter } from '$lib/area-public/index';
import { listingRepository } from '$lib/listings/index';
import { loadPlaybooksHubPage } from '$lib/listings/utils/loadPlaybooksHubPage.server';
import { formatPlaybooksFilterHeroTitle } from '$lib/listings/utils/formatPlaybooksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const [hub, categoryDetails] = await Promise.all([
		publicStacksPagePresenter.loadStacksHubStateless({
			fetch: event.fetch,
			limit: 50
		}),
		listingRepository.getActiveCategories(event.fetch)
	]);
	const detail = categoryDetails.find((category) => category.slug === categorySlug);
	const hubCategory = hub.categories.find((category) => category.slug === categorySlug);

	const categoryName = detail?.name ?? hubCategory?.name ?? categorySlug;
	const heroTitle = formatPlaybooksFilterHeroTitle(categoryName);
	const heroDescription =
		detail?.description?.trim() || `Browse agent playbooks in the ${categoryName} category.`;

	return loadPlaybooksHubPage(event, {
		fixedCategorySlug: categorySlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicPlaybooksCategory(categorySlug)
	});
}
