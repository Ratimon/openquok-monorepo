import { PUBLIC_PLAYBOOKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
import { formatHubFilterHeroTitle } from '$lib/content/utils/formatHubFilterHeroTitle';

/** H1 / meta title for category, tag, or combined filter pages (long-tail SEO). */
export function formatPlaybooksFilterHeroTitle(...subjectParts: string[]): string {
	return formatHubFilterHeroTitle(PUBLIC_PLAYBOOKS_HUB.filterPageTitleSuffix, ...subjectParts);
}
