import type {
	StackBuilderReferenceAsset,
	StackBuilderWorkflowStep
} from '$lib/stack-builder/stackBuilder.types';

function escapeMarkdownInline(value: string): string {
	return value.replace(/([\\`*_[\]])/g, '\\$1');
}

function formatCommandStepTitle(step: Extract<StackBuilderWorkflowStep, { type: 'command' }>): string {
	return `${step.listingSlug} · ${step.commandName}`;
}

function formatPayloadBlock(payload: Record<string, unknown>): string {
	return ['```json', JSON.stringify(payload, null, 2), '```'].join('\n');
}

/** Build export markdown from workflow steps and reference assets. */
export function generateStackMarkdown(params: {
	title?: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStep[];
	referenceAssets: StackBuilderReferenceAsset[];
}): string {
	const lines: string[] = [];
	const title = params.title?.trim() || 'Agent workflow stack';

	lines.push(`# ${title}`);
	lines.push('');
	lines.push('## Extensions');
	lines.push('');
	for (const slug of params.extensionSlugs) {
		lines.push(`- \`${slug}\``);
	}
	lines.push('');
	lines.push('## Workflow');
	lines.push('');

	params.workflowSteps.forEach((step, index) => {
		const stepNumber = index + 1;
		if (step.type === 'text') {
			lines.push(`${stepNumber}. ${step.content.trim() || '_Text step_'}`);
			lines.push('');
			return;
		}

		lines.push(`${stepNumber}. **${formatCommandStepTitle(step)}**`);
		if (step.prompt.trim()) {
			lines.push('');
			lines.push(step.prompt.trim());
		}
		if (step.commandTemplate?.trim()) {
			lines.push('');
			lines.push('```bash');
			lines.push(step.commandTemplate.trim());
			lines.push('```');
		}
		if (step.examplePayload && Object.keys(step.examplePayload).length > 0) {
			lines.push('');
			lines.push(formatPayloadBlock(step.examplePayload));
		}
		lines.push('');
	});

	if (params.referenceAssets.length > 0) {
		lines.push('## Reference assets');
		lines.push('');

		for (const asset of params.referenceAssets) {
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
	}

	return lines.join('\n').trimEnd() + '\n';
}
