import {
	getRootPathPublicPlaybooksCategoryTag
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicPlaybooksPagePresenter } from '$lib/area-public/index';
import { getListingPresenter, listingRepository } from '$lib/listings/index';
import { loadPlaybooksHubPage } from '$lib/listings/server/loadPlaybooksHubPage.server';
import { resolvePlaybooksTagPathFilter } from '$lib/listings/utils/resolvePlaybooksTagPathFilter';
import { formatPlaybooksFilterHeroTitle } from '$lib/listings/utils/formatPlaybooksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const categorySlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const tagPathSlug = typeof event.params.tagSlug === 'string' ? event.params.tagSlug : '';

	const [hub, categoryDetails, tagsCatalog] = await Promise.all([
		publicPlaybooksPagePresenter.loadPlaybooksHubStateless({
			fetch: event.fetch,
			limit: 50
		}),
		listingRepository.getActiveCategories(event.fetch),
		getListingPresenter.loadAllTagsVm(event.fetch)
	]);

	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});

	const detail = categoryDetails.find((category) => category.slug === categorySlug);
	const hubCategory = hub.categories.find((category) => category.slug === categorySlug);
	const categoryTitle = detail?.name ?? hubCategory?.name ?? categorySlug;

	const tagResolution = resolvePlaybooksTagPathFilter({
		pathSlug: tagPathSlug,
		tagsCatalog,
		tagFilterVm
	});

	const tagTitle = tagResolution.subjectLabel;
	const heroTitle = formatPlaybooksFilterHeroTitle(categoryTitle, tagTitle);
	const heroDescription =
		tagResolution.kind === 'tag'
			? `Browse ${tagTitle} playbooks in the ${categoryTitle} category.`
			: `Browse ${categoryTitle} playbooks in the ${tagTitle} tag group.`;

	const loadOverrides: Parameters<typeof loadPlaybooksHubPage>[1] = {
		fixedCategorySlug: categorySlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicPlaybooksCategoryTag(categorySlug, tagPathSlug)
	};

	if (tagResolution.kind === 'tag') {
		loadOverrides.fixedTagSlug = tagResolution.fixedTagSlug;
	} else if (tagResolution.kind === 'group') {
		loadOverrides.fixedTagGroupSlug = tagResolution.fixedTagGroupSlug;
	}

	return loadPlaybooksHubPage(event, loadOverrides);
}
