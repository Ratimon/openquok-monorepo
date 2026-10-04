import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';
import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';

export type PublishedOpportunityDofollowSummary = 'allDofollow' | 'allNofollow' | 'mixed' | 'none';

const SITE_HERO_TITLE_SUFFIX = 'Free backlink opportunities';

export function summarizePublishedOpportunityDofollow(
	opportunities: LinkDirectoryOpportunityDto[]
): PublishedOpportunityDofollowSummary {
	const published = opportunities.filter((opportunity) => opportunity.isAdminPublished);
	if (published.length === 0) {
		return 'none';
	}

	const allDofollow = published.every((opportunity) => opportunity.dofollow === 'dofollow');
	if (allDofollow) {
		return 'allDofollow';
	}

	const allNofollow = published.every((opportunity) => opportunity.dofollow === 'nofollow');
	if (allNofollow) {
		return 'allNofollow';
	}

	return 'mixed';
}

export function formatBuildBacklinksSiteMetaTitle(title: string): string {
	const siteTitle = title.trim();
	return `${siteTitle} Backlink Guide — Free Opportunities & Playbook`;
}

export function formatBuildBacklinksSiteHeroTitle(title: string): string {
	const siteTitle = title.trim();
	if (!siteTitle) {
		return SITE_HERO_TITLE_SUFFIX;
	}
	return `${siteTitle} · ${SITE_HERO_TITLE_SUFFIX}`;
}

function formatPublishedDofollowNote(summary: PublishedOpportunityDofollowSummary): string {
	switch (summary) {
		case 'allDofollow':
			return 'Published opportunities include dofollow paths where link equity may apply.';
		case 'mixed':
			return 'Each opportunity notes dofollow or nofollow link treatment.';
		case 'allNofollow':
			return 'Published opportunities use nofollow links — useful for traffic and brand, not PageRank pass-through.';
		case 'none':
			return '';
	}
}

function formatBuildBacklinksSiteMetaDescriptionFallback(siteTitle: string): string {
	return `Earn backlinks on ${siteTitle} with step-by-step playbooks, plus cost, effort, and approval notes.`;
}

export function formatBuildBacklinksSiteMetaDescription(site: LinkDirectorySiteDto): string {
	const siteTitle = site.title.trim();
	const dofollowSummary = summarizePublishedOpportunityDofollow(site.opportunities);

	let description =
		site.shortDescription?.trim() || formatBuildBacklinksSiteMetaDescriptionFallback(siteTitle);

	const dofollowNote = formatPublishedDofollowNote(dofollowSummary);
	if (dofollowNote) {
		description = `${description} ${dofollowNote}`;
	}

	if (site.domainRating != null) {
		description = `${description} DR ${site.domainRating}.`;
	}

	return description;
}

export function formatBuildBacklinksSiteSeoKeywords(site: LinkDirectorySiteDto): string[] {
	const siteTitle = site.title.trim();
	const siteSpecific = [
		siteTitle ? `${siteTitle} backlinks` : '',
		siteTitle ? `${siteTitle} link building` : '',
		'free backlink opportunities'
	];

	const seen = new Set<string>();
	const keywords: string[] = [];

	for (const keyword of [...PUBLIC_BUILD_BACKLINKS_HUB.seoKeywords, ...siteSpecific]) {
		const trimmed = typeof keyword === 'string' ? keyword.trim() : '';
		if (!trimmed) continue;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		keywords.push(trimmed);
	}

	return keywords;
}
