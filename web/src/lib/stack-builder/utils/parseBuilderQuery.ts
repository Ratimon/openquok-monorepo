import {
	DEFAULT_SKILL_BUILDER_EXTENSION_SLUGS,
	OPENQUOK_CORE_EXTENSION_SLUG
} from '$lib/stack-builder/constants/defaults';

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

/** Parse `?extensions=openquok-core,revenuecat-mcp` (always includes openquok-core). */
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
