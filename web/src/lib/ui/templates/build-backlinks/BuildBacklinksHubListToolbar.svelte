<script lang="ts">
	import type {
		BuildBacklinksHubFilters,
		LinkDirectoryCategoryDto,
		LinkDirectoryTagDto
	} from '$lib/link-directory/index';

	import { BUILD_BACKLINKS_SORT_OPTIONS } from '$lib/link-directory/constants/buildBacklinksSortOptions';
	import { buildBuildBacklinksActiveFilterChips } from '$lib/link-directory/utils/buildBuildBacklinksActiveFilters';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		filtersVm: BuildBacklinksHubFilters;
		categoriesVm: LinkDirectoryCategoryDto[];
		tagsVm: LinkDirectoryTagDto[];
		filteredCount: number;
		onSortChange: (sort: BuildBacklinksHubFilters['sort']) => void;
		onClearFilter: (clear: Partial<BuildBacklinksHubFilters>) => void;
		class?: string;
	};

	let {
		filtersVm,
		categoriesVm,
		tagsVm,
		filteredCount,
		onSortChange,
		onClearFilter,
		class: className = ''
	}: Props = $props();

	const activeChips = $derived(
		buildBuildBacklinksActiveFilterChips(filtersVm, categoriesVm, tagsVm)
	);

	const selectedSortOption = $derived(
		BUILD_BACKLINKS_SORT_OPTIONS.find((option) => option.id === filtersVm.sort) ??
			BUILD_BACKLINKS_SORT_OPTIONS[0]
	);
</script>

<div
	class={cn(
		'rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm shadow-primary/5',
		className
	)}
>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0 flex-1 space-y-2">
			<p class="text-sm leading-relaxed text-base-content/75">
				<span class="font-semibold text-base-content">{filteredCount}</span>
				{filteredCount === 1 ? 'site' : 'sites'}
				{#if activeChips.length > 0}
					<span class="text-base-content/55"> where </span>
				{/if}
				{#each activeChips as chip, index (chip.id)}
					{#if index > 0}
						<span class="text-base-content/55"> and </span>
					{/if}
					<span class="font-medium text-base-content">{chip.phrase}</span>
					<button
						type="button"
						class="ms-1 text-xs font-semibold text-error hover:underline"
						onclick={() => onClearFilter(chip.clear)}
					>
						clear ×
					</button>
				{/each}
			</p>
			{#if activeChips.length === 0}
				<p class="text-xs text-base-content/50">
					{#if filtersVm.bookmarkedOnly}
						Showing bookmarked sites only. Change filters in the sidebar.
					{:else}
						Click badges on a site or opportunity to filter the list.
					{/if}
				</p>
			{/if}
		</div>

		<div class="shrink-0">
			<label class="sr-only" for="bb-list-sort">Sort sites</label>
			<select
				id="bb-list-sort"
				class="select select-bordered select-sm min-w-[7.5rem] border-primary/20 bg-base-100/60 text-sm"
				value={filtersVm.sort}
				onchange={(event) => {
					const value = (event.currentTarget as HTMLSelectElement)
						.value as BuildBacklinksHubFilters['sort'];
					onSortChange(value);
				}}
			>
				{#each BUILD_BACKLINKS_SORT_OPTIONS as option (option.id)}
					<option value={option.id}>{option.shortLabel}</option>
				{/each}
			</select>
			<p class="mt-1 text-end text-[10px] text-base-content/45">{selectedSortOption?.label}</p>
		</div>
	</div>
</div>
