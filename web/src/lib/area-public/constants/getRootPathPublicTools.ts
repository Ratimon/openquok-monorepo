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
