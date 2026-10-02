import { getRootPathPublicBuildBacklinksCategory } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import { loadBuildBacklinksHubPage } from '$lib/link-directory/server/loadBuildBacklinksHubPage.server';
import { formatBuildBacklinksFilterHeroTitle } from '$lib/link-directory/utils/formatBuildBacklinksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const categories = await linkDirectoryRepository.getActiveCategories(event.fetch);
	const detail = categories.find((category) => category.slug === categorySlug);

	const categoryName = detail?.name ?? categorySlug;
	const heroTitle = formatBuildBacklinksFilterHeroTitle(categoryName);
	const heroDescription =
		detail?.description?.trim() ||
		`Backlink opportunities on platforms in the ${categoryName} category.`;

	return loadBuildBacklinksHubPage(event, {
		fixedCategorySlug: categorySlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicBuildBacklinksCategory(categorySlug),
		categoryTermName: categoryName,
		categoryTermDescription: detail?.description?.trim() || undefined
	});
}
