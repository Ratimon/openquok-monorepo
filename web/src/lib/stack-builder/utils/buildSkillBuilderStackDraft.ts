import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { SkillBuilderStackDraft } from '$lib/stack-builder/constants/skillBuilderDraftStorage';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export function buildSkillBuilderStackDraft(params: {
	title: string;
	markdown: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	extensions: ExtensionDetailViewModel[];
	extensionIdsBySlugOverride?: Record<string, string>;
	extensionTypesBySlugOverride?: Record<string, string | null>;
}): SkillBuilderStackDraft {
	const extensionIdsBySlug = {
		...params.extensionIdsBySlugOverride,
		...Object.fromEntries(params.extensions.map((extension) => [extension.slug, extension.id]))
	};

	return {
		title: params.title,
		markdown: params.markdown,
		extensionSlugs: params.extensionSlugs,
		workflowSteps: params.workflowSteps,
		extensionIdsBySlug,
		extensionTypesBySlug: params.extensionTypesBySlugOverride
	};
}
