import type { BillingPlanProgrammerModel } from '$lib/billing/Billing.repository.svelte';
import { formatPostsPerMonthLimit } from '$lib/billing/Billing.repository.svelte';
import { buildPlanFeatureLinesVm, tierDisplayName } from '$lib/billing/GetPricing.presenter.svelte';
import { formatBytes } from '$lib/medias';
import {
	accountTeamMemberSeatTotal,
	isUnlimitedTeamMembersPerWorkspace,
	PUBLIC_PRICING_COMPARE_ROWS,
	PUBLIC_PRICING_FEATURED_TIER,
	PUBLIC_PRICING_PLAN_META,
	PUBLIC_PRICING_SHARED_CARD_FEATURES,
	PUBLIC_PRICING_TIER_ORDER,
	planLimitsForTier,
	pricing,
	type PaidSubscriptionTier,
	type PlanLimits,
	type SubscriptionPeriod
} from 'openquok-common';

export type PublicPricingCompareCellViewModel =
	| { kind: 'text'; text: string }
	| { kind: 'included' }
	| { kind: 'excluded' };

export type PublicPricingCompareRowViewModel = {
	id: string;
	label: string;
	tooltip?: string;
	cells: Record<PaidSubscriptionTier, PublicPricingCompareCellViewModel>;
};

export type PublicPricingPlanCardViewModel = {
	tier: PaidSubscriptionTier;
	name: string;
	tagline: string;
	monthPrice: number;
	yearPrice: number;
	displayPrice: number;
	periodLabel: string;
	isFeatured: boolean;
	features: string[];
	compareFootnote?: string;
};

export type PublicPricingPageViewModel = {
	plans: PublicPricingPlanCardViewModel[];
	compareRows: PublicPricingCompareRowViewModel[];
	featuredTier: PaidSubscriptionTier;
};

function planLimitsToBillingPm(tier: PaidSubscriptionTier, limits: PlanLimits): BillingPlanProgrammerModel {
	return {
		tier,
		monthPrice: limits.month_price,
		yearPrice: limits.year_price,
		workspaces: limits.workspaces,
		channelPerWorkspace: limits.channel_per_workspace,
		postsPerMonth: limits.posts_per_month,
		teamMembersPerWorkspace: limits.team_members_per_workspace,
		mediaStorageBytesPerWorkspace: limits.media_storage_bytes_per_workspace,
		sharePostPreview: limits.share_post_preview,
		communityFeatures: limits.community_features,
		publicApi: limits.public_api
	};
}

function totalChannels(limits: PlanLimits): number {
	return limits.workspaces * limits.channel_per_workspace;
}

function formatTeamMembersCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	if (isUnlimitedTeamMembersPerWorkspace(limits.team_members_per_workspace)) {
		return { kind: 'text', text: 'Unlimited' };
	}
	const total = accountTeamMemberSeatTotal(limits.workspaces, limits.team_members_per_workspace);
	if (total <= 1) {
		return total === 1 ? { kind: 'text', text: '1' } : { kind: 'excluded' };
	}
	return { kind: 'text', text: String(total) };
}

function compareCellForRow(
	rowId: (typeof PUBLIC_PRICING_COMPARE_ROWS)[number]['id'],
	limits: PlanLimits
): PublicPricingCompareCellViewModel {
	switch (rowId) {
		case 'workspaces':
			return { kind: 'text', text: String(limits.workspaces) };
		case 'channels':
			return { kind: 'text', text: String(totalChannels(limits)) };
		case 'posts_per_month':
			return { kind: 'text', text: formatPostsPerMonthLimit(limits.posts_per_month) };
		case 'team_members':
			return formatTeamMembersCell(limits);
		case 'share_post_preview':
			return limits.share_post_preview ? { kind: 'included' } : { kind: 'excluded' };
		case 'public_api':
			return limits.public_api ? { kind: 'included' } : { kind: 'excluded' };
		case 'cloud_storage': {
			const totalBytes = limits.media_storage_bytes_per_workspace * limits.workspaces;
			return { kind: 'text', text: formatBytes(totalBytes) };
		}
		case 'scheduling':
		case 'integrations':
		case 'community':
			return { kind: 'included' };
		default:
			return { kind: 'excluded' };
	}
}

function buildCardFeatures(tier: PaidSubscriptionTier, limits: PlanLimits): string[] {
	const pm = planLimitsToBillingPm(tier, limits);
	const limitLines = buildPlanFeatureLinesVm(pm).map((line) => line.label);
	const shared = PUBLIC_PRICING_SHARED_CARD_FEATURES.filter((label) => {
		if (label.startsWith('Community') && !limits.community_features) return false;
		return true;
	});
	const seen = new Set<string>();
	const merged: string[] = [];
	for (const label of [...limitLines, ...shared]) {
		const key = label.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(label);
	}
	return merged;
}

export class GetPublicPricingPresenter {
	public buildPageVm(period: SubscriptionPeriod): PublicPricingPageViewModel {
		const plans = PUBLIC_PRICING_TIER_ORDER.map((tier) => {
			const limits = planLimitsForTier(tier);
			const meta = PUBLIC_PRICING_PLAN_META[tier];
			const displayPrice = period === 'YEARLY' ? limits.year_price : limits.month_price;
			const periodLabel = period === 'YEARLY' ? '/ year' : '/ mo';
			return {
				tier,
				name: tierDisplayName(tier),
				tagline: meta.tagline,
				monthPrice: limits.month_price,
				yearPrice: limits.year_price,
				displayPrice,
				periodLabel,
				isFeatured: tier === PUBLIC_PRICING_FEATURED_TIER,
				features: buildCardFeatures(tier, limits),
				compareFootnote: meta.compareFootnote
			} satisfies PublicPricingPlanCardViewModel;
		});

		const compareRows: PublicPricingCompareRowViewModel[] = PUBLIC_PRICING_COMPARE_ROWS.map((row) => {
			const cells = {} as Record<PaidSubscriptionTier, PublicPricingCompareCellViewModel>;
			for (const tier of PUBLIC_PRICING_TIER_ORDER) {
				cells[tier] = compareCellForRow(row.id, planLimitsForTier(tier));
			}
			return {
				id: row.id,
				label: row.label,
				tooltip: row.tooltip,
				cells
			};
		});

		return {
			plans,
			compareRows,
			featuredTier: PUBLIC_PRICING_FEATURED_TIER
		};
	}

	/** Catalog-only PM source for tests and SSR. */
	public listPlanLimitsPm(): Record<PaidSubscriptionTier, PlanLimits> {
		return {
			SOLO: pricing.SOLO,
			CREATOR: pricing.CREATOR,
			TEAM: pricing.TEAM,
			ULTIMATE: pricing.ULTIMATE
		};
	}
}
