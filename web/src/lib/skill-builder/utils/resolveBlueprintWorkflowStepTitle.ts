import type { StackBlueprintWorkflowStepProgrammerModel } from '$lib/listings/listing.types';
import { resolveCommandWorkflowTitle } from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';

export function resolveBlueprintWorkflowStepTitle(
	step: StackBlueprintWorkflowStepProgrammerModel
): string {
	if (step.type === 'text') {
		return step.title?.trim() || 'Workflow note';
	}

	return resolveCommandWorkflowTitle(step.command_name ?? 'command', step.title);
}
