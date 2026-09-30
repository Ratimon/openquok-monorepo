import type {
	ComparePricingPlan,
	ComparePricingUnit,
	CompareProductSlug
} from '$lib/content/constants/competitors/types';
import { planLimitsForTier } from 'openquok-common';

/** Connected social accounts included on OpenQuok Solo (baseline for compare pricing). */
export function getOpenQuokSoloCompareChannelCount(): number {
	const solo = planLimitsForTier('SOLO');
	return Math.max(0, solo.workspaces) * Math.max(0, solo.channel_per_workspace);
}

export function resolveComparePricingDefaultChannelCount(
	productASlug: CompareProductSlug,
	productBSlug: CompareProductSlug,
	leftPricingUnit: ComparePricingUnit,
	rightPricingUnit: ComparePricingUnit
): number {
	if (
		productASlug === 'openquok' ||
		productBSlug === 'openquok' ||
		leftPricingUnit === 'per_channel' ||
		rightPricingUnit === 'per_channel'
	) {
		return getOpenQuokSoloCompareChannelCount();
	}
	return 1;
}

export function comparePricingNeedsChannelContext(
	leftPricingUnit: ComparePricingUnit,
	rightPricingUnit: ComparePricingUnit
): boolean {
	return leftPricingUnit === 'per_channel' || rightPricingUnit === 'per_channel';
}

function formatUsd(amount: number): string {
	return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Scale per-channel list prices to a total monthly estimate for `channelCount` accounts. */
export function scaleComparePlansToChannelTotal(
	plans: ComparePricingPlan[],
	unit: ComparePricingUnit,
	channelCount: number
): ComparePricingPlan[] {
	if (unit !== 'per_channel' || channelCount < 1) {
		return plans.map((plan) => ({ ...plan }));
	}

	return plans.map((plan) => {
		if (plan.monthlyPrice == null) {
			return { ...plan };
		}
		if (plan.monthlyPrice === 0) {
			return {
				...plan,
				footnote: plan.footnote ?? 'Free tier · see plan limits on the vendor site'
			};
		}

		const perChannel = plan.monthlyPrice;
		const total = perChannel * channelCount;
		const scaledFootnote = `${channelCount} channels × $${formatUsd(perChannel)}/channel / mo · list rate; volume tiers may reduce total`;

		return {
			...plan,
			monthlyPrice: total,
			footnote: scaledFootnote
		};
	});
}

/** Express flat workspace pricing as an approximate per-channel monthly rate. */
export function expressFlatComparePlansPerChannel(
	plans: ComparePricingPlan[],
	unit: ComparePricingUnit,
	channelCount: number
): ComparePricingPlan[] {
	if (unit !== 'flat' || channelCount < 1) {
		return plans.map((plan) => ({ ...plan }));
	}

	return plans.map((plan) => {
		if (plan.monthlyPrice == null) {
			return { ...plan };
		}
		const perChannel = Math.round((plan.monthlyPrice / channelCount) * 100) / 100;
		return {
			...plan,
			monthlyPrice: perChannel,
			footnote: plan.footnote
				? `${plan.footnote} · ~$${formatUsd(perChannel)}/channel at ${channelCount} channels`
				: `~$${formatUsd(perChannel)}/channel when you use ${channelCount} channels in one workspace`
		};
	});
}
