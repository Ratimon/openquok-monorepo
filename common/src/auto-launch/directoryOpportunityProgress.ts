import type { ProfileLaunchDestinationSummaryRow } from './profileLaunchReadiness.js';

/** Variants in the same group count as one opportunity (e.g. Uneed free queue vs paid launch). */
const EXCLUSIVE_OPPORTUNITY_GROUP_BY_PROVIDER_SLUG: Record<string, string> = {
	'uneed-join-line': 'uneed-product-listing',
	'uneed-paid-launch': 'uneed-product-listing',
	'peerpush-standard-launch': 'peerpush-product-listing',
	'peerpush-free-queue': 'peerpush-product-listing'
};

export function directoryExclusiveOpportunityGroupKey(providerSlug: string): string | null {
	return EXCLUSIVE_OPPORTUNITY_GROUP_BY_PROVIDER_SLUG[providerSlug.trim()] ?? null;
}

export type DirectorySiteOpportunityProgress = {
	/** Group-aware completed slots (free vs paid counts once). */
	completedSlots: number;
	/** Required slots to consider the site fully submitted. */
	requiredSlots: number;
	/** Visible launch paths (sub-rows), including both sides of an exclusive pair. */
	visibleOpportunityCount: number;
	/** Label like `1/3` for the site row (completedSlots / visibleOpportunityCount). */
	displayLabel: string;
	isFullyComplete: boolean;
};

function variantCompleted(variant: ProfileLaunchDestinationSummaryRow): boolean {
	return variant.submissionStatus === 'completed';
}

export function getDirectorySiteOpportunityProgress(
	variants: readonly ProfileLaunchDestinationSummaryRow[]
): DirectorySiteOpportunityProgress {
	const visibleOpportunityCount = variants.length;
	const exclusiveGroups = new Map<string, ProfileLaunchDestinationSummaryRow[]>();
	let standaloneCompleted = 0;
	let standaloneRequired = 0;

	for (const variant of variants) {
		const groupKey = directoryExclusiveOpportunityGroupKey(variant.providerSlug);
		if (groupKey) {
			const bucket = exclusiveGroups.get(groupKey) ?? [];
			bucket.push(variant);
			exclusiveGroups.set(groupKey, bucket);
		} else {
			standaloneRequired += 1;
			if (variantCompleted(variant)) standaloneCompleted += 1;
		}
	}

	let exclusiveCompleted = 0;
	const exclusiveRequired = exclusiveGroups.size;
	for (const groupVariants of exclusiveGroups.values()) {
		if (groupVariants.some(variantCompleted)) exclusiveCompleted += 1;
	}

	const completedSlots = exclusiveCompleted + standaloneCompleted;
	const requiredSlots = exclusiveRequired + standaloneRequired;
	const isFullyComplete = requiredSlots > 0 && completedSlots >= requiredSlots;

	return {
		completedSlots,
		requiredSlots,
		visibleOpportunityCount,
		displayLabel: `${completedSlots}/${visibleOpportunityCount}`,
		isFullyComplete
	};
}
