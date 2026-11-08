<script lang="ts">
	import type {
		AlternativesHubCategory,
		AlternativesHubFilters,
		AlternativesHubSort
	} from '$lib/content/constants/hubs/alternativesHubFilters';

	import {
		ALTERNATIVES_HUB_CATEGORY_OPTIONS,
		ALTERNATIVES_HUB_SORT_OPTIONS
	} from '$lib/content/constants/hubs/alternativesHubFilters';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		filtersVm: AlternativesHubFilters;
		onCategoryChange: (category: AlternativesHubCategory) => void;
		onSortChange: (sort: AlternativesHubSort) => void;
		showCategoryFilter?: boolean;
		class?: string;
	};

	let {
		filtersVm,
		onCategoryChange,
		onSortChange,
		showCategoryFilter = true,
		class: className = ''
	}: Props = $props();

	const selectedSortOption = $derived(
		ALTERNATIVES_HUB_SORT_OPTIONS.find((option) => option.id === filtersVm.sort) ??
			ALTERNATIVES_HUB_SORT_OPTIONS[2]
	);
</script>

<div
	class={cn(
		'rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm shadow-primary/5',
		className
	)}
>
	<div class="flex flex-wrap items-end justify-between gap-3">
		{#if showCategoryFilter}
			<div class="flex min-w-0 flex-wrap items-end gap-3">
				<div class="min-w-[9rem] shrink-0">
					<label
						class="text-xs font-semibold uppercase tracking-wide text-primary/90"
						for="alternatives-hub-category"
					>
						Category
					</label>
					<select
						id="alternatives-hub-category"
						class="select select-bordered select-sm mt-1.5 w-full min-w-[9rem] border-primary/20 bg-base-100/60 text-sm"
						value={filtersVm.category}
						onchange={(event) => {
							const value = (event.currentTarget as HTMLSelectElement)
								.value as AlternativesHubCategory;
							onCategoryChange(value);
						}}
					>
						{#each ALTERNATIVES_HUB_CATEGORY_OPTIONS as option (option.id)}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<div class="shrink-0">
			<label class="sr-only" for="alternatives-hub-sort">Sort alternatives</label>
			<select
				id="alternatives-hub-sort"
				class="select select-bordered select-sm min-w-[7.5rem] border-primary/20 bg-base-100/60 text-sm"
				value={filtersVm.sort}
				onchange={(event) => {
					const value = (event.currentTarget as HTMLSelectElement).value as AlternativesHubSort;
					onSortChange(value);
				}}
			>
				{#each ALTERNATIVES_HUB_SORT_OPTIONS as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-end text-[10px] text-base-content/45">{selectedSortOption?.label}</p>
		</div>
	</div>
</div>
