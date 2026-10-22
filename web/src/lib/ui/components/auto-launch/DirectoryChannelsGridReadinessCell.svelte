<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';

	import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as ProductDirectoryChannelTableRowViewModel);

	const badgeClass = $derived(
		rowVm.readiness.isReady ? 'badge-success badge-outline' : 'badge-ghost'
	);
</script>

<div class="flex min-h-7 w-full items-center">
	<span class="badge badge-sm leading-tight {badgeClass}">
		{rowVm.readinessDisplay}
	</span>
</div>
