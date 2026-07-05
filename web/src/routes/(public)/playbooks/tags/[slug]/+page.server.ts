import { getRootPathPublicPlaybooksTags } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { publicStacksPagePresenter } from '$lib/area-public/index';
import { getListingPresenter } from '$lib/listings/index';
import { loadPlaybooksHubPage } from '$lib/listings/utils/loadPlaybooksHubPage.server';
import { resolvePlaybooksTagPathFilter } from '$lib/listings/utils/resolvePlaybooksTagPathFilter';

export const ssr = true;

export async function load(event) {
	const pathSlug = typeof event.params.slug === 'string' ? event.params.slug : '';

	const hub = await publicStacksPagePresenter.loadStacksHubStateless({
		fetch: event.fetch,
		limit: 50
	});
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(event.fetch);
	const tagFilterVm = getListingPresenter.buildStacksTagFilterVm({
		tagsCatalog,
		stacks: hub.stacks
	});

	const resolution = resolvePlaybooksTagPathFilter({ pathSlug, tagsCatalog, tagFilterVm });

	if (resolution.kind === 'tag') {
		return loadPlaybooksHubPage(event, {
			fixedTagSlug: resolution.fixedTagSlug,
			heroTitle: resolution.heroTitle,
			heroDescription: resolution.heroDescription,
			customSlug: `${getRootPathPublicPlaybooksTags()}/${pathSlug}`
		});
	}

	if (resolution.kind === 'group') {
		return loadPlaybooksHubPage(event, {
			fixedTagGroupSlug: resolution.fixedTagGroupSlug,
			heroTitle: resolution.heroTitle,
			heroDescription: resolution.heroDescription,
			customSlug: `${getRootPathPublicPlaybooksTags()}/${pathSlug}`
		});
	}

	return loadPlaybooksHubPage(event, {
		heroTitle: resolution.heroTitle,
		heroDescription: resolution.heroDescription,
		customSlug: `${getRootPathPublicPlaybooksTags()}/${pathSlug}`
	});
}
