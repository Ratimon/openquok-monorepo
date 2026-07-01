import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { AgentBuilderStackDraft } from '$lib/stack-builder/constants/agentBuilderDraftStorage';
import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export function buildAgentBuilderStackDraft(params: {
	title: string;
	markdown: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	extensions: ExtensionDetailViewModel[];
}): AgentBuilderStackDraft {
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
