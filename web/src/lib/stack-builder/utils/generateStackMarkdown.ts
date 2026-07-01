import {
	SKILL_DEFAULT_DESCRIPTION,
	SKILL_DEFAULT_LICENSE,
	SKILL_DEFAULT_NAME,
	SKILL_DEFAULT_TITLE,
	SKILL_DEFAULT_VERSION,
	SKILL_STARTER_INSTRUCTIONS
} from '$lib/stack-builder/constants/defaults';
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

function formatCommandStepTitle(
	step: Extract<StackBuilderWorkflowStepViewModel, { type: 'command' }>
): string {
	return step.commandName;
}

function formatPayloadBlock(payload: Record<string, unknown>): string {
	return ['```json', JSON.stringify(payload, null, 2), '```'].join('\n');
}

function buildInstructionsSection(workflowSteps: StackBuilderWorkflowStepViewModel[]): string {
	if (workflowSteps.length === 0) {
		return SKILL_STARTER_INSTRUCTIONS;
	}

	const lines: string[] = ['Step-by-step instructions for the agent to follow.', ''];

	workflowSteps.forEach((step, index) => {
		const stepNumber = index + 1;
		if (step.type === 'text') {
			lines.push(`### Step ${stepNumber}`);
			lines.push('');
			lines.push(step.content.trim() || '_Text step_');
			lines.push('');
			return;
		}

		lines.push(`### Step ${stepNumber}: ${formatCommandStepTitle(step)}`);
		lines.push('');
		if (step.prompt.trim()) {
			lines.push(step.prompt.trim());
			lines.push('');
		}
		if (step.commandTemplate?.trim()) {
			lines.push('```bash');
			lines.push(step.commandTemplate.trim());
			lines.push('```');
			lines.push('');
		}
		if (step.examplePayload && Object.keys(step.examplePayload).length > 0) {
			lines.push(formatPayloadBlock(step.examplePayload));
			lines.push('');
		}
	});

	return lines.join('\n').trimEnd();
}

function buildOverviewSection(extensionSlugs: string[]): string {
	if (extensionSlugs.length === 0) {
		return 'Describe what this skill helps with.';
	}

	const slugList = extensionSlugs.map((slug) => `\`${slug}\``).join(', ');
	return `Describe what this skill helps with.\n\nBuilt with extensions: ${slugList}.`;
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
	const instructions = buildInstructionsSection(params.workflowSteps);
	const overview = buildOverviewSection(params.extensionSlugs);
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
		overview,
		'',
		'## Instructions',
		'',
		instructions,
		'',
		'## Examples',
		'',
		'### Example Input',
		'"Help me with X"',
		'',
		'### Example Output',
		"Here's what the agent should produce...",
		referenceAssets
	];

	return lines.join('\n').trimEnd() + '\n';
}
