import type { SkillBuilderStackDraft } from '$lib/stack-builder/constants/skillBuilderDraftStorage';

type ExtensionSelectionEntry = {
	id: string;
	slug: string;
	extensionType: string | null;
};

/** Build a stack editor draft from extensions selected on the account hub. */
export function buildStackDraftFromExtensionSelection(
	extensions: ExtensionSelectionEntry[]
): SkillBuilderStackDraft {
	return {
		title: '',
		markdown: '',
		extensionSlugs: extensions.map((extension) => extension.slug),
		workflowSteps: [],
		extensionIdsBySlug: Object.fromEntries(extensions.map((extension) => [extension.slug, extension.id])),
		extensionTypesBySlug: Object.fromEntries(
			extensions.map((extension) => [extension.slug, extension.extensionType])
		)
	};
}
