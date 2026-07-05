import { nanoid } from 'nanoid';

import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';
import {
	OPENQUOK_COMMAND_WORKFLOW_META,
	resolveCommandWorkflowTitle
} from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';
import { resolveOpenquokCommandTemplate } from '$lib/skill-builder/constants/openquokCliCommandSnippets';

import type { StackBlueprintProgrammerModel } from '$lib/listings/listing.types';
import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

export function blueprintToWorkflowSteps(
	blueprint: StackBlueprintProgrammerModel | null | undefined,
	extensionTitlesBySlug: Record<string, string>
): SkillBuilderWorkflowStepViewModel[] {
	if (!blueprint?.workflow_steps?.length) return [];

	return blueprint.workflow_steps.map((step) => {
		if (step.type === 'text') {
			return {
				id: nanoid(),
				type: 'text' as const,
				title: step.title ?? '',
				content: step.content ?? ''
			};
		}

		const listingSlug = step.listing_slug ?? 'extension';
		const commandName = step.command_name ?? 'command';
		const meta = OPENQUOK_COMMAND_WORKFLOW_META[commandName];
		const commandTemplate =
			step.command_template?.trim() ||
			(listingSlug === OPENQUOK_CORE_EXTENSION_SLUG
				? resolveOpenquokCommandTemplate(commandName)
				: undefined);

		return {
			id: nanoid(),
			type: 'command' as const,
			kind: listingSlug === 'revenuecat-mcp' ? ('mcp' as const) : ('cli' as const),
			listingSlug,
			listingTitle: extensionTitlesBySlug[listingSlug] ?? listingSlug,
			commandName,
			title: step.title ?? meta?.title,
			prompt: step.prompt ?? meta?.prompt ?? '',
			examplePayload: step.example_payload ?? meta?.examplePayload,
			commandTemplate
		};
	});
}
