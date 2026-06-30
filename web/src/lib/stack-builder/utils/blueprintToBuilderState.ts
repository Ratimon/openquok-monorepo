import { nanoid } from 'nanoid';

import type { StackBlueprintProgrammerModel } from '$lib/listings/listing.types';
import type {
	StackBuilderReferenceAssetViewModel,
	StackBuilderWorkflowStepViewModel
} from '$lib/stack-builder/stackBuilder.types';

export function blueprintToWorkflowSteps(
	blueprint: StackBlueprintProgrammerModel | null | undefined,
	extensionTitlesBySlug: Record<string, string>
): StackBuilderWorkflowStepViewModel[] {
	if (!blueprint?.workflow_steps?.length) return [];

	return blueprint.workflow_steps.map((step) => {
		if (step.type === 'text') {
			return {
				id: nanoid(),
				type: 'text' as const,
				content: step.content ?? ''
			};
		}

		const listingSlug = step.listing_slug ?? 'extension';
		return {
			id: nanoid(),
			type: 'command' as const,
			listingSlug,
			listingTitle: extensionTitlesBySlug[listingSlug] ?? listingSlug,
			commandName: step.command_name ?? 'command',
			prompt: step.prompt ?? '',
			examplePayload: step.example_payload
		};
	});
}

export function blueprintToReferenceAssets(
	blueprint: StackBlueprintProgrammerModel | null | undefined
): StackBuilderReferenceAssetViewModel[] {
	if (!blueprint?.reference_assets?.length) return [];

	return blueprint.reference_assets.map((asset, index) => ({
		id: `asset-${index}-${nanoid(6)}`,
		type: asset.type,
		label: asset.label,
		payload: asset.payload,
		dataUrl: asset.data_url
	}));
}
