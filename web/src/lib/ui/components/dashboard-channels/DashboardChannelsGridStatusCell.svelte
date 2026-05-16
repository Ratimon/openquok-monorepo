<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { DashboardChannelTableRowViewModel } from '$lib/area-protected/DashboardChannelsGridTable.presenter.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as DashboardChannelTableRowViewModel);

	const badgeClass = $derived.by(() => {
		const ch = rowVm.channel;
		if (ch.disabled) return 'badge-ghost';
		if (ch.refreshNeeded) return 'badge-warning';
		if (ch.inBetweenSteps) return 'badge-info';
		if (!ch.schedulable) return 'badge-ghost';
		return 'badge-success';
	});
</script>

<span class="badge badge-sm {badgeClass}">
	{rowVm.statusDisplay}
</span>
