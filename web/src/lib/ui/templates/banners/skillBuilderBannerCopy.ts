export const SKILL_BUILDER_DOCS_BANNER = {
	docsPath: '/docs/getting-started-for-cli',
	title: 'Read the OpenQuok CLI guide',
	description:
		'Install commands, auth patterns, and workflow recipes to export from Skill Builder into your agent.'
} as const;

export function accentSplitSkillBuilderCliCtaBannerTitle(label: string): string {
	return `Browse ${label} CLI examples`;
}

export function accentSplitSkillBuilderCliCtaBannerDescription(label: string): string {
	return `Copy-paste openquok commands for ${label} — posts, analytics, and integration recipes pre-loaded in Skill Builder.`;
}
