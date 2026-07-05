import type { SkillBuilderStackDraft } from '$lib/skill-builder/constants/skillBuilderDraftStorage';

type BuildingBlockSelectionEntry = {
	id: string;
	slug: string;
	extensionType: string | null;
};

/** Build a stack editor draft from building blocks selected on the account hub. */
export function buildStackDraftFromBuildingBlockSelection(
	buildingBlocks: BuildingBlockSelectionEntry[]
): SkillBuilderStackDraft {
	return {
		title: '',
		markdown: '',
		extensionSlugs: buildingBlocks.map((buildingBlock) => buildingBlock.slug),
		workflowSteps: [],
		extensionIdsBySlug: Object.fromEntries(
			buildingBlocks.map((buildingBlock) => [buildingBlock.slug, buildingBlock.id])
		),
		extensionTypesBySlug: Object.fromEntries(
			buildingBlocks.map((buildingBlock) => [buildingBlock.slug, buildingBlock.extensionType])
		)
	};
}
