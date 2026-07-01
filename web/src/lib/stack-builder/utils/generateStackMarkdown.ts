import {
	OPENQUOK_CORE_EXTENSION_SLUG,
	SKILL_DEFAULT_DESCRIPTION,
	SKILL_DEFAULT_LICENSE,
	SKILL_DEFAULT_NAME,
	SKILL_DEFAULT_TITLE,
	SKILL_DEFAULT_VERSION
} from '$lib/stack-builder/constants/defaults';
import { OPENQUOK_CORE_QUICK_REFERENCE } from '$lib/stack-builder/constants/openquokCliCommandSnippets';
import { buildCoreWorkflowMarkdown } from '$lib/stack-builder/utils/buildCoreWorkflowMarkdown';
import { buildSkillPrerequisitesMarkdown } from '$lib/stack-builder/utils/buildSkillPrerequisites';
import { ensureOpenquokCoreExtensionSlug } from '$lib/stack-builder/utils/parseBuilderQuery';
import type {
	StackBuilderReferenceAssetViewModel,
	StackBuilderWorkflowStepViewModel
} from '$lib/stack-builder/stackBuilder.types';

function escapeMarkdownInline(value: string): string {
	return value.replace(/([\\`*_[\]])/g, '\\$1');
}

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

function buildQuickReferenceSection(extensionSlugs: string[]): string {
	if (!extensionSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
		return '';
	}

	return OPENQUOK_CORE_QUICK_REFERENCE;
}

function buildReferenceAssetsSection(referenceAssets: StackBuilderReferenceAssetViewModel[]): string {
	if (referenceAssets.length === 0) return '';

	const lines: string[] = ['', '## Reference assets', ''];

	for (const asset of referenceAssets) {
		lines.push(`### ${escapeMarkdownInline(asset.label)}`);
		lines.push('');
		if (asset.type === 'image' && asset.dataUrl) {
			lines.push(`![${escapeMarkdownInline(asset.label)}](${asset.dataUrl})`);
			lines.push('');
		} else if (asset.type === 'json' && asset.payload?.trim()) {
			lines.push('```json');
			lines.push(asset.payload.trim());
			lines.push('```');
			lines.push('');
		}
	}

	return lines.join('\n').trimEnd();
}

/** Build SKILL.md export from workflow steps and reference assets. */
export function generateStackMarkdown(params: {
	title?: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	referenceAssets: StackBuilderReferenceAssetViewModel[];
}): string {
	const title = params.title?.trim() || SKILL_DEFAULT_TITLE;
	const skillName = slugifySkillName(title);
	const extensionSlugs = ensureOpenquokCoreExtensionSlug(params.extensionSlugs);
	const coreWorkflow = buildCoreWorkflowMarkdown(params.workflowSteps);
	const overview = buildOverviewSection(extensionSlugs);
	const prerequisites = buildPrerequisitesSection(extensionSlugs);
	const quickReference = buildQuickReferenceSection(extensionSlugs);
	const referenceAssets = buildReferenceAssetsSection(params.referenceAssets);

	const lines = [
		'---',
		`name: ${skillName}`,
		`description: ${SKILL_DEFAULT_DESCRIPTION}`,
		`version: ${SKILL_DEFAULT_VERSION}`,
		`license: ${SKILL_DEFAULT_LICENSE}`,
		'---',
		'',
		`# ${title}`,
		'',
		'## Overview',
		'',
		overview
	];

	if (prerequisites) {
		lines.push('', '## Prerequisites', '', prerequisites);
	}

	if (quickReference) {
		lines.push('', '## Quick Reference', '', '```bash', quickReference, '```');
	}

	lines.push(
		'',
		'## Core Workflow',
		'',
		coreWorkflow,
		'',
		'## Examples',
		'',
		'### Example Input',
		'"Help me with X"',
		'',
		'### Example Output',
		"Here's what the agent should produce...",
		referenceAssets
	);

	return lines.join('\n').trimEnd() + '\n';
}
