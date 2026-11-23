import {
	BUILD_BACKLINKS_VIRTUAL_TAGS,
	isBuildBacklinksEditorialTagSlug,
	type BuildBacklinksPublishedTagQuery
} from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import type {
	LinkDirectoryCategoryDto,
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';

export type BuildBacklinksCategoryOverviewItem = LinkDirectoryCategoryDto & { count: number };

export type BuildBacklinksTagOverviewItem = {
	slug: string;
	label: string;
	description: string | null;
	count: number;
	groupName: string;
};

export function buildBuildBacklinksCategoryOverview(
	categories: LinkDirectoryCategoryDto[],
	sites: LinkDirectorySiteDto[]
): BuildBacklinksCategoryOverviewItem[] {
	const countByCategoryId = new Map<string, number>();
	for (const site of sites) {
		const categoryId = site.categoryId ?? site.category?.id;
		if (!categoryId) continue;
		countByCategoryId.set(categoryId, (countByCategoryId.get(categoryId) ?? 0) + 1);
	}

	return categories.map((category) => ({
		...category,
		count: countByCategoryId.get(category.id) ?? 0
	}));
}

const VIRTUAL_TAG_GROUP_NAME = 'Opportunity filters';

function opportunityMatchesPublishedQuery(
	opportunity: LinkDirectoryOpportunityDto,
	query: BuildBacklinksPublishedTagQuery
): boolean {
	if (!opportunity.isAdminPublished) {
		return false;
	}
	if (query.costTiers?.length && !query.costTiers.includes(opportunity.costTier)) {
		return false;
	}
	if (query.dofollow?.length && !query.dofollow.includes(opportunity.dofollow)) {
		return false;
	}
	if (query.approvalMode?.length && !query.approvalMode.includes(opportunity.approvalMode)) {
		return false;
	}
	if (query.opportunityTypeSlugs?.length) {
		const typeSlug = opportunity.opportunityType?.slug;
		if (!typeSlug || !query.opportunityTypeSlugs.includes(typeSlug)) {
			return false;
		}
	}
	return true;
}

function siteMatchesPublishedTagQuery(
	site: LinkDirectorySiteDto,
	query: BuildBacklinksPublishedTagQuery
): boolean {
	if (query.tagSlugs?.length) {
		const siteTags = new Set(site.tagSlugs ?? []);
		if (!query.tagSlugs.some((slug) => siteTags.has(slug))) {
			return false;
		}
	}

	const hasOpportunityFilters = Boolean(
		query.costTiers?.length ||
			query.dofollow?.length ||
			query.approvalMode?.length ||
			query.opportunityTypeSlugs?.length
	);
	if (!hasOpportunityFilters) {
		return true;
	}

	const opportunities = site.opportunities ?? [];
	return opportunities.some((opportunity) => opportunityMatchesPublishedQuery(opportunity, query));
}

function countSitesMatchingPublishedQuery(
	sites: LinkDirectorySiteDto[],
	query: BuildBacklinksPublishedTagQuery
): number {
	return sites.filter((site) => siteMatchesPublishedTagQuery(site, query)).length;
}

export function buildBuildBacklinksTagOverview(
	tags: LinkDirectoryTagDto[],
	sites: LinkDirectorySiteDto[]
): BuildBacklinksTagOverviewItem[] {
	const editorialTags = tags.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug));

	const countBySlug = new Map<string, number>();
	for (const site of sites) {
		for (const slug of site.tagSlugs) {
			if (!isBuildBacklinksEditorialTagSlug(slug)) continue;
			countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
		}
	}

	const editorialOverview = editorialTags.map((tag) => ({
		slug: tag.slug,
		label: tag.name,
		description: tag.description,
		count: countBySlug.get(tag.slug) ?? 0,
		groupName: tag.groups[0]?.name ?? 'Editorial'
	}));

	const virtualOverview = BUILD_BACKLINKS_VIRTUAL_TAGS.map((virtualTag) => ({
		slug: virtualTag.slug,
		label: virtualTag.name,
		description: virtualTag.description,
		count: countSitesMatchingPublishedQuery(sites, virtualTag.toPublishedQuery()),
		groupName: VIRTUAL_TAG_GROUP_NAME
	}));

	return [...editorialOverview, ...virtualOverview];
}
