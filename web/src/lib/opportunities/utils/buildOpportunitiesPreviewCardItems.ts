import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type {
	ExtensionCardViewModel,
	StackCardViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';
import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
import { route } from '$lib/utils/path';

function listingDescription(excerpt: string | null, description: string | null): string {
	const text = excerpt?.trim() || description?.trim() || '';
	return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function buildingBlockIcon(extensionType: string | null, isOfficial: boolean): IconName {
	if (isOfficial) return icons.OpenQuok.name;
	if (extensionType === 'mcp') return icons.Bot.name;
	if (extensionType === 'both') return icons.FileText.name;
	return icons.Terminal.name;
}

export function playbookToPreviewCardItem(playbook: StackCardViewModel): FeatureSimpleCardItem {
	return {
		id: playbook.id,
		title: playbook.title,
		description: listingDescription(playbook.excerpt, playbook.description),
		icon: playbook.isOfficial ? icons.OpenQuok.name : icons.LayoutTemplate.name
	};
}

export function backlinkSiteToPreviewCardItem(
	site: LinkDirectorySiteDto
): FeatureSimpleCardItem & { href: string } {
	return {
		id: site.id,
		title: site.title,
		description: listingDescription(site.shortDescription, site.longDescription),
		icon: icons.Link.name,
		href: route(getRootPathPublicBuildBacklinksSite(site.slug))
	};
}

export function backlinkOpportunityToPreviewCardItem(
	siteSlug: string,
	opportunity: LinkDirectoryOpportunityDto
): FeatureSimpleCardItem & { href: string } {
	const sitePath = route(getRootPathPublicBuildBacklinksSite(siteSlug));
	return {
		id: `backlink-opportunity-${opportunity.id}`,
		title: opportunity.title,
		description: listingDescription(null, opportunity.description),
		icon: icons.Link.name,
		href: `${sitePath}#howto-${opportunity.slug}`
	};
}

/** Default HowTo opportunity cards on agent channel landings (e.g. Facebook site guide). */
export const DEFAULT_FEATURED_BACKLINK_OPPORTUNITIES_PREVIEW = 2;

export function buildBacklinksPreviewCardItems(params: {
	featuredSite: LinkDirectorySiteDto | null;
	taggedSites: LinkDirectorySiteDto[];
	limit: number;
	/** When > 0 and `featuredSite` is set, show only HowTo opportunity cards (no site card). */
	featuredOpportunityLimit: number;
}): Array<FeatureSimpleCardItem & { href: string }> {
	const { featuredSite, taggedSites, limit, featuredOpportunityLimit } = params;

	if (featuredSite && featuredOpportunityLimit > 0) {
		return [...(featuredSite.opportunities ?? [])]
			.filter((opportunity) => opportunity.isAdminPublished)
			.sort((a, b) => a.sortOrder - b.sortOrder)
			.slice(0, featuredOpportunityLimit)
			.map((opportunity) => backlinkOpportunityToPreviewCardItem(featuredSite.slug, opportunity))
			.slice(0, limit);
	}

	const items: Array<FeatureSimpleCardItem & { href: string }> = [];

	if (featuredSite) {
		items.push(backlinkSiteToPreviewCardItem(featuredSite));
	}

	const otherSites = featuredSite
		? taggedSites.filter((site) => site.id !== featuredSite.id)
		: taggedSites;

	for (const site of otherSites) {
		if (items.length >= limit) break;
		items.push(backlinkSiteToPreviewCardItem(site));
	}

	return items.slice(0, limit);
}

/** Pin the channel-matching site guide before tag-filtered results (deduped). */
export function mergeFeaturedBacklinkSitesForPreview(
	featured: LinkDirectorySiteDto | null,
	fromTagFilter: LinkDirectorySiteDto[],
	limit: number
): LinkDirectorySiteDto[] {
	const rest = featured
		? fromTagFilter.filter((site) => site.id !== featured.id)
		: fromTagFilter;
	if (!featured) {
		return rest.slice(0, limit);
	}
	return [featured, ...rest.slice(0, Math.max(0, limit - 1))];
}

export function buildingBlockToPreviewCardItem(
	buildingBlock: ExtensionCardViewModel
): FeatureSimpleCardItem {
	return {
		id: buildingBlock.id,
		title: buildingBlock.title,
		description: listingDescription(buildingBlock.excerpt, buildingBlock.description),
		icon: buildingBlockIcon(buildingBlock.extensionType, buildingBlock.isOfficial)
	};
}

export function buildSeeAllPreviewCardItem(params: {
	id: string;
	href: string;
	description: string;
}): FeatureSimpleCardItem & { href: string } {
	return {
		id: params.id,
		title: 'See All',
		description: params.description,
		icon: icons.Grid3x3.name,
		href: params.href
	};
}

export function buildSkillBuilderPreviewCardItem(params: {
	id: string;
	href: string;
	description: string;
}): FeatureSimpleCardItem & { href: string } {
	return {
		id: params.id,
		title: 'Skill Builder',
		description: params.description,
		icon: icons.LayoutTemplate.name,
		href: params.href
	};
}
