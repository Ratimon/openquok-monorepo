import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';

import { getSkillBuilderChannelBySlug } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { createDefaultStarterWorkflowSteps } from '$lib/skill-builder/constants/defaults';
import type { SkillBuilderPageViewModel } from '$lib/skill-builder/skillBuilder.types';
import { blueprintToWorkflowSteps } from '$lib/skill-builder/utils/blueprintToBuilderState';
import { buildChannelSkillBuilderWorkflowSteps } from '$lib/skill-builder/utils/buildChannelSkillBuilderWorkflowSteps';
import {
	ensureOpenquokCoreExtensionSlug,
	parseExtensionSlugsFromQuery
} from '$lib/skill-builder/utils/parseBuilderQuery';

export class PublicSkillBuilderPagePresenter {
	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	async loadSkillBuilderStateless(params: {
		fetch?: typeof globalThis.fetch;
		buildingBlockSlugsParam?: string | null;
		stackSlug?: string | null;
		channelSlug?: string | null;
	}): Promise<SkillBuilderPageViewModel> {
		const selectedBuildingBlockSlugs = parseExtensionSlugsFromQuery(params.buildingBlockSlugsParam);
		const stackSlug = params.stackSlug?.trim() || null;
		const channelSlug = params.channelSlug?.trim().toLowerCase() || null;
		const channelConfig = channelSlug ? getSkillBuilderChannelBySlug(channelSlug) : undefined;

		let stackTitle: string | null = null;
		let stackBlueprint = null;
		const slugSet = new Set(selectedBuildingBlockSlugs);

		if (stackSlug) {
			const stackVm = await this.getListingPresenter.loadPublishedStackBySlugVm(
				stackSlug,
				params.fetch
			);
			if (stackVm) {
				stackTitle = stackVm.title;
				stackBlueprint = stackVm.stackBlueprint;
				for (const member of stackVm.stackMembers) {
					if (member.member?.slug) slugSet.add(member.member.slug);
				}
			}
		}

		const resolvedSlugs = ensureOpenquokCoreExtensionSlug([...slugSet]);
		const selectedBuildingBlocks = (
			await Promise.all(
				resolvedSlugs.map((slug) =>
					this.getListingPresenter.loadPublishedExtensionBySlugStateless(slug, params.fetch)
				)
			)
		).filter((buildingBlock): buildingBlock is NonNullable<typeof buildingBlock> => buildingBlock != null);

		const buildingBlockTitlesBySlug = Object.fromEntries(
			selectedBuildingBlocks.map((buildingBlock) => [buildingBlock.slug, buildingBlock.title])
		);

		const blueprintSteps = blueprintToWorkflowSteps(stackBlueprint, buildingBlockTitlesBySlug);

		const defaultMetaTitle = 'Skill Builder';
		const defaultMetaDescription =
			'Build customized agent skills from selected SKILLs and MCP tools. Preview and download SKILL.md for your workspace.';

		return {
			metaTitle: channelConfig?.metaTitle ?? defaultMetaTitle,
			metaDescription: channelConfig?.metaDescription ?? defaultMetaDescription,
			selectedBuildingBlockSlugs: resolvedSlugs,
			selectedBuildingBlocks,
			initialWorkflowSteps:
				blueprintSteps.length > 0
					? blueprintSteps
					: channelConfig
						? buildChannelSkillBuilderWorkflowSteps(channelConfig)
						: createDefaultStarterWorkflowSteps(),
			stackTitle,
			stackSlug,
			channelSlug: channelConfig?.channelSlug ?? null,
			channelLabel: channelConfig?.platformLabel ?? null,
			cliExamplesPath: channelConfig?.cliExamplesPath ?? null
		};
	}
}
