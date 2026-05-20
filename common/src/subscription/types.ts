/** Paid tiers stored on `organization_subscriptions`; FREE is implicit when no row exists. */
export type SubscriptionTier = 'FREE' | 'SOLO' | 'CREATOR' | 'TEAM' | 'ULTIMATE';

/** Tiers that may be persisted on an active paid subscription. */
export type PaidSubscriptionTier = Exclude<SubscriptionTier, 'FREE'>;

export const PAID_SUBSCRIPTION_TIERS: readonly PaidSubscriptionTier[] = [
	'SOLO',
	'CREATOR',
	'TEAM',
	'ULTIMATE',
] as const;

export type SubscriptionPeriod = 'MONTHLY' | 'YEARLY';

export type AuthorizationAction = 'create' | 'read' | 'update' | 'delete';

/** Feature gates checked against the workspace plan (subscription tier limits). */
export enum SubscriptionSection {
	CHANNEL_PER_WORKSPACE = 'channel_per_workspace',
	POSTS_PER_MONTH = 'posts_per_month',
	TEAM_MEMBERS_PER_WORKSPACE = 'team_members_per_workspace',
	WORKSPACES = 'workspaces',
	MEDIA_STORAGE_BYTES_PER_WORKSPACE = 'media_storage_bytes_per_workspace',
	SHARE_POST_PREVIEW = 'share_post_preview',
	WEBHOOKS = 'webhooks',
	AI = 'ai',
	PUBLIC_API = 'public_api',
	ADMIN = 'admin',
}

export type SubscriptionPolicy = [AuthorizationAction, SubscriptionSection];
