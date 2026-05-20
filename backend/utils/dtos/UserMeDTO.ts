import type { UserMeWorkspaceRole } from "openquok-common";
import type { PlanLimits } from "openquok-common";
import type { SubscriptionTier } from "openquok-common";
import type { OrganizationSubscriptionRow } from "../../repositories/SubscriptionRepository";
import type { WorkspaceMembershipRole } from "../../repositories/OrganizationRepository";

/** Generous channel cap when billing is disabled (local/dev shell bootstrap). */
export const DEV_SESSION_TOTAL_CHANNELS = 10_000;

export function workspaceRoleToUserMeRole(role: WorkspaceMembershipRole): UserMeWorkspaceRole {
	switch (role) {
		case "superadmin":
			return "SUPERADMIN";
		case "admin":
			return "ADMIN";
		default:
			return "USER";
	}
}

/**
 * Effective channel cap for session UI (connect / enable channel affordances).
 * Uses subscription snapshot when set, otherwise plan `channel_per_workspace`.
 */
export function resolveSessionTotalChannels(
	billingEnabled: boolean,
	tier: SubscriptionTier,
	limits: PlanLimits,
	subscription: OrganizationSubscriptionRow | null
): number {
	if (!billingEnabled) {
		return DEV_SESSION_TOTAL_CHANNELS;
	}
	const planCap = limits.channel_per_workspace;
	const snapshot = subscription?.total_channels ?? 0;
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
		params.workspaceRole === "admin" || params.workspaceRole === "superadmin";
	if (!isWorkspaceAdmin || !params.planAllowsPublicApi) {
		return "";
	}
	return params.apiKey?.trim() ?? "";
}
