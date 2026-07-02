/** Route segment for the public tools hub (no leading slash). */
export function getRootPathPublicTools(): string {
	return 'tools';
}

/** Skill file builder: `tools/skill-builder` (no leading slash). */
export function getRootPathPublicSkillBuilder(): string {
	return `${getRootPathPublicTools()}/skill-builder`;
}
