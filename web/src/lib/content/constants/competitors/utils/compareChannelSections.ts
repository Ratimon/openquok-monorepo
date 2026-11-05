import type { PublicAgentComparisonSection } from '$lib/content/constants/agents/types';
import type { CompareProduct } from '$lib/content/constants/competitors/types';
import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import {
	COMPARE_HUB_BASE_SLUG,
	COMPARE_CHANNELS_SECTION,
	buildCompareChannelPoints
} from '$lib/content/constants/competitors/shared';

export const COMPARE_SOCIAL_CHANNELS_SECTION = {
	subtitle: 'Supported social channels',
	title: 'Supported social channels',
	description:
		'See which social networks each product supports for scheduling. An hourglass means the channel is on our roadmap.'
} as const;

export const COMPARE_DIRECTORY_COVERAGE_SECTION = {
	subtitle: 'Supported directory channels',
	title: 'Supported directory channels',
	description:
		'See wired directory launch on OpenQuok and how the other product handles directory listings.'
} as const;

/** Directory destinations OpenQuok ships extension autofill for today (compare UI). */
export const COMPARE_OPENQUOK_DIRECTORY_LAUNCH_PLATFORMS: readonly {
	label: string;
	icon: IconName;
}[] = [
	{ label: 'PeerPush', icon: icons.PeerPush.name },
	{ label: 'Uneed', icon: icons.Uneed.name }
];

export type CompareDirectoryCoverageViewModel = {
	subtitle: string;
	title: string;
	description: string;
	withTitle: string;
	withoutTitle: string;
	launchPlatforms: readonly { label: string; icon: IconName }[];
	competitorSummary: string;
	openQuokFootnote: string;
};

function buildCompetitorDirectorySummary(competitor: CompareProduct): string {
	if (competitor.directoryCoverageSummary) {
		return competitor.directoryCoverageSummary;
	}

	return `${competitor.name} is a social scheduler. It does not include wired directory launch or done-for-you directory submissions.`;
}

export function buildCompareSocialChannelsSection(
	left: CompareProduct,
	right: CompareProduct
): PublicAgentComparisonSection | null {
	const bothEmpty = left.channels.length === 0 && right.channels.length === 0;
	if (bothEmpty) return null;

	return {
		...COMPARE_SOCIAL_CHANNELS_SECTION,
		withoutTitle: right.name,
		withTitle: left.name,
		points: buildCompareChannelPoints(left.channels, right.channels)
	};
}

export function buildCompareDirectoryCoverageSection(
	left: CompareProduct,
	right: CompareProduct
): CompareDirectoryCoverageViewModel | null {
	const openQuok =
		left.slug === COMPARE_HUB_BASE_SLUG
			? left
			: right.slug === COMPARE_HUB_BASE_SLUG
				? right
				: null;
	const competitor = openQuok ? (left.slug === openQuok.slug ? right : left) : null;

	if (!openQuok || !competitor) return null;

	return {
		...COMPARE_DIRECTORY_COVERAGE_SECTION,
		withTitle: openQuok.name,
		withoutTitle: competitor.name,
		launchPlatforms: COMPARE_OPENQUOK_DIRECTORY_LAUNCH_PLATFORMS,
		competitorSummary: buildCompetitorDirectorySummary(competitor),
		openQuokFootnote:
			'Extension autofill for wired launch sites. You submit on each directory yourself and can add more directories manually.'
	};
}

export function buildCompareChannelSectionsForPair(
	left: CompareProduct,
	right: CompareProduct
): {
	socialChannelsSection: PublicAgentComparisonSection | null;
	directoryCoverageSection: CompareDirectoryCoverageViewModel | null;
} {
	return {
		socialChannelsSection: buildCompareSocialChannelsSection(left, right),
		directoryCoverageSection: buildCompareDirectoryCoverageSection(left, right)
	};
}
