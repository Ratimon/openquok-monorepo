import type { PaidSubscriptionTier, SubscriptionTier } from './types.js';
import { PAID_SUBSCRIPTION_TIERS } from './types.js';

/** Use 1_000_000 for “unlimited” post scheduling caps in enforcement. */
export const UNLIMITED_POSTS_PER_MONTH = 1_000_000;

export interface PlanLimits {
	current: SubscriptionTier;
	month_price: number;
	year_price: number;
	/** Workspaces (organizations) allowed on the billing account. */
	workspaces: number;
	/** Connected social accounts (channels) allowed per workspace. */
	channel_per_workspace: number;
	posts_per_month: number;
	/** Team member seats per workspace (workspace membership). */
	team_members_per_workspace: number;
	/** Shareable post preview links. */
	share_post_preview: boolean;
	/** Blog comments, skill listing, and similar community surfaces. */
	community_features: boolean;
	public_api: boolean;
	/** Total media library storage per workspace in bytes. */
	media_storage_bytes_per_workspace: number;
}

export type PricingMap = Record<SubscriptionTier, PlanLimits>;

const GIB = 1024 ** 3;

export const gbToBytes = (gb: number): number => Math.round(gb * GIB);

/** Default workspace media quota when billing is disabled or tier is unknown. */
export const DEFAULT_MEDIA_STORAGE_QUOTA_BYTES = gbToBytes(5);

/**
 * Plan catalog (amounts in USD). Storage uses binary GiB (5 GiB ≈ 5.37 GB shown in some UIs).
 *
 * Storage notes (per workspace, all members share one pool):
 * - SOLO 5 GiB @ $29: ~$5.8/GiB — fine for one person, image-heavy social use.
 * - CREATOR 10 GiB @ $39: step-up for 2 workspaces / more accounts.
 * - TEAM 15 GiB @ $49: ~3 GiB per workspace if split evenly — OK for mixed media;
 *   video-heavy teams may need a higher tier or add-on later.
 * - ULTIMATE 30 GiB @ $99: ~6 GiB per workspace at 5 workspaces — strong for agencies.
 */
export const pricing: PricingMap = {
	FREE: {
		current: 'FREE',
		month_price: 0,
		year_price: 0,
		workspaces: 0,
		channel_per_workspace: 0,
		posts_per_month: 0,
		team_members_per_workspace: 0,
		share_post_preview: false,
		community_features: true,
		public_api: false,
		media_storage_bytes_per_workspace: 0,
	},
	SOLO: {
		current: 'SOLO',
		month_price: 29,
		year_price: 278,
		workspaces: 1,
		channel_per_workspace: 15,
		posts_per_month: 500,
		team_members_per_workspace: 1,
		share_post_preview: false,
		community_features: true,
		public_api: true,
		media_storage_bytes_per_workspace: gbToBytes(5), // total of 5 GiB
	},
	CREATOR: {
		current: 'CREATOR',
		month_price: 39,
		year_price: 374,
		workspaces: 2,
		channel_per_workspace: 20, // total of 40 channels
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: 1, // total of 2 team members 
		share_post_preview: true,
		community_features: true,
		public_api: true,
		media_storage_bytes_per_workspace: gbToBytes(5), // total of 10 GiB
	},
	TEAM: {
		current: 'TEAM',
		month_price: 49,
		year_price: 470,
		workspaces: 3,
		channel_per_workspace: 25, // total of 75 channels
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: 2, // total of 6 team members
		share_post_preview: true,
		community_features: true,
		public_api: true,
		media_storage_bytes_per_workspace: gbToBytes(5), // total of 15 GiB
	},
	ULTIMATE: {
		current: 'ULTIMATE',
		month_price: 99,
		year_price: 950,
		workspaces: 5,
		channel_per_workspace: 40, // total of 200 channels
		posts_per_month: UNLIMITED_POSTS_PER_MONTH,
		team_members_per_workspace: 2,  // total of 10 team members
		share_post_preview: true,
		community_features: true,
		public_api: true,
		media_storage_bytes_per_workspace: gbToBytes(6), // total of 30 GiB
	},
};

export function isPaidSubscriptionTier(tier: string): tier is PaidSubscriptionTier {
	return (PAID_SUBSCRIPTION_TIERS as readonly string[]).includes(tier);
}

export function planLimitsForTier(tier: SubscriptionTier): PlanLimits {
	return pricing[tier] ?? pricing.FREE;
}
