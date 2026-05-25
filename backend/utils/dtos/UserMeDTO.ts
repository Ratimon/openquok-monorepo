import type { UserMeWorkspaceRole } from "openquok-common";
import type { PlanLimits } from "openquok-common";
import type { SubscriptionTier } from "openquok-common";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import type { WorkspaceMembershipRole } from "../../repositories/OrganizationRepository";

/** Generous per-workspace channel cap when billing is disabled (local/dev shell bootstrap). */
export const DEV_SESSION_CHANNELS_PER_WORKSPACE = 10_000;

export function workspaceRoleToUserMeRole(role: WorkspaceMembershipRole): UserMeWorkspaceRole {
	switch (role) {
		case "owner":
			return "OWNER";
		case "admin":
			return "ADMIN";
		default:
			return "USER";
	}
}

/**
 * Effective per-workspace channel cap for session UI (connect / enable channel affordances).
 * Uses subscription snapshot when set, otherwise plan `channel_per_workspace`.
 */
export function resolveSessionChannelsPerWorkspace(
	billingEnabled: boolean,
	tier: SubscriptionTier,
	limits: PlanLimits,
	subscription: OrganizationSubscriptionRow | null
): number {
	if (!billingEnabled) {
		return DEV_SESSION_CHANNELS_PER_WORKSPACE;
	}
	const planCap = limits.channel_per_workspace;
	const snapshot = subscription?.channels_per_workspace ?? 0;
	if (snapshot > 0) {
		return Math.max(snapshot, planCap);
	}
	return planCap;
}

export function resolveSessionPublicApiKey(params: {
	workspaceRole: WorkspaceMembershipRole;
	planAllowsPublicApi: boolean;
	apiKey: string | null;
}): string {
	const isWorkspaceAdmin =
		params.workspaceRole === "admin" || params.workspaceRole === "owner";
	if (!isWorkspaceAdmin || !params.planAllowsPublicApi) {
		return "";
	}
	return params.apiKey?.trim() ?? "";
}
