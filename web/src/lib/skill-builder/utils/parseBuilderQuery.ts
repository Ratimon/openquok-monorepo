import {
	DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS,
	OPENQUOK_CORE_EXTENSION_SLUG
} from '$lib/skill-builder/constants/defaults';

/** Always include openquok-core first; preserve order for other slugs. */
export function ensureOpenquokCoreExtensionSlug(slugs: string[]): string[] {
	const normalized = slugs.map((slug) => slug.trim()).filter(Boolean);
	if (normalized.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
		return [
			OPENQUOK_CORE_EXTENSION_SLUG,
			...normalized.filter((slug) => slug !== OPENQUOK_CORE_EXTENSION_SLUG)
		];
	}

	return [OPENQUOK_CORE_EXTENSION_SLUG, ...normalized];
}

export const SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM = 'building-blocks' as const;
export const SKILL_BUILDER_LEGACY_EXTENSIONS_QUERY_PARAM = 'extensions' as const;

/** Read `?building-blocks=` with fallback to legacy `?extensions=`. */
export function getBuildingBlockSlugsQueryParam(
	searchParams: Pick<URLSearchParams, 'get'>
): string | null {
	return (
		searchParams.get(SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM) ??
		searchParams.get(SKILL_BUILDER_LEGACY_EXTENSIONS_QUERY_PARAM)
	);
}

/** Parse `?building-blocks=openquok-core,revenuecat-mcp` (always includes openquok-core). */
export function parseExtensionSlugsFromQuery(raw: string | null | undefined): string[] {
	if (!raw?.trim()) {
		return [...DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS];
	}

	const slugs = raw
		.split(',')
		.map((slug) => slug.trim())
		.filter(Boolean);

	return ensureOpenquokCoreExtensionSlug(slugs.length > 0 ? slugs : [...DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS]);
}

export function serializeExtensionSlugs(slugs: string[]): string {
	return slugs.join(',');
}
