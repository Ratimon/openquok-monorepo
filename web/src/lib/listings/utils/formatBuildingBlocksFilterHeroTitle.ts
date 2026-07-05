import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';

/** H1 / meta title for category, tag, or combined filter pages (long-tail SEO). */
export function formatBuildingBlocksFilterHeroTitle(...subjectParts: string[]): string {
	const subjects = subjectParts.map((part) => part.trim()).filter(Boolean);
	const suffix = PUBLIC_BUILDING_BLOCKS_HUB.filterPageTitleSuffix;
	if (subjects.length === 0) return suffix;
	return [...subjects, suffix].join(' · ');
}
