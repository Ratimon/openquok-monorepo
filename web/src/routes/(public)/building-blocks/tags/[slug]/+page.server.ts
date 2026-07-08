import { getRootPathPublicBuildingBlocksTags } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { publicBuildingBlocksPagePresenter } from '$lib/area-public/index';
import { getListingPresenter } from '$lib/listings/index';
import { loadBuildingBlocksHubPage } from '$lib/listings/server/loadBuildingBlocksHubPage.server';
import { resolveBuildingBlocksTagPathFilter } from '$lib/listings/utils/resolveBuildingBlocksTagPathFilter';

export const ssr = true;

export async function load(event) {
	const pathSlug = typeof event.params.slug === 'string' ? event.params.slug : '';

	const hub = await publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({
		fetch: event.fetch,
		limit: 50
	});
	const tagsCatalog = await getListingPresenter.loadAllTagsVm(event.fetch);
	const tagFilterVm = getListingPresenter.buildExtensionsTagFilterVm({
		tagsCatalog,
		extensions: hub.extensions
	});

	const resolution = resolveBuildingBlocksTagPathFilter({ pathSlug, tagsCatalog, tagFilterVm });

	if (resolution.kind === 'tag') {
		return loadBuildingBlocksHubPage(event, {
			fixedTagSlug: resolution.fixedTagSlug,
			heroTitle: resolution.heroTitle,
			heroDescription: resolution.heroDescription,
			customSlug: `${getRootPathPublicBuildingBlocksTags()}/${pathSlug}`,
			tagTermName: resolution.subjectLabel,
			tagTermDescription: resolution.heroDescription
		});
	}

	if (resolution.kind === 'group') {
		return loadBuildingBlocksHubPage(event, {
			fixedTagGroupSlug: resolution.fixedTagGroupSlug,
			heroTitle: resolution.heroTitle,
			heroDescription: resolution.heroDescription,
			customSlug: `${getRootPathPublicBuildingBlocksTags()}/${pathSlug}`,
			tagTermName: resolution.subjectLabel,
			tagTermDescription: resolution.heroDescription
		});
	}

	return loadBuildingBlocksHubPage(event, {
		heroTitle: resolution.heroTitle,
		heroDescription: resolution.heroDescription,
		customSlug: `${getRootPathPublicBuildingBlocksTags()}/${pathSlug}`
	});
}
