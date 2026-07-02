<script lang="ts">
	import { formatBytes } from '$lib/medias';

	import AccountStatsRadialGrid, {
		type AccountStatsRadialItem
	} from '$lib/ui/components/home/AccountStatsRadialGrid.svelte';

	type Props = {
		planLabel: string;
		billingHref: string;
		ownedWorkspaceCount: number;
		allowedWorkspaceCount: number | null;
		connectedChannelCount: number;
		allowedChannelCount: number | null;
		teamMemberCount: number;
		allowedTeamMemberCount: number | null;
		storageUsedBytes: number;
		storageTotalBytes: number;
	};

	let {
		planLabel,
		billingHref,
		ownedWorkspaceCount,
		allowedWorkspaceCount,
		connectedChannelCount,
		allowedChannelCount,
		teamMemberCount,
		allowedTeamMemberCount,
		storageUsedBytes,
		storageTotalBytes
	}: Props = $props();

	function usagePercent(current: number, allowed: number | null): number {
		if (allowed == null || allowed < 1) return 0;
		return Math.min(Math.round((current / allowed) * 100), 100);
	}

	function countUsageLabel(current: number, allowed: number | null): string {
		if (allowed == null || allowed < 1) return `${current} used`;
		return `${current} of ${allowed} used`;
	}

	const stats = $derived.by((): AccountStatsRadialItem[] => [
		{
			name: 'Workspaces',
			capacity: usagePercent(ownedWorkspaceCount, allowedWorkspaceCount),
			usageLabel: countUsageLabel(ownedWorkspaceCount, allowedWorkspaceCount)
		},
		{
			name: 'Channels',
			capacity: usagePercent(connectedChannelCount, allowedChannelCount),
			usageLabel: countUsageLabel(connectedChannelCount, allowedChannelCount)
		},
		{
			name: 'Team members',
			capacity: usagePercent(teamMemberCount, allowedTeamMemberCount),
			usageLabel: countUsageLabel(teamMemberCount, allowedTeamMemberCount)
		},
		{
			name: 'Storage',
			capacity: usagePercent(storageUsedBytes, storageTotalBytes > 0 ? storageTotalBytes : null),
			usageLabel:
				storageTotalBytes > 0
					? `${formatBytes(storageUsedBytes)} of ${formatBytes(storageTotalBytes)} used`
					: `${formatBytes(storageUsedBytes)} used`
		}
	]);
</script>

<section class="mt-6">
	<h2 class="text-balance text-xl font-medium text-base-content">Plan overview</h2>
	<p class="text-pretty mt-1 text-sm leading-6 text-base-content/65">
		You are currently on the <span class="font-medium text-base-content">{planLabel}</span> plan.
		<a href={billingHref} class="link link-primary font-medium">View other plans</a>.
	</p>

	<AccountStatsRadialGrid class="mt-6" items={stats} />
</section>
