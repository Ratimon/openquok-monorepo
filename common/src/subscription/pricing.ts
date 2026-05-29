import type { PaidSubscriptionTier, PlanLimits, PricingMap, SubscriptionTier } from './types.js';
import { PAID_SUBSCRIPTION_TIERS } from './types.js';

/** Use 1_000_000 for “unlimited” post scheduling caps in enforcement. */
export const UNLIMITED_POSTS_PER_MONTH = 1_000_000;

/** Use 1_000_000 for “unlimited” team member seats per workspace in enforcement and UI. */
export const UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE = 1_000_000;

export function isUnlimitedTeamMembersPerWorkspace(cap: number): boolean {
	return cap >= UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE;
}

/** Total team member seats on the account (all workspaces). */
export function accountTeamMemberSeatTotal(
	workspaces: number,
	teamMembersPerWorkspace: number
): number {
	if (isUnlimitedTeamMembersPerWorkspace(teamMembersPerWorkspace)) {
		return Number.POSITIVE_INFINITY;
	}
	return teamMembersPerWorkspace * workspaces;
}

const GIB = 1024 ** 3;

export const gbToBytes = (gb: number): number => Math.round(gb * GIB);

/** Default workspace media quota when billing is disabled or tier is unknown. */
export const DEFAULT_MEDIA_STORAGE_QUOTA_BYTES = gbToBytes(5);

/**
 * Plan catalog (amounts in USD). Storage uses binary GiB (5 GiB ≈ 5.37 GB shown in some UIs).
 *
 * Storage notes (per workspace, all members share one pool):
 * - SOLO 5 GiB @ $29: ~$5.8/GiB — fine for one person, image-heavy social use.
 * - TEAM 15 GiB @ $49: ~3 GiB per workspace if split evenly — OK for mixed media.
 * - ULTIMATE 25 GiB @ $69: ~5 GiB per workspace at 5 workspaces — strong for multi-brand use.
 * - MAX 60 GiB @ $129: ~6 GiB per workspace at 10 workspaces — agencies and high-scale agents.
 */
export const pricing: PricingMap = {
	FREE: {
		current: 'FREE',
		month_price: 0,
		year_price: 0,
		workspaces: 0,
		channel_per_workspace: 0,
		posts_per_month: 0,
		team_members_per_workspace: 1,
		media_storage_bytes_per_workspace: 0,
		share_post_preview: false,
		community_features: true,
		public_api: false,
	},
	SOLO: {
		current: 'SOLO',
		month_price: 29,
		year_price: 278,
		workspaces: 1,
		channel_per_workspace: 15,
		posts_per_month: 500,
		team_members_per_workspace: 1,
		media_storage_bytes_per_workspace: gbToBytes(5),
		share_post_preview: false,
		community_features: true,
		public_api: true,
	},
	/** Legacy tier — no longer sold; limits preserved for grandfathered subscriptions. */
	// CREATOR: {
	// 	current: 'CREATOR',
	// 	month_price: 39,
	// 	year_price: 374,
	// 	workspaces: 2,
	// 	channel_per_workspace: 20,
	// 	posts_per_month: UNLIMITED_POSTS_PER_MONTH,
	// 	team_members_per_workspace: 3,
	// 	media_storage_bytes_per_workspace: gbToBytes(5),
	// 	share_post_preview: true,
	// 	community_features: true,
	// 	public_api: true,
	// },
	TEAM: {
		current: 'TEAM',
		month_price: 49,
		year_price: 470,
		workspaces: 3,
		channel_per_workspace: 20, // total of 60 channls
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: 3,
		media_storage_bytes_per_workspace: gbToBytes(5),
		share_post_preview: true,
		community_features: true,
		public_api: true,
	},
	ULTIMATE: {
		current: 'ULTIMATE',
		month_price: 69,
		year_price: 662,
		workspaces: 5,
		channel_per_workspace: 25, // total of 125 channels
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE,
		media_storage_bytes_per_workspace: gbToBytes(5),
		share_post_preview: true,
		community_features: true,
		public_api: true,
	},
	MAX: {
		current: 'MAX',
		month_price: 129,
		year_price: 1238,
		workspaces: 10,
		channel_per_workspace: 30,
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE,
		media_storage_bytes_per_workspace: gbToBytes(6),
		share_post_preview: true,
		community_features: true,
		public_api: true,
	},
};

export function isPaidSubscriptionTier(tier: string): tier is PaidSubscriptionTier {
	return (PAID_SUBSCRIPTION_TIERS as readonly string[]).includes(tier);
}

export function planLimitsForTier(tier: SubscriptionTier): PlanLimits {
	return pricing[tier] ?? pricing.FREE;
}
