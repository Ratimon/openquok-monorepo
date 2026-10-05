import {
	PUBLIC_BUILDING_BLOCKS_HUB,
	PUBLIC_PLAYBOOKS_HUB
} from '$lib/listings/constants/publicListingsHubConfig';
import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';
import { resolveStackListingHeaderSummary } from '$lib/listings/utils/resolveStackListingHeaderSummary';

export type PublicCreatorListingKind = 'building-block' | 'playbook';

export type PublicCreatorListingSeoSource = {
	title: string;
	extensionType?: string | null;
	excerpt?: string | null;
	description?: string | null;
	content?: string | null;
};

const HUB_KEYWORDS_SLICE = 8;

const BUILDING_BLOCK_HERO_SUFFIX = 'Schedule social media posts';
const PLAYBOOK_HERO_SUFFIX = 'Social media scheduling playbook';

const SCHEDULE_APPROVE_SENTENCE =
	'Schedule and manage social media posts on OpenQuok — you approve before publish.';

function buildingBlockMetaTitleSuffix(extensionType: string | null | undefined): string {
	switch (extensionType) {
		case 'mcp':
			return 'MCP Server';
		case 'both':
			return 'MCP & Skill';
		case 'skills':
			return 'Skill';
		default:
			return 'Skill';
	}
}

export function formatPublicCreatorListingMetaTitleBase(
	title: string,
	kind: PublicCreatorListingKind,
	extensionType?: string | null
): string {
	const listingTitle = title.trim() || (kind === 'playbook' ? 'Playbook' : 'Building block');

	if (kind === 'playbook') {
		return `${listingTitle} — Social Media Scheduling Playbook`;
	}

	const typeLabel = buildingBlockMetaTitleSuffix(extensionType);
	return `${listingTitle} — Social Media Scheduling ${typeLabel}`;
}

export function formatPublicCreatorListingHeroTitle(
	title: string,
	kind: PublicCreatorListingKind
): string {
	const listingTitle = title.trim();
	const suffix =
		kind === 'playbook' ? PLAYBOOK_HERO_SUFFIX : BUILDING_BLOCK_HERO_SUFFIX;

	if (!listingTitle) {
		return suffix;
	}

	return `${listingTitle} · ${suffix}`;
}

function resolveCreatorListingSummary(
	source: PublicCreatorListingSeoSource,
	kind: PublicCreatorListingKind
): string | null {
	if (kind === 'playbook') {
		return resolveStackListingHeaderSummary(source);
	}
	return resolveListingHeaderSummary(source);
}

export function formatPublicCreatorListingMetaDescription(
	source: PublicCreatorListingSeoSource,
	kind: PublicCreatorListingKind
): string {
	const listingTitle = source.title.trim() || (kind === 'playbook' ? 'Playbook' : 'Building block');
	const summary = resolveCreatorListingSummary(source, kind);

	const lead =
		summary ??
		(kind === 'playbook'
			? `Playbook details for ${listingTitle}.`
			: `Building block details for ${listingTitle}.`);

	return `${lead} ${SCHEDULE_APPROVE_SENTENCE}`;
}

function mergeKeywords(...groups: readonly (readonly string[])[]): string[] {
	const seen = new Set<string>();
	const keywords: string[] = [];

	for (const group of groups) {
		for (const keyword of group) {
			const trimmed = typeof keyword === 'string' ? keyword.trim() : '';
			if (!trimmed) continue;
			const key = trimmed.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			keywords.push(trimmed);
		}
	}

	return keywords;
}

export function formatPublicCreatorListingSeoKeywords(
	source: PublicCreatorListingSeoSource,
	kind: PublicCreatorListingKind
): string[] {
	const listingTitle = source.title.trim();
	const hubKeywords =
		kind === 'playbook'
			? PUBLIC_PLAYBOOKS_HUB.seoKeywords
			: PUBLIC_BUILDING_BLOCKS_HUB.seoKeywords;

	const listingSpecific = listingTitle
		? kind === 'playbook'
			? [listingTitle, `${listingTitle} social media scheduling playbook`]
			: [listingTitle, `${listingTitle} social media scheduling`]
		: [];

	return mergeKeywords(hubKeywords.slice(0, HUB_KEYWORDS_SLICE), listingSpecific);
}
