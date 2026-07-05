import { nanoid } from 'nanoid';

import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';
import type { SkillBuilderChannelPageConfig } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { OPENQUOK_COMMAND_WORKFLOW_META } from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';
import { resolveOpenquokCommandTemplate } from '$lib/skill-builder/constants/openquokCliCommandSnippets';
import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

function integrationListJqFilter(providerIdentifiers: readonly string[]): string {
	if (providerIdentifiers.length === 1) {
		return `.identifier=="${providerIdentifiers[0]}"`;
	}
	return providerIdentifiers.map((id) => `.identifier=="${id}"`).join(' or ');
}

/** Pre-loaded Core Workflow steps for a channel-specific Skill Builder page. */
export function buildChannelSkillBuilderWorkflowSteps(
	config: SkillBuilderChannelPageConfig
): SkillBuilderWorkflowStepViewModel[] {
	const jqFilter = integrationListJqFilter(config.providerIdentifiers);
	const listMeta = OPENQUOK_COMMAND_WORKFLOW_META['integrations:list'];
	const settingsMeta = OPENQUOK_COMMAND_WORKFLOW_META['integrations:settings'];
	const analyticsMeta = OPENQUOK_COMMAND_WORKFLOW_META['analytics:platform'];

	const steps: SkillBuilderWorkflowStepViewModel[] = [
		{
			id: nanoid(),
			type: 'command',
			kind: 'cli',
			listingSlug: OPENQUOK_CORE_EXTENSION_SLUG,
			listingTitle: 'OpenQuok Core',
			commandName: 'integrations:list',
			title: listMeta?.title ?? 'Discover connected channels',
			prompt: `List connected ${config.platformLabel} integrations: openquok integrations:list | jq -r '.[] | select(${jqFilter}) | .id'`,
			commandTemplate: resolveOpenquokCommandTemplate('integrations:list')
		},
		{
			id: nanoid(),
			type: 'command',
			kind: 'cli',
			listingSlug: OPENQUOK_CORE_EXTENSION_SLUG,
			listingTitle: 'OpenQuok Core',
			commandName: 'integrations:settings',
			title: settingsMeta?.title ?? 'Inspect channel settings',
			prompt: `Fetch posting rules and limits for ${config.platformLabel} before composing: openquok integrations:settings "<integration-id>"`,
			commandTemplate: resolveOpenquokCommandTemplate('integrations:settings')
		}
	];

	for (const recipe of config.recipes) {
		steps.push({
			id: nanoid(),
			type: 'command',
			kind: 'cli',
			listingSlug: OPENQUOK_CORE_EXTENSION_SLUG,
			listingTitle: 'OpenQuok Core',
			commandName: 'posts:create',
			title: recipe.label,
			prompt: recipe.prompt,
			commandTemplate: resolveOpenquokCommandTemplate('posts:create'),
			examplePayload: { ...recipe.examplePayload }
		});
	}

	steps.push({
		id: nanoid(),
		type: 'command',
		kind: 'cli',
		listingSlug: OPENQUOK_CORE_EXTENSION_SLUG,
		listingTitle: 'OpenQuok Core',
		commandName: 'analytics:platform',
		title: analyticsMeta?.title ?? 'Measure channel performance',
		prompt: `Pull platform analytics for ${config.platformLabel}: openquok analytics:platform "<integration-id>" -d 30`,
		commandTemplate: resolveOpenquokCommandTemplate('analytics:platform')
	});

	return steps;
}
