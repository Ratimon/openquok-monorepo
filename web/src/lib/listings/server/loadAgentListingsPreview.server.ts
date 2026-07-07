import {
	getRootPathPublicBuildingBlocks,
	getRootPathPublicBuildingBlocksTag
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import {
	getRootPathPublicPlaybooks,
	getRootPathPublicPlaybooksTag
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { getListingPresenter } from '$lib/listings/index';
import {
	DEFAULT_LISTINGS_PREVIEW_ITEMS_PER_BLOCK,
	type PublicAgentListingsPreviewSection
} from '$lib/content/constants/publicAgentConfig';
import {
	buildSeeAllPreviewCardItem,
	buildingBlockToPreviewCardItem,
	playbookToPreviewCardItem
} from '$lib/listings/utils/buildListingsPreviewCardItems';
import { route } from '$lib/utils/path';

import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';

export type PublicListingsPreviewGridBlockVm = {
	gridLabel: string;
	items: FeatureSimpleCardItem[];
	seeAll: FeatureSimpleCardItem & { href: string };
};

export type PublicListingsPreviewVm = {
	headingId: string;
	subtitle: string;
	title: string;
	description: string;
	playbooksBlock: PublicListingsPreviewGridBlockVm;
	buildingBlocksBlock: PublicListingsPreviewGridBlockVm;
};

export async function loadAgentListingsPreviewStateless(params: {
	fetch?: typeof globalThis.fetch;
	limit?: number;
	previewSection: PublicAgentListingsPreviewSection;
	/** When set, only listings tagged with this slug appear in both grids. */
	listingTagSlug?: string | null;
}): Promise<PublicListingsPreviewVm> {
	const limit =
		params.limit ?? params.previewSection.itemsPerBlockLimit ?? DEFAULT_LISTINGS_PREVIEW_ITEMS_PER_BLOCK;
	const tagSlug = params.listingTagSlug?.trim() || null;
	const tagSlugs = tagSlug ? [tagSlug] : null;

	const [playbooksResult, buildingBlocksResult] = await Promise.all([
		getListingPresenter.loadPublishedStacksVm({
			fetch: params.fetch,
			limit,
			tagSlugs
		}),
		getListingPresenter.loadPublishedExtensionsVm({
			fetch: params.fetch,
			limit,
			skip: 0,
			tagSlugs
		})
	]);

	const playbooksPath = tagSlug
		? route(getRootPathPublicPlaybooksTag(tagSlug))
		: route(getRootPathPublicPlaybooks());
	const buildingBlocksPath = tagSlug
		? route(getRootPathPublicBuildingBlocksTag(tagSlug))
		: route(getRootPathPublicBuildingBlocks());
	const previewCopy = params.previewSection;

	return {
		headingId: previewCopy.headingId,
		subtitle: previewCopy.subtitle,
		title: previewCopy.title,
		description: previewCopy.description,
		playbooksBlock: {
			gridLabel: previewCopy.playbooksGridLabel,
			items: playbooksResult.stacks.slice(0, limit).map(playbookToPreviewCardItem),
			seeAll: buildSeeAllPreviewCardItem({
				id: 'see-all-playbooks',
				href: playbooksPath,
				description: previewCopy.playbooksSeeAllDescription
			})
		},
		buildingBlocksBlock: {
			gridLabel: previewCopy.buildingBlocksGridLabel,
			items: buildingBlocksResult.listings.slice(0, limit).map(buildingBlockToPreviewCardItem),
			seeAll: buildSeeAllPreviewCardItem({
				id: 'see-all-building-blocks',
				href: buildingBlocksPath,
				description: previewCopy.buildingBlocksSeeAllDescription
			})
		}
	};
}
