import type { DocsYoutubeVideoPreset } from '$lib/docs/constants/docsYoutubeVideos';

export type { DocsYoutubeVideoPreset };

const PRESET_ATTR_RE = /videoObjectPreset\s*=\s*["']([^"']+)["']/g;

const KNOWN_PRESETS = new Set<DocsYoutubeVideoPreset>(['connectChannels']);

/**
 * Reads `videoObjectPreset="…"` from MDX (e.g. on `VideoModal`) for SSR JSON-LD.
 */
export function extractDocsVideoObjectPresetsFromRaw(raw: string): DocsYoutubeVideoPreset[] {
	const found: DocsYoutubeVideoPreset[] = [];
	const seen = new Set<string>();

	for (const match of raw.matchAll(PRESET_ATTR_RE)) {
		const key = match[1]?.trim();
		if (!key || seen.has(key)) continue;
		seen.add(key);
		if (KNOWN_PRESETS.has(key as DocsYoutubeVideoPreset)) {
			found.push(key as DocsYoutubeVideoPreset);
		}
	}

	return found;
}
