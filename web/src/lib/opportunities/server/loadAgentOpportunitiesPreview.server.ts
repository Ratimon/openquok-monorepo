import {
	getRootPathPublicBuildingBlocks,
	getRootPathPublicBuildingBlocksTag
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import {
	getRootPathPublicPlaybooks,
	getRootPathPublicPlaybooksTag
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksTag
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import {
	getRootPathPublicSkillBuilder,
	getRootPathPublicSkillBuilderChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import { getListingPresenter } from '$lib/listings/index';
import {
	DEFAULT_OPPORTUNITIES_PREVIEW_ITEMS_PER_BLOCK,
	type PublicAgentOpportunitiesPreviewSection
} from '$lib/content/constants/agents';
import {
	buildBacklinksPreviewCardItems,
	buildSeeAllPreviewCardItem,
	buildSkillBuilderPreviewCardItem,
	buildingBlockToPreviewCardItem,
	DEFAULT_FEATURED_BACKLINK_OPPORTUNITIES_PREVIEW,
	playbookToPreviewCardItem
} from '$lib/opportunities/utils/buildOpportunitiesPreviewCardItems';
import { route } from '$lib/utils/path';

import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';

export type PublicOpportunitiesPreviewGridBlockVm = {
	gridLabel: string;
	items: FeatureSimpleCardItem[];
	skillBuilder?: FeatureSimpleCardItem & { href: string };
	seeAll: FeatureSimpleCardItem & { href: string };
};

export type PublicOpportunitiesPreviewVm = {
	headingId: string;
	subtitle: string;
	title: string;
	description: string;
	backlinksBlock: PublicOpportunitiesPreviewGridBlockVm;
	playbooksBlock: PublicOpportunitiesPreviewGridBlockVm;
	buildingBlocksBlock: PublicOpportunitiesPreviewGridBlockVm;
};

export async function loadAgentOpportunitiesPreviewStateless(params: {
	fetch?: typeof globalThis.fetch;
	limit?: number;
	previewSection: PublicAgentOpportunitiesPreviewSection;
	/** When set, only listings tagged with this slug appear in both grids. */
	listingTagSlug?: string | null;
	/** When set, playbooks grid links to `/tools/skill-builder/{slug}`; otherwise `/tools/skill-builder`. */
	skillBuilderChannelSlug?: string | null;
	/**
	 * When set (e.g. agent channel slug), load the published site and show its HowTo opportunity cards
	 * (not the site card) — even when directory tags differ from listing tags.
	 */
	featuredBacklinkSiteSlug?: string | null;
	/** Published HowTo opportunities from the featured site (after the site card). Default 2 when featured slug is set. */
	featuredBacklinkOpportunityLimit?: number;
}): Promise<PublicOpportunitiesPreviewVm> {
	const limit =
		params.limit ??
		params.previewSection.itemsPerBlockLimit ??
		DEFAULT_OPPORTUNITIES_PREVIEW_ITEMS_PER_BLOCK;
	const tagSlug = params.listingTagSlug?.trim() || null;
	const tagSlugs = tagSlug ? [tagSlug] : null;

	const featuredBacklinkSiteSlug = params.featuredBacklinkSiteSlug?.trim() || null;

	const [playbooksResult, buildingBlocksResult, backlinksResult, featuredBacklinkSite] =
		await Promise.all([
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
			}),
			linkDirectoryRepository.getPublishedSites({
				fetch: params.fetch,
				limit,
				skip: 0,
				tagSlugs
			}),
			featuredBacklinkSiteSlug
				? linkDirectoryRepository.getPublishedSiteBySlug(featuredBacklinkSiteSlug, params.fetch)
				: Promise.resolve(null)
		]);

	const featuredOpportunityLimit = featuredBacklinkSiteSlug
		? (params.featuredBacklinkOpportunityLimit ?? DEFAULT_FEATURED_BACKLINK_OPPORTUNITIES_PREVIEW)
		: 0;

	const backlinkPreviewItems = buildBacklinksPreviewCardItems({
		featuredSite: featuredBacklinkSite,
		taggedSites: backlinksResult.sites,
		limit,
		featuredOpportunityLimit
	});

	const playbooksPath = tagSlug
		? route(getRootPathPublicPlaybooksTag(tagSlug))
		: route(getRootPathPublicPlaybooks());
	const buildingBlocksPath = tagSlug
		? route(getRootPathPublicBuildingBlocksTag(tagSlug))
		: route(getRootPathPublicBuildingBlocks());
	const backlinksPath = tagSlug
		? route(getRootPathPublicBuildBacklinksTag(tagSlug))
		: route(getRootPathPublicBuildBacklinks());
	const skillBuilderChannelSlug = params.skillBuilderChannelSlug?.trim() || null;
	const skillBuilderPath = skillBuilderChannelSlug
		? route(getRootPathPublicSkillBuilderChannel(skillBuilderChannelSlug))
		: route(getRootPathPublicSkillBuilder());
	const previewCopy = params.previewSection;

	return {
		headingId: previewCopy.headingId,
		subtitle: previewCopy.subtitle,
		title: previewCopy.title,
		description: previewCopy.description,
		backlinksBlock: {
			gridLabel: previewCopy.backlinksGridLabel,
			items: backlinkPreviewItems,
			seeAll: buildSeeAllPreviewCardItem({
				id: 'see-all-backlinks',
				href: backlinksPath,
				description: previewCopy.backlinksSeeAllDescription
			})
		},
		playbooksBlock: {
			gridLabel: previewCopy.playbooksGridLabel,
			items: playbooksResult.stacks.slice(0, limit).map(playbookToPreviewCardItem),
			skillBuilder: buildSkillBuilderPreviewCardItem({
				id: 'skill-builder-playbooks',
				href: skillBuilderPath,
				description: previewCopy.playbooksSkillBuilderDescription
			}),
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
