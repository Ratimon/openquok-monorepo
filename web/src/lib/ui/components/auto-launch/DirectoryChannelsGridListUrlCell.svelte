<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';

	import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as ProductDirectoryChannelTableRowViewModel);
</script>

<div class="flex min-h-7 w-full items-center">
{#if rowVm.listUrl}
	<a
		href={rowVm.listUrl}
		class="text-xs text-primary underline-offset-2 hover:underline"
		target="_blank"
		rel="noopener noreferrer"
	>
		{rowVm.listUrlDisplay}
	</a>
{:else}
	<span class="text-xs text-base-content/55">{rowVm.listUrlDisplay}</span>
{/if}
</div>
