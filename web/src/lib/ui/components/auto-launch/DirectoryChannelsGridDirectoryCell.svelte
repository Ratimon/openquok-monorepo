<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';

	import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as ProductDirectoryChannelTableRowViewModel);
</script>

{#if rowVm.rowKind === 'site'}
	<div class="flex min-h-7 min-w-0 items-center gap-1.5">
		<span class="font-medium text-base-content">{rowVm.siteLabel}</span>
		<span class="shrink-0 text-xs text-base-content/50">({rowVm.opportunityCount})</span>
	</div>
{:else}
	<div class="flex min-h-7 min-w-0 items-start py-0.5 pl-6">
		<span class="text-sm leading-snug text-base-content/85 break-words">{rowVm.opportunityLabel}</span>
	</div>
{/if}
