import {
	OPENQUOK_CORE_EXTENSION_SLUG,
	SKILL_DEFAULT_DESCRIPTION,
	SKILL_DEFAULT_LICENSE,
	SKILL_DEFAULT_NAME,
	SKILL_DEFAULT_TITLE,
	SKILL_DEFAULT_VERSION
} from '$lib/skill-builder/constants/defaults';
import { OPENQUOK_CORE_QUICK_REFERENCE } from '$lib/skill-builder/constants/openquokCliCommandSnippets';
import {
	buildQuickReferenceMarkdown,
	collectMcpServerNames,
	type QuickReferenceExtension
} from '$lib/skill-builder/utils/buildQuickReferenceMarkdown';
import { buildCoreWorkflowMarkdown } from '$lib/skill-builder/utils/buildCoreWorkflowMarkdown';
import { buildSkillPrerequisitesMarkdown } from '$lib/skill-builder/utils/buildSkillPrerequisites';
import { ensureOpenquokCoreExtensionSlug } from '$lib/skill-builder/utils/parseBuilderQuery';
import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

function slugifySkillName(title: string): string {
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || SKILL_DEFAULT_NAME;
}

function buildOverviewSection(extensionSlugs: string[]): string {
	if (extensionSlugs.length === 0) {
		return 'Describe what this skill helps with.';
	}

	const slugList = extensionSlugs.map((slug) => `\`${slug}\``).join(', ');
	return `Describe what this skill helps with.\n\nBuilt with extensions: ${slugList}.`;
}

function buildPrerequisitesSection(extensionSlugs: string[]): string {
	return buildSkillPrerequisitesMarkdown(extensionSlugs);
}

function buildQuickReferenceSection(
	extensionSlugs: string[],
	extensions: QuickReferenceExtension[] | undefined
): string {
	if (extensions && extensions.length > 0) {
		return buildQuickReferenceMarkdown(extensions, extensionSlugs);
	}

	if (!extensionSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
		return '';
	}

	return ['### OpenQuok Core', '', '```bash', OPENQUOK_CORE_QUICK_REFERENCE, '```'].join('\n');
}

/** Build SKILL.md export from workflow steps. */
export function generateSkillMarkdown(params: {
	title?: string;
	extensionSlugs: string[];
	extensions?: QuickReferenceExtension[];
	workflowSteps: SkillBuilderWorkflowStepViewModel[];
}): string {
	const title = params.title?.trim() || SKILL_DEFAULT_TITLE;
	const skillName = slugifySkillName(title);
	const extensionSlugs = ensureOpenquokCoreExtensionSlug(params.extensionSlugs);
	const coreWorkflow = buildCoreWorkflowMarkdown(params.workflowSteps);
	const overview = buildOverviewSection(extensionSlugs);
	const prerequisites = buildPrerequisitesSection(extensionSlugs);
	const quickReference = buildQuickReferenceSection(extensionSlugs, params.extensions);
	const mcpServers = collectMcpServerNames(
		(params.extensions ?? []).filter((extension) => extensionSlugs.includes(extension.slug))
	);

	const lines = [
		'---',
		`name: ${skillName}`,
		`description: ${SKILL_DEFAULT_DESCRIPTION}`,
		`version: ${SKILL_DEFAULT_VERSION}`,
		`license: ${SKILL_DEFAULT_LICENSE}`
	];

	if (mcpServers.length > 0) {
		lines.push('mcp_servers:');
		for (const serverName of mcpServers) {
			lines.push(`  - ${serverName}`);
		}
	}

	lines.push(
		'---',
		'',
		`# ${title}`,
		'',
		'## Overview',
		'',
		overview
	);

	if (prerequisites) {
		lines.push('', '## Prerequisites', '', prerequisites);
	}

	lines.push('', '## Core Workflow', '', coreWorkflow);

	if (quickReference) {
		lines.push('', '## Quick Reference', '', quickReference);
	}

	return lines.join('\n').trimEnd() + '\n';
}
