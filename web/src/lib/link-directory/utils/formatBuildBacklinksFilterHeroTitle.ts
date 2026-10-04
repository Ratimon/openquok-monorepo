import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';
import { formatHubFilterHeroTitle } from '$lib/content/utils/formatHubFilterHeroTitle';

export function formatBuildBacklinksFilterHeroTitle(...subjectParts: string[]): string {
	return formatHubFilterHeroTitle(
		PUBLIC_BUILD_BACKLINKS_HUB.filterPageTitleSuffix,
		...subjectParts
	);
}
