import type { StackBlueprintProgrammerModel } from '$lib/listings/listing.types';
import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

export function workflowStepsToBlueprint(
	steps: SkillBuilderWorkflowStepViewModel[],
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
		model_bindings: [],
		...(generatedMarkdown?.trim() ? { generated_markdown: generatedMarkdown.trim() } : {})
	};
}
