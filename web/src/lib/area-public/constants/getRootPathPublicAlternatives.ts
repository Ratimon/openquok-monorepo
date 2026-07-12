import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';

/** Route segment for the public alternatives hub (no leading slash). */
export function getRootPathPublicAlternatives(): string {
	return 'alternatives';
}

/** Alternatives directory page: `alternatives/{targetSlug}` (no leading slash). */
export function getRootPathPublicAlternativesTarget(targetSlug: string): string {
	return `${getRootPathPublicAlternatives()}/${targetSlug.trim()}`;
}

/** Head-to-head compare link for an alternative listing (no leading slash). */
export function getRootPathPublicAlternativesComparePair(
	alternativeSlug: string,
	targetSlug: string
): string {
	return `${getRootPathPublicCompare()}/${alternativeSlug.trim()}/${targetSlug.trim()}`;
}
