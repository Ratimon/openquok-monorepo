import { SKILL_STARTER_CORE_WORKFLOW } from '$lib/stack-builder/constants/defaults';
import { resolveCommandWorkflowTitle } from '$lib/stack-builder/constants/openquokCommandWorkflowMeta';
import { supportsWorkflowJsonPayload } from '$lib/stack-builder/utils/postsCreatePayload';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

function formatPayloadBlock(payload: Record<string, unknown>): string {
	return ['```json', JSON.stringify(payload, null, 2), '```'].join('\n');
}

function formatWorkflowStepBlock(
	step: StackBuilderWorkflowStepViewModel,
	stepNumber: number
): string[] {
	const lines: string[] = [];

	if (step.type === 'text') {
		const title = step.title?.trim();
		lines.push(title ? `### ${stepNumber}. ${title}` : `### ${stepNumber}. Workflow note`);
		lines.push('');
		lines.push(step.content.trim() || '_Add workflow notes for the agent._');
		lines.push('');
		return lines;
	}

	const title = resolveCommandWorkflowTitle(step.commandName, step.title);
	lines.push(`### ${stepNumber}. ${title}`);
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
	if (
		supportsWorkflowJsonPayload(step.commandName) &&
		step.examplePayload &&
		Object.keys(step.examplePayload).length > 0
	) {
		lines.push('Example `post.json` body for `openquok posts:create --json`:');
		lines.push('');
		lines.push(formatPayloadBlock(step.examplePayload));
		lines.push('');
	}

	return lines;
}

export function buildCoreWorkflowMarkdown(workflowSteps: StackBuilderWorkflowStepViewModel[]): string {
	if (workflowSteps.length === 0) {
		return SKILL_STARTER_CORE_WORKFLOW;
	}

	const lines: string[] = [];

	workflowSteps.forEach((step, index) => {
		lines.push(...formatWorkflowStepBlock(step, index + 1));
	});

	return lines.join('\n').trimEnd();
}
