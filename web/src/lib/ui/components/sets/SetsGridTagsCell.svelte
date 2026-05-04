<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';

	import Badge from '$lib/ui/badge/Badge.svelte';

	let { row }: ICellProps = $props();

	const vm = $derived(row as unknown as SetGridTableRowViewModel);
	const tags = $derived(vm.tagsDisplay);
</script>

{#if !tags.length}
	<span class="text-base-content/55 text-xs">{vm.tagsSummary}</span>
{:else}
	<div class="flex min-w-0 flex-wrap items-center gap-1 py-0.5">
		{#each tags as t (t.name)}
			<Badge
				variant="outline"
				surfaceStyle={`background-color:${t.color};color:#fff`}
				class="text-shadow-tags border-transparent max-w-[14rem] min-w-0"
			>
				{#snippet children()}
					<span class="truncate">{t.name}</span>
				{/snippet}
			</Badge>
		{/each}
	</div>
{/if}
