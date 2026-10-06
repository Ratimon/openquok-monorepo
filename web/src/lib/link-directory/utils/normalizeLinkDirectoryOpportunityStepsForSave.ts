import type { LinkDirectoryOpportunityStepDto } from '$lib/link-directory/link-directory.types';

/** Sort by `order`, drop blank rows, renumber 1…n for API / JSON-LD. */
export function normalizeLinkDirectoryOpportunityStepsForSave(
	raw: LinkDirectoryOpportunityStepDto[] | undefined
): LinkDirectoryOpportunityStepDto[] {
	const sorted = [...(raw ?? [])].sort((a, b) => a.order - b.order);
	return sorted
		.filter((step) => step.title.trim() && step.body.trim())
		.map((step, index) => ({
			order: index + 1,
			title: step.title.trim(),
			body: step.body.trim()
		}));
}

export function sortLinkDirectoryOpportunitySteps(
	steps: LinkDirectoryOpportunityStepDto[] | undefined
): LinkDirectoryOpportunityStepDto[] {
	return [...(steps ?? [])].sort((a, b) => a.order - b.order);
}
