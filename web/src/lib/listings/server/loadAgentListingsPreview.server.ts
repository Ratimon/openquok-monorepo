import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	publicBuildingBlocksPagePresenter,
	publicPlaybooksPagePresenter
} from '$lib/area-public/index';
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
}): Promise<PublicListingsPreviewVm> {
	const limit =
		params.limit ?? params.previewSection.itemsPerBlockLimit ?? DEFAULT_LISTINGS_PREVIEW_ITEMS_PER_BLOCK;

	const [playbooksHub, buildingBlocksHub] = await Promise.all([
		publicPlaybooksPagePresenter.loadPlaybooksHubStateless({ fetch: params.fetch, limit }),
		publicBuildingBlocksPagePresenter.loadBuildingBlocksHubStateless({ fetch: params.fetch, limit })
	]);

	const playbooksPath = route(getRootPathPublicPlaybooks());
	const buildingBlocksPath = route(getRootPathPublicBuildingBlocks());
	const previewCopy = params.previewSection;

	return {
		headingId: previewCopy.headingId,
		subtitle: previewCopy.subtitle,
		title: previewCopy.title,
		description: previewCopy.description,
		playbooksBlock: {
			gridLabel: previewCopy.playbooksGridLabel,
			items: playbooksHub.stacks.slice(0, limit).map(playbookToPreviewCardItem),
			seeAll: buildSeeAllPreviewCardItem({
				id: 'see-all-playbooks',
				href: playbooksPath,
				description: previewCopy.playbooksSeeAllDescription
			})
		},
		buildingBlocksBlock: {
			gridLabel: previewCopy.buildingBlocksGridLabel,
			items: buildingBlocksHub.extensions.slice(0, limit).map(buildingBlockToPreviewCardItem),
			seeAll: buildSeeAllPreviewCardItem({
				id: 'see-all-building-blocks',
				href: buildingBlocksPath,
				description: previewCopy.buildingBlocksSeeAllDescription
			})
		}
	};
}
