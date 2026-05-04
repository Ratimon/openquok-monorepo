<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';

	import Badge from '$lib/ui/badge/Badge.svelte';

	let { row }: ICellProps = $props();

	const vm = $derived(row as unknown as SetGridTableRowViewModel);
	const tagsVm = $derived(vm.tagsDisplayVm);
</script>

{#if !tagsVm.length}
	<span class="text-base-content/55 text-xs">{vm.tagsSummary}</span>
{:else}
	<div class="flex min-w-0 flex-wrap items-center gap-1 py-0.5">
		{#each tagsVm as tagVm (tagVm.name)}
			<Badge
				variant="outline"
				surfaceStyle={`background-color:${tagVm.color};color:#fff`}
				class="text-shadow-tags border-transparent max-w-[14rem] min-w-0"
			>
				{#snippet children()}
					<span class="truncate">{tagVm.name}</span>
				{/snippet}
			</Badge>
		{/each}
	</div>
{/if}
