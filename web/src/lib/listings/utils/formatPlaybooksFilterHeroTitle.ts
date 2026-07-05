import { PUBLIC_PLAYBOOKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';

/** H1 / meta title for category, tag, or combined filter pages (long-tail SEO). */
export function formatPlaybooksFilterHeroTitle(...subjectParts: string[]): string {
	const subjects = subjectParts.map((part) => part.trim()).filter(Boolean);
	const suffix = PUBLIC_PLAYBOOKS_HUB.filterPageTitleSuffix;
	if (subjects.length === 0) return suffix;
	return [...subjects, suffix].join(' · ');
}
