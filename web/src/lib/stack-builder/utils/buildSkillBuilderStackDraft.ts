import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { SkillBuilderStackDraft } from '$lib/stack-builder/constants/skillBuilderDraftStorage';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export function buildSkillBuilderStackDraft(params: {
	title: string;
	markdown: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	extensions: ExtensionDetailViewModel[];
}): SkillBuilderStackDraft {
	const extensionIdsBySlug = Object.fromEntries(
		params.extensions.map((extension) => [extension.slug, extension.id])
	);

	return {
		title: params.title,
		markdown: params.markdown,
		extensionSlugs: params.extensionSlugs,
		workflowSteps: params.workflowSteps,
		extensionIdsBySlug
	};
}
