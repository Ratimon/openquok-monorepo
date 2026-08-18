/** Route segment for the public tools hub (no leading slash). */
export function getRootPathPublicTools(): string {
	return 'tools';
}

/** Skill file builder: `tools/skill-builder` (no leading slash). */
export function getRootPathPublicSkillBuilder(): string {
	return `${getRootPathPublicTools()}/skill-builder`;
}

/** Channel-specific Skill Builder: `tools/skill-builder/{channelSlug}` (no leading slash). */
export function getRootPathPublicSkillBuilderChannel(channelSlug: string): string {
	return `${getRootPathPublicSkillBuilder()}/${channelSlug.trim()}`;
}

/** Photo editor: `tools/photo-editor` (no leading slash). */
export function getRootPathPublicPhotoEditor(): string {
	return `${getRootPathPublicTools()}/photo-editor`;
}

/** Channel-specific Photo Editor: `tools/photo-editor/{channelSlug}` (no leading slash). */
export function getRootPathPublicPhotoEditorChannel(channelSlug: string): string {
	return `${getRootPathPublicPhotoEditor()}/${channelSlug.trim()}`;
}

/** Humanizer composer: `tools/humanizer` (no leading slash). */
export function getRootPathPublicHumanize(): string {
	return `${getRootPathPublicTools()}/humanizer`;
}

/** Channel-specific Humanizer: `tools/humanizer/{channelSlug}` (no leading slash). */
export function getRootPathPublicHumanizeChannel(channelSlug: string): string {
	return `${getRootPathPublicHumanize()}/${channelSlug.trim()}`;
}

/** Previous public path (`tools/humanize`) — 301 to {@link getRootPathPublicHumanize}. */
export function getRootPathPublicHumanizeLegacy(): string {
	return `${getRootPathPublicTools()}/humanize`;
}

/**
 * Maps `/tools/humanize` and `/tools/humanize/{slug}` to the current Humanizer
 * paths. Does not match `/tools/humanizer` (that slug only shares a prefix).
 */
export function rewriteLegacyPublicHumanizePathname(pathname: string): string | null {
	const legacy = `/${getRootPathPublicHumanizeLegacy()}`;
	const next = `/${getRootPathPublicHumanize()}`;
	if (pathname === legacy) return next;
	if (pathname.startsWith(`${legacy}/`)) {
		return `${next}/${pathname.slice(legacy.length + 1)}`;
	}
	return null;
}

/** Best time to post calculator: `tools/best-time-to-post` (no leading slash). */
export function getRootPathPublicBestTimeToPost(): string {
	return `${getRootPathPublicTools()}/best-time-to-post`;
}

/** Channel-specific Best Time to Post: `tools/best-time-to-post/{channelSlug}` (no leading slash). */
export function getRootPathPublicBestTimeToPostChannel(channelSlug: string): string {
	return `${getRootPathPublicBestTimeToPost()}/${channelSlug.trim()}`;
}
