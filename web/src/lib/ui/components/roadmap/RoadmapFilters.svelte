<script lang="ts">
	import type { RoadmapCategoryId, RoadmapCategoryOptionViewModel } from '$lib/roadmap/roadmap.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Popover from '$lib/ui/popover';

	type Props = {
		categories: readonly RoadmapCategoryOptionViewModel[];
		selectedCategoryIds: RoadmapCategoryId[];
		activeFilterCount: number;
		onCategoryToggle: (categoryId: RoadmapCategoryId) => void;
		onClearFilters: () => void;
	};

	let {
		categories,
		selectedCategoryIds,
		activeFilterCount,
		onCategoryToggle,
		onClearFilters
	}: Props = $props();

	const selectedSet = $derived(new Set(selectedCategoryIds));
</script>

<Popover.Root>
	<Popover.Trigger
		type="button"
		class="btn btn-secondary btn-sm h-9 gap-2 whitespace-nowrap"
		aria-label="Filter roadmap items"
	>
		<AbstractIcon
			name={icons.ListFilterPlus.name}
			class="size-4 shrink-0"
			width="16"
			height="16"
			aria-hidden="true"
		/>
		Filters
		{#if activeFilterCount > 0}
			<span class="badge badge-primary badge-sm tabular-nums">{activeFilterCount}</span>
		{/if}
	</Popover.Trigger>
	<Popover.Content class="w-56 p-3" align="end">
		<div class="space-y-3">
			<div class="flex items-center justify-between gap-2">
				<p class="text-sm font-semibold text-base-content">Categories</p>
				{#if activeFilterCount > 0}
					<button
						type="button"
						class="text-xs font-medium text-primary hover:underline"
						onclick={onClearFilters}
					>
						Clear
					</button>
				{/if}
			</div>
			<ul class="space-y-1">
				{#each categories as category (category.id)}
					<li>
						<label class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-base-200">
							<input
								type="checkbox"
								class="checkbox checkbox-sm checkbox-primary"
								checked={selectedSet.has(category.id)}
								onchange={() => onCategoryToggle(category.id)}
							/>
							<span class="text-sm text-base-content">{category.label}</span>
						</label>
					</li>
				{/each}
			</ul>
		</div>
	</Popover.Content>
</Popover.Root>
