<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';

	import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as ProductDirectoryChannelTableRowViewModel);

	const badgeClass = $derived.by(() => {
		if (rowVm.rowKind === 'site') {
			if (rowVm.siteProgressFullyComplete) return 'badge-success';
			if (rowVm.siteProgressLabel.startsWith('0/')) return 'badge-ghost';
			return 'badge-warning';
		}
		if (rowVm.submissionStatus === 'completed') {
			if (rowVm.syncStatus === 'synced') return 'badge-success badge-outline';
			if (rowVm.syncStatus === 'stale') return 'badge-warning';
			return 'badge-ghost';
		}
		if (rowVm.submissionStatus === 'other') return 'badge-ghost';
		return 'badge-ghost';
	});
</script>

<div class="flex min-h-7 w-full items-center">
	<span class="badge badge-sm leading-tight {badgeClass}">
		{rowVm.rowKind === 'site' ? rowVm.siteProgressLabel : rowVm.submissionDisplay}
	</span>
</div>
