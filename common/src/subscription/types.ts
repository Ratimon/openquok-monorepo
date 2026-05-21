/** All subscription tiers; FREE is implicit when no `organization_subscriptions` row exists. */
export const SUBSCRIPTION_TIERS = ['FREE', 'SOLO', 'CREATOR', 'TEAM', 'ULTIMATE'] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

/** Tiers that may be persisted on an active paid subscription. */
export const PAID_SUBSCRIPTION_TIERS = ['SOLO', 'CREATOR', 'TEAM', 'ULTIMATE'] as const satisfies readonly Exclude<
	SubscriptionTier,
	'FREE'
>[];

export type PaidSubscriptionTier = (typeof PAID_SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_PERIODS = ['MONTHLY', 'YEARLY'] as const;

export type SubscriptionPeriod = (typeof SUBSCRIPTION_PERIODS)[number];

export type AuthorizationAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Plan catalog row — field names match {@link pricing} and API billing DTOs.
 * Amounts are USD; storage is bytes per workspace.
 */
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

/** Capability keys on {@link PlanLimits} (excludes tier id and Stripe amounts). */
export type PlanCapabilityKey = keyof Omit<PlanLimits, 'current' | 'month_price' | 'year_price'>;

/**
 * Feature gates checked against the workspace plan.
 * String values align with {@link PlanCapabilityKey} where enforcement reads plan limits.
 */
export enum SubscriptionSection {
	CHANNEL_PER_WORKSPACE = 'channel_per_workspace',
	POSTS_PER_MONTH = 'posts_per_month',
	TEAM_MEMBERS_PER_WORKSPACE = 'team_members_per_workspace',
	WORKSPACES = 'workspaces',
	MEDIA_STORAGE_BYTES_PER_WORKSPACE = 'media_storage_bytes_per_workspace',
	SHARE_POST_PREVIEW = 'share_post_preview',
	COMMUNITY_FEATURES = 'community_features',
	PUBLIC_API = 'public_api',
	/** Workspace admin/owner role — not a numeric plan field. */
	ADMIN = 'admin',
}

export type SubscriptionPolicy = [AuthorizationAction, SubscriptionSection];
