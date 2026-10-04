import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { formatHubFilterHeroTitle } from '$lib/content/utils/formatHubFilterHeroTitle';

/** H1 / meta title for category, tag, or combined filter pages (long-tail SEO). */
export function formatBuildingBlocksFilterHeroTitle(...subjectParts: string[]): string {
	return formatHubFilterHeroTitle(
		PUBLIC_BUILDING_BLOCKS_HUB.filterPageTitleSuffix,
		...subjectParts
	);
}
