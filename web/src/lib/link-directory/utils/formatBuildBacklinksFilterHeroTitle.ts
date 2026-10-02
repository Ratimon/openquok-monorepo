import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';

export function formatBuildBacklinksFilterHeroTitle(...subjectParts: string[]): string {
	const subjects = subjectParts.map((part) => part.trim()).filter(Boolean);
	const suffix = PUBLIC_BUILD_BACKLINKS_HUB.filterPageTitleSuffix;
	if (subjects.length === 0) return suffix;
	return [...subjects, suffix].join(' · ');
}
