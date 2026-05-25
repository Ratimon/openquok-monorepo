import type { PlanLimits, SubscriptionTier } from '../subscription/types.js';

/** Workspace membership role in uppercase (session bootstrap / shell UI). */
export type UserMeWorkspaceRole = 'USER' | 'ADMIN' | 'OWNER';

/**
 * Workspace session fields returned by `GET /users/me?organizationId=…`.
 * Names align with common protected-shell session bootstrap payloads
 * (`orgId`, `tier`, `channelsPerWorkspace`, `role`, `publicApi`, etc.).
 */
export interface UserMeWorkspaceSession {
	orgId: string;
	/** Tier id (e.g. FREE, SOLO). Expand with {@link tierPlan} for limit details. */
	tier: SubscriptionTier;
	/** Plan catalog row for {@link tier}. */
	tierPlan: PlanLimits;
	/** Effective connected-channel cap for the active workspace. */
	channelsPerWorkspace: number;
	role: UserMeWorkspaceRole;
	/** Workspace public API key; empty when not exposed to this member. */
	publicApi: string;
	isLifetime: boolean;
	/** Whether the workspace is in a Stripe trial period. */
	isTrailing: boolean;
	allowTrial: boolean;
	/** Optional streak anchor; null when not tracked. */
	streakSince: string | null;
	billingEnabled: boolean;
}
