<script lang="ts">
	import type { AlternativesDetailFilters, AlternativesHubSort } from '$lib/content/constants/hubs/alternativesHubFilters';

	import { ALTERNATIVES_HUB_SORT_OPTIONS } from '$lib/content/constants/hubs/alternativesHubFilters';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		filtersVm: AlternativesDetailFilters;
		listingCount: number;
		onSortChange: (sort: AlternativesHubSort) => void;
		class?: string;
	};

	let { filtersVm, listingCount, onSortChange, class: className = '' }: Props = $props();
</script>

<div
	class={cn(
		'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-content/10 bg-base-100/80 p-3',
		className
	)}
>
	<p class="text-sm text-base-content/70">
		{listingCount === 1 ? '1 alternative' : `${listingCount} alternatives`}
	</p>
	<div class="flex items-center gap-2">
		<label class="text-sm font-medium text-base-content/80" for="alternatives-detail-sort">Sort</label>
		<select
			id="alternatives-detail-sort"
			class="select select-bordered select-sm min-w-[11rem]"
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
	</div>
</div>
