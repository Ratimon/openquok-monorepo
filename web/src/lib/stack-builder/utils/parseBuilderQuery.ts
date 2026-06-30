import { DEFAULT_AGENT_BUILDER_EXTENSION_SLUGS } from '$lib/stack-builder/constants/defaults';

/** Parse `?extensions=openquok-core,revenuecat-mcp` (falls back to openquok-core). */
export function parseExtensionSlugsFromQuery(raw: string | null | undefined): string[] {
	if (!raw?.trim()) {
		return [...DEFAULT_AGENT_BUILDER_EXTENSION_SLUGS];
	}

	const slugs = raw
		.split(',')
		.map((slug) => slug.trim())
		.filter(Boolean);

	return slugs.length > 0 ? slugs : [...DEFAULT_AGENT_BUILDER_EXTENSION_SLUGS];
}

export function serializeExtensionSlugs(slugs: string[]): string {
	return slugs.join(',');
}
