import type { BillingPlanDto } from '$lib/billing';
import { formatPostsPerMonthLimit } from '$lib/billing';
import { formatBytes } from '$lib/medias';

export type PlanFeatureLine = {
	label: string;
	tooltip?: string;
};

function perWorkspaceLabel(count: number, singular: string, plural: string): string {
	return count === 1 ? `1 ${singular} per workspace` : `${count} ${plural} per workspace`;
}

/** Marketing-facing feature bullets for a plan card (aligned with catalog fields). */
export function buildPlanFeatureLines(plan: BillingPlanDto): PlanFeatureLine[] {
	const lines: PlanFeatureLine[] = [];
	if (plan.workspaces > 1) {
		lines.push({ label: `${plan.workspaces} workspaces` });
	}

	const channelTotal = plan.channelPerWorkspace * plan.workspaces;
	lines.push({
		label: channelTotal === 1 ? '1 channel' : `${channelTotal} channels`,
		tooltip:
			plan.workspaces > 1
				? perWorkspaceLabel(plan.channelPerWorkspace, 'channel', 'channels')
				: undefined
	});

	lines.push({ label: `${formatPostsPerMonthLimit(plan.postsPerMonth)} posts per month` });

	const teamTotal = plan.teamMembersPerWorkspace * plan.workspaces;
	if (teamTotal > 1) {
		lines.push({
			label: `total of ${teamTotal} team members`,
			tooltip: perWorkspaceLabel(plan.teamMembersPerWorkspace, 'member', 'members')
		});
	}

	if (plan.sharePostPreview) {
		lines.push({ label: 'Shareable post preview links' });
	}

	if (plan.publicApi) {
		lines.push({ label: 'Public API access' });
	}

	const storageTotalBytes = plan.mediaStorageBytesPerWorkspace * plan.workspaces;
	lines.push({
		label: `${formatBytes(plan.mediaStorageBytesPerWorkspace)} cloud storage per workspace`,
		tooltip:
			plan.workspaces > 1 ? `total of ${formatBytes(storageTotalBytes)}` : undefined
	});

	return lines;
}

export function tierDisplayName(tier: string): string {
	if (tier === 'SOLO') return 'Solo';
	if (tier === 'CREATOR') return 'Creator';
	if (tier === 'TEAM') return 'Team';
	if (tier === 'ULTIMATE') return 'Ultimate Pro';
	return tier;
}
