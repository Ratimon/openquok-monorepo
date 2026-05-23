import type { BillingPlanViewModel } from '$lib/billing/GetPricing.presenter.svelte';

export const TEAM_MEMBER_DOWNGRADE_MESSAGE =
	'Your team members will be removed from this workspace.';

/** Total team member seats included in the plan (across all workspaces on the account). */
export function totalTeamMemberSeats(plan: BillingPlanViewModel): number {
	return plan.teamMembersPerWorkspace * plan.workspaces;
}

/** True when the target plan allows fewer team seats than the current plan (and current has multi-seat). */
export function wouldRemoveTeamMembers(
	targetPlan: BillingPlanViewModel | null | undefined,
	currentPlan: BillingPlanViewModel | null | undefined
): boolean {
	if (!targetPlan || !currentPlan) return false;
	const currentSeats = totalTeamMemberSeats(currentPlan);
	const targetSeats = totalTeamMemberSeats(targetPlan);
	return currentSeats > 1 && targetSeats < currentSeats;
}

export function teamMemberDowngradeWarning(
	targetPlan: BillingPlanViewModel | null | undefined,
	currentPlan: BillingPlanViewModel | null | undefined
): string | null {
	return wouldRemoveTeamMembers(targetPlan, currentPlan) ? TEAM_MEMBER_DOWNGRADE_MESSAGE : null;
}
