import type { StackBlueprintProgrammerModel } from '$lib/listings/listing.types';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export function workflowStepsToBlueprint(
	steps: StackBuilderWorkflowStepViewModel[],
	generatedMarkdown?: string
): StackBlueprintProgrammerModel {
	const workflow_steps = steps.map((step) => {
		if (step.type === 'text') {
			return {
				type: 'text' as const,
				title: step.title,
				content: step.content
			};
		}

		return {
			type: 'command' as const,
			listing_slug: step.listingSlug,
			command_name: step.commandName,
			title: step.title,
			prompt: step.prompt,
			command_template: step.commandTemplate,
			example_payload: step.examplePayload
		};
	});

	return {
		workflow_steps,
		reference_assets: [],
		...(generatedMarkdown?.trim() ? { generated_markdown: generatedMarkdown.trim() } : {})
	};
}
