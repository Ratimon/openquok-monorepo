import type { PaidSubscriptionTier, PlanLimits, SubscriptionPeriod } from 'openquok-common';
import type { BillingPlanProgrammerModel } from '$lib/billing/Billing.repository.svelte';

import { formatPostsPerMonthLimit } from '$lib/billing/Billing.repository.svelte';
import {
	buildPlanFeatureLinesVm,
	formatTeamMembersPerWorkspaceDisplay,
	teamMembersPerWorkspaceLabel,
	tierDisplayName
} from '$lib/billing/GetBilling.presenter.svelte';
import { formatBytes } from '$lib/medias';
import {
	PUBLIC_PRICING_AI_CARD_FEATURES,
	PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS,
	PUBLIC_PRICING_COMPARE_ROWS,
	PUBLIC_PRICING_FEATURED_TIER,
	PUBLIC_PRICING_PLAN_META,
	PUBLIC_PRICING_TIER_ORDER,
	type PublicPricingCompareRowDefinition
} from '$lib/billing/constants/publicPricingCatalog';
import {
	filterCompareRowsByProductLine,
	publicPricingCardFeatureLabels,
	type PublicPricingProductLine
} from '$lib/billing/constants/publicPricingProductLines';
import type { PublicPricingLandingPlanOverrides } from '$lib/billing/constants/publicPricingLandingSectionConfig';
import {
	accountTeamMemberSeatTotal,
	isUnlimitedTeamMembersPerWorkspace,
	planLimitsForTier,
	pricing,
	UNLIMITED_POSTS_PER_MONTH,
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
	/** Landing tab detail card headline; falls back to catalog meta when unset. */
	tabHeadline?: string;
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
	return Math.max(0, limits.workspaces) * Math.max(0, limits.channel_per_workspace);
}

function formatChannelsCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	const perWorkspace = limits.channel_per_workspace;
	const total = totalChannels(limits);
	if (limits.workspaces <= 1) return { kind: 'text', text: String(total) };
	return { kind: 'text', text: `${total} (${perWorkspace}/ workspace)` };
}

function formatCloudStorageCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	const perWorkspaceBytes = limits.media_storage_bytes_per_workspace;
	const totalBytes = perWorkspaceBytes * limits.workspaces;
	const totalLabel = formatBytes(totalBytes);
	if (limits.workspaces <= 1) return { kind: 'text', text: totalLabel };
	return {
		kind: 'text',
		text: `${totalLabel} (${formatBytes(perWorkspaceBytes)}/ workspace)`
	};
}

function formatPerWorkspaceOAuthResourceCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	if (!limits.public_api) return { kind: 'excluded' };
	const count = limits.workspaces;
	if (count <= 1) return { kind: 'text', text: '1' };
	return { kind: 'text', text: `${count} (1/ workspace)` };
}

function formatTeamMembersCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	if (isUnlimitedTeamMembersPerWorkspace(limits.team_members_per_workspace)) {
		return { kind: 'text', text: 'Unlimited' };
	}
	const perWorkspace = limits.team_members_per_workspace;
	const total = accountTeamMemberSeatTotal(limits.workspaces, perWorkspace);
	if (total <= 1) {
		return total === 1 ? { kind: 'text', text: '1' } : { kind: 'excluded' };
	}
	if (limits.workspaces <= 1) return { kind: 'text', text: String(total) };
	const perWorkspaceLabel = formatTeamMembersPerWorkspaceDisplay(perWorkspace, { includeYou: false });
	return { kind: 'text', text: `${total} (${perWorkspaceLabel}/ workspace)` };
}

function formatDirectoryCompetitorDomainsCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	if (!limits.directory_seo_enabled || limits.directory_seo_competitors_per_workspace <= 0) {
		return { kind: 'excluded' };
	}
	const perWorkspace = limits.directory_seo_competitors_per_workspace;
	const total = perWorkspace * limits.workspaces;
	if (limits.workspaces <= 1) return { kind: 'text', text: String(perWorkspace) };
	return { kind: 'text', text: `${total} (${perWorkspace}/ workspace)` };
}

function directoryLaunchFeatureCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	return limits.directory_launch_enabled ? { kind: 'included' } : { kind: 'excluded' };
}

function directorySeoFeatureCell(limits: PlanLimits): PublicPricingCompareCellViewModel {
	return limits.directory_seo_enabled ? { kind: 'included' } : { kind: 'excluded' };
}

function compareCellForRow(
	rowId: (typeof PUBLIC_PRICING_COMPARE_ROWS)[number]['id'],
	limits: PlanLimits
): PublicPricingCompareCellViewModel {
	switch (rowId) {
		case 'workspaces':
			return { kind: 'text', text: String(limits.workspaces) };
		case 'channels':
			return formatChannelsCell(limits);
		case 'posts_per_month':
			return { kind: 'text', text: formatPostsPerMonthLimit(limits.posts_per_month) };
		case 'team_members':
			return formatTeamMembersCell(limits);
		case 'share_post_preview':
			return limits.share_post_preview ? { kind: 'included' } : { kind: 'excluded' };
		case 'official_api':
			return { kind: 'included' };
		case 'public_api':
			return limits.public_api ? { kind: 'included' } : { kind: 'excluded' };
		case 'oauth_apps':
		case 'mcp_server':
			return formatPerWorkspaceOAuthResourceCell(limits);
		case 'cloud_storage':
			return formatCloudStorageCell(limits);
		case 'ai_writer':
		case 'ai_summarizer':
			return { kind: 'text', text: 'Unlimited' };
		case 'multi_channel_publishing':
		case 'agent_integrations':
		case 'analytics':
		case 'photo_editor':
		case 'skill_builder':
		case 'calendar_views':
		case 'kanban_views':
		case 'file_manager':
		case 'repeated_posts':
		case 'reusable_templates':
		case 'reusable_signatures':
		case 'smart_filter':
		case 'post_delays':
		case 'post_comments':
		case 'cross_posting':
		case 'internal_plugs':
		case 'cross_account_plugs':
		case 'global_plugs':
		case 'group_management':
		case 'dark_light_mode':
		case 'community':
			return { kind: 'included' };
		case 'directory_business_profiles':
		case 'directory_extension_autofill':
		case 'directory_submission_tracking':
		case 'directory_profile_variants':
			return directoryLaunchFeatureCell(limits);
		case 'directory_analytics':
		case 'directory_catalog_dr':
			return directorySeoFeatureCell(limits);
		case 'directory_competitor_domains':
			return formatDirectoryCompetitorDomainsCell(limits);
		default:
			return { kind: 'excluded' };
	}
}

function isSocialPlanLimitLabel(label: string): boolean {
	const lower = label.toLowerCase();
	return (
		/channel/.test(lower) ||
		/posts per month/.test(lower) ||
		/shareable post preview/.test(lower) ||
		/public api/.test(lower) ||
		/oauth/.test(lower) ||
		/mcp server/.test(lower) ||
		/mcp servers/.test(lower) ||
		/ apps$/.test(lower)
	);
}

function isSharedPlanLimitLabel(label: string): boolean {
	const lower = label.toLowerCase();
	return (
		/agent workspace/.test(lower) ||
		/team member/.test(lower) ||
		/cloud storage/.test(lower)
	);
}

function shouldIncludePlanLimitLabel(label: string, productLine: PublicPricingProductLine): boolean {
	if (productLine === 'all') return true;
	if (isSharedPlanLimitLabel(label)) return true;
	if (productLine === 'social') return isSocialPlanLimitLabel(label);
	return false;
}

function directoryPlanLimitLabels(limits: PlanLimits): string[] {
	if (!limits.directory_seo_enabled || limits.directory_seo_competitors_per_workspace <= 0) {
		return [];
	}
	const perWorkspace = limits.directory_seo_competitors_per_workspace;
	if (limits.workspaces <= 1) {
		return [`${perWorkspace} competitor domains`];
	}
	const total = perWorkspace * limits.workspaces;
	return [`${total} competitor domains (${perWorkspace}/ Agent workspace)`];
}

function buildCardFeatures(
	tier: PaidSubscriptionTier,
	limits: PlanLimits,
	productLine: PublicPricingProductLine = 'all'
): string[] {
	const pm = planLimitsToBillingPm(tier, limits);
	const limitLines = buildPlanFeatureLinesVm(pm)
		.filter((line) => shouldIncludePlanLimitLabel(line.label, productLine))
		.map((line) => {
			// Channels are capped per workspace; cards should match compare-table formatting.
			if (limits.workspaces > 1 && /^Total \d+ channels$/.test(line.label)) {
				const perWorkspace = limits.channel_per_workspace;
				const total = totalChannels(limits);
				return `${total} channels (${perWorkspace}/ Agent workspace)`;
			}

			// Cloud storage is capped per workspace; show total plus per-workspace allocation.
			if (limits.workspaces > 1 && /^Total .* cloud storage$/.test(line.label)) {
				const perWorkspaceBytes = limits.media_storage_bytes_per_workspace;
				const totalBytes = perWorkspaceBytes * limits.workspaces;
				return `${formatBytes(totalBytes)} cloud storage (${formatBytes(perWorkspaceBytes)}/ Agent workspace)`;
			}

			if (
				limits.workspaces > 1 &&
				!isUnlimitedTeamMembersPerWorkspace(limits.team_members_per_workspace) &&
				line.label === teamMembersPerWorkspaceLabel(limits.team_members_per_workspace)
			) {
				const total = accountTeamMemberSeatTotal(
					limits.workspaces,
					limits.team_members_per_workspace
				);
				return `${line.label} (total of ${total})`;
			}
			return line.label;
		});

	const directoryLimits = productLine === 'directory' ? directoryPlanLimitLabels(limits) : [];
	const workspaceIdx = limitLines.findIndex((label) => /agent workspace/i.test(label));
	const withDirectoryLimits =
		directoryLimits.length === 0
			? limitLines
			: workspaceIdx >= 0
				? [
						...limitLines.slice(0, workspaceIdx + 1),
						...directoryLimits,
						...limitLines.slice(workspaceIdx + 1)
					]
				: [...directoryLimits, ...limitLines];

	// Keep on-device AI bullets directly under the team-members line (or posts when seats are omitted).
	const teamMembersIdx = withDirectoryLimits.findIndex((label) => /team members/i.test(label));
	const postsIdx = withDirectoryLimits.findIndex((label) => /posts per month/i.test(label));
	const insertAt =
		teamMembersIdx >= 0 ? teamMembersIdx + 1 : postsIdx >= 0 ? postsIdx + 1 : withDirectoryLimits.length;
	const aiBullets = productLine === 'directory' ? [] : PUBLIC_PRICING_AI_CARD_FEATURES;
	const withAi = [
		...withDirectoryLimits.slice(0, insertAt),
		...aiBullets,
		...withDirectoryLimits.slice(insertAt)
	];

	const marketingFeatures = publicPricingCardFeatureLabels(
		PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS,
		productLine
	).filter(
		(label) => {
			if (label.startsWith('Community') && !limits.community_features) return false;
			return true;
		}
	);
	const seen = new Set<string>();
	const merged: string[] = [];
	for (const label of [...withAi, ...marketingFeatures]) {
		const key = label.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(label);
	}
	return merged;
}

function buildCompareFootnote(tier: PaidSubscriptionTier, limits: PlanLimits): string | undefined {
	const unlimitedPosts = limits.posts_per_month >= UNLIMITED_POSTS_PER_MONTH;
	const unlimitedTeam = isUnlimitedTeamMembersPerWorkspace(limits.team_members_per_workspace);

	if (tier === 'MAX') {
		return `${limits.workspaces} Agent workspaces included`;
	}

	if (unlimitedPosts && unlimitedTeam) {
		return `${formatPostsPerMonthLimit(limits.posts_per_month)} posts & Unlimited team members`;
	}

	if (limits.workspaces === 1 && limits.team_members_per_workspace <= 1) {
		return 'Single Agent workspace';
	}

	if (!unlimitedTeam && limits.team_members_per_workspace > 1) {
		return teamMembersPerWorkspaceLabel(limits.team_members_per_workspace);
	}

	return undefined;
}

const PUBLIC_PRICING_COMPARE_ROW_CATALOG_ORDER = new Map(
	PUBLIC_PRICING_COMPARE_ROWS.map((row, index) => [row.id, index])
);

type CompareRowCardFeatureMatcher = (feature: string) => boolean;

const COMPARE_ROW_CARD_FEATURE_MATCHERS: Partial<
	Record<PublicPricingCompareRowDefinition['id'], CompareRowCardFeatureMatcher>
> = {
	workspaces: (feature) => /agent workspace/i.test(feature),
	directory_competitor_domains: (feature) => /competitor domains/i.test(feature),
	team_members: (feature) => /team member/i.test(feature),
	channels: (feature) => /\bchannel/i.test(feature) && !/multi-channel/i.test(feature),
	posts_per_month: (feature) => /posts per month/i.test(feature),
	cloud_storage: (feature) => /cloud storage/i.test(feature),
	share_post_preview: (feature) => /shareable post preview/i.test(feature),
	public_api: (feature) => /public api/i.test(feature),
	oauth_apps: (feature) => /oauth/i.test(feature),
	mcp_server: (feature) => /mcp server/i.test(feature),
	ai_writer: (feature) => /ai writer/i.test(feature),
	ai_summarizer: (feature) => /ai summarizer/i.test(feature),
	agent_integrations: (feature) => /^agent integrations$/i.test(feature.trim()),
	directory_business_profiles: (feature) => /business profiles/i.test(feature),
	directory_extension_autofill: (feature) => /browser extension autofill/i.test(feature),
	directory_submission_tracking: (feature) => /directory submission tracking/i.test(feature),
	directory_analytics: (feature) => /domain rating analytics/i.test(feature),
	directory_profile_variants: (feature) => /profile variants/i.test(feature),
	community: (feature) => /^community features$/i.test(feature.trim()),
	dark_light_mode: (feature) => /^dark \/ light mode$/i.test(feature.trim())
};

function compareRowCardFeatureIndex(
	row: PublicPricingCompareRowDefinition,
	cardFeatures: readonly string[]
): number {
	const matcher = COMPARE_ROW_CARD_FEATURE_MATCHERS[row.id];
	if (matcher) {
		const index = cardFeatures.findIndex(matcher);
		if (index >= 0) return index;
	}

	const labelLower = row.label.toLowerCase();
	const labelIndex = cardFeatures.findIndex((feature) => {
		const featureLower = feature.toLowerCase();
		return featureLower === labelLower || featureLower.includes(labelLower);
	});
	if (labelIndex >= 0) return labelIndex;

	return Number.POSITIVE_INFINITY;
}

function sortCompareRowsByCardFeatures(
	rows: readonly PublicPricingCompareRowDefinition[],
	cardFeatures: readonly string[]
): PublicPricingCompareRowDefinition[] {
	return [...rows].sort((rowA, rowB) => {
		const indexA = compareRowCardFeatureIndex(rowA, cardFeatures);
		const indexB = compareRowCardFeatureIndex(rowB, cardFeatures);
		if (indexA !== indexB) return indexA - indexB;

		const catalogA = PUBLIC_PRICING_COMPARE_ROW_CATALOG_ORDER.get(rowA.id) ?? 0;
		const catalogB = PUBLIC_PRICING_COMPARE_ROW_CATALOG_ORDER.get(rowB.id) ?? 0;
		return catalogA - catalogB;
	});
}

export class GetPublicPricingPresenter {
	public buildPageVm(
		period: SubscriptionPeriod,
		productLine: PublicPricingProductLine = 'all'
	): PublicPricingPageViewModel {
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
				features: buildCardFeatures(tier, limits, productLine),
				compareFootnote: buildCompareFootnote(tier, limits)
			} satisfies PublicPricingPlanCardViewModel;
		});

		const visibleCompareRows = filterCompareRowsByProductLine(PUBLIC_PRICING_COMPARE_ROWS, productLine);
		const referenceCardFeatures = buildCardFeatures(
			PUBLIC_PRICING_FEATURED_TIER,
			planLimitsForTier(PUBLIC_PRICING_FEATURED_TIER),
			productLine
		);
		const orderedCompareRows = sortCompareRowsByCardFeatures(
			visibleCompareRows,
			referenceCardFeatures
		);
		const compareRows: PublicPricingCompareRowViewModel[] = orderedCompareRows.map((row) => {
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

	public buildLandingTabPlans(
		period: SubscriptionPeriod,
		options?: {
			planMetaOverrides?: PublicPricingLandingPlanOverrides;
			productLine?: PublicPricingProductLine;
		}
	): PublicPricingPlanCardViewModel[] {
		const productLine = options?.productLine ?? 'all';
		const plans = this.buildPageVm(period, productLine).plans;
		const overrides = options?.planMetaOverrides;
		if (!overrides) {
			return plans;
		}

		return plans.map((plan) => {
			const tabHeadline = overrides[plan.tier]?.tabHeadline;
			if (!tabHeadline) {
				return plan;
			}
			return { ...plan, tabHeadline };
		});
	}

	/** Catalog-only PM source for tests and SSR. */
	public listPlanLimitsPm(): Record<PaidSubscriptionTier, PlanLimits> {
		return {
			SOLO: pricing.SOLO,
			TEAM: pricing.TEAM,
			ULTIMATE: pricing.ULTIMATE,
			MAX: pricing.MAX
		};
	}
}
