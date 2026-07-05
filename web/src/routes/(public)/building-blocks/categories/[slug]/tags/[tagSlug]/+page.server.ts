import {
	getRootPathPublicBuildingBlocksCategoryTag
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicExtensionsPagePresenter } from '$lib/area-public/index';
import { getListingPresenter, listingRepository } from '$lib/listings/index';
import { loadBuildingBlocksHubPage } from '$lib/listings/utils/loadBuildingBlocksHubPage.server';
import { resolveBuildingBlocksTagPathFilter } from '$lib/listings/utils/resolveBuildingBlocksTagPathFilter';
import { formatBuildingBlocksFilterHeroTitle } from '$lib/listings/utils/formatBuildingBlocksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const tagPathSlug = typeof event.params.tagSlug === 'string' ? event.params.tagSlug : '';

	const [hub, categoryDetails, tagsCatalog] = await Promise.all([
		publicExtensionsPagePresenter.loadExtensionsHubStateless({
			fetch: event.fetch,
			limit: 50
		}),
		listingRepository.getActiveCategories(event.fetch),
		getListingPresenter.loadAllTagsVm(event.fetch)
	]);

	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	});

	const detail = categoryDetails.find((category) => category.slug === categorySlug);
	const hubCategory = hub.categories.find((category) => category.slug === categorySlug);
	const categoryTitle = detail?.name ?? hubCategory?.name ?? categorySlug;

	const tagResolution = resolveBuildingBlocksTagPathFilter({
		pathSlug: tagPathSlug,
		tagsCatalog,
		tagFilterVm
	});

	const tagTitle = tagResolution.subjectLabel;
	const heroTitle = formatBuildingBlocksFilterHeroTitle(categoryTitle, tagTitle);
	const heroDescription =
		tagResolution.kind === 'tag'
			? `Browse ${tagTitle} building blocks in the ${categoryTitle} category.`
			: `Browse ${categoryTitle} building blocks in the ${tagTitle} tag group.`;

	const loadOverrides: Parameters<typeof loadBuildingBlocksHubPage>[1] = {
		fixedCategorySlug: categorySlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicBuildingBlocksCategoryTag(categorySlug, tagPathSlug)
	};

	if (tagResolution.kind === 'tag') {
		loadOverrides.fixedTagSlug = tagResolution.fixedTagSlug;
	} else if (tagResolution.kind === 'group') {
		loadOverrides.fixedTagGroupSlug = tagResolution.fixedTagGroupSlug;
	}

	return loadBuildingBlocksHubPage(event, loadOverrides);
}
