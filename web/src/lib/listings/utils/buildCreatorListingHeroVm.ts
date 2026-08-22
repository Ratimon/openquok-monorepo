import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type CreatorListingHeroKind = 'building-block' | 'playbook';

export type CreatorListingHeroTitleSegmentStyle = 'plain' | 'sticker' | 'underline';

export type CreatorListingHeroTitleSegment = {
	text: string;
	style: CreatorListingHeroTitleSegmentStyle;
};

export type CreatorListingHeroVm = {
	eyebrow: string;
	titleSegments: CreatorListingHeroTitleSegment[];
	description: string;
	listingIcon: IconName;
	logoImageUrl: string | null;
	listingTitle: string;
	ctaText: string;
	ctaHref: string;
	docsCtaText?: string;
	docsCtaHref?: string;
	installHeading?: string;
	installCommand?: string | null;
};

const CTA_TEXT = 'Get Started For Free';
const CTA_HREF = '/pricing';
const OPENQUOK_BRAND = 'OpenQuok';

function buildingBlockIcon(extensionType: string | null | undefined): IconName {
	if (extensionType === 'mcp') return icons.Bot.name;
	if (extensionType === 'both') return icons.FileText.name;
	return icons.Terminal.name;
}

function playbookIcon(): IconName {
	return icons.LayoutTemplate.name;
}

/**
 * Title: Use/Run {listing} with OpenQuok then you approve.
 * Listing name = underline; OpenQuok + approve = white stickers.
 */
export function buildCreatorListingHeroTitleSegments(
	kind: CreatorListingHeroKind,
	listingTitle: string
): CreatorListingHeroTitleSegment[] {
	const title =
		listingTitle.trim() || (kind === 'playbook' ? 'this playbook' : 'this building block');
	const verb = kind === 'playbook' ? 'Run' : 'Use';
	return [
		{ text: `${verb} `, style: 'plain' },
		{ text: title, style: 'underline' },
		{ text: ' with ', style: 'plain' },
		{ text: OPENQUOK_BRAND, style: 'sticker' },
		{ text: ' then you ', style: 'plain' },
		{ text: 'approve', style: 'sticker' }
	];
}

function buildHeroDescription(kind: CreatorListingHeroKind): string {
	if (kind === 'playbook') {
		return `Install the building blocks, then draft and schedule in ${OPENQUOK_BRAND} — you approve before anything goes live.`;
	}
	return `Install this building block on your agent, then draft and schedule in ${OPENQUOK_BRAND} — you approve before anything goes live.`;
}

export function buildBuildingBlockCreatorListingHeroVm(params: {
	title: string;
	extensionType?: string | null;
	logoImageUrl?: string | null;
	installCommandSkills?: string | null;
}): CreatorListingHeroVm {
	const listingTitle = params.title.trim() || 'Building block';
	const installCommand = params.installCommandSkills?.trim() || null;

	return {
		eyebrow: OPENQUOK_BRAND,
		titleSegments: buildCreatorListingHeroTitleSegments('building-block', listingTitle),
		description: buildHeroDescription('building-block'),
		listingIcon: buildingBlockIcon(params.extensionType),
		logoImageUrl: params.logoImageUrl?.trim() || null,
		listingTitle,
		ctaText: CTA_TEXT,
		ctaHref: CTA_HREF,
		installHeading: 'Install this skill:',
		installCommand
	};
}

export function buildPlaybookCreatorListingHeroVm(params: {
	title: string;
	logoImageUrl?: string | null;
}): CreatorListingHeroVm {
	const listingTitle = params.title.trim() || 'Playbook';

	return {
		eyebrow: OPENQUOK_BRAND,
		titleSegments: buildCreatorListingHeroTitleSegments('playbook', listingTitle),
		description: buildHeroDescription('playbook'),
		listingIcon: playbookIcon(),
		logoImageUrl: params.logoImageUrl?.trim() || null,
		listingTitle,
		ctaText: CTA_TEXT,
		ctaHref: CTA_HREF
	};
}
