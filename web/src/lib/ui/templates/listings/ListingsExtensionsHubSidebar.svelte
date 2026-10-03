<script lang="ts">
	import type {
		ExtensionCategoryViewModel,
		ExtensionSort,
		ExtensionTypeFilter,
		ExtensionsTagFilterViewModel
	} from '$lib/listings/index';

	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import ListingsCategorySidebar from '$lib/ui/templates/listings/ListingsCategorySidebar.svelte';
	import ListingsSearchBar from '$lib/ui/templates/listings/ListingsSearchBar.svelte';
	import ListingsTagFilter from '$lib/ui/templates/listings/ListingsTagFilter.svelte';
	import ListingsTypeChips from '$lib/ui/templates/listings/ListingsTypeChips.svelte';

	type HubKind = 'building-blocks' | 'playbooks';

	type Props = {
		hubKind: HubKind;
		categoriesVm: ExtensionCategoryViewModel[];
		tagFilterVm: ExtensionsTagFilterViewModel;
		searchValue?: string;
		sort: ExtensionSort;
		activeCategorySlug: string | null;
		activeTagPathSlug: string | null;
		activeTagGroup: string | null;
		activeTags: string[];
		categorySidebarLinkMode?: boolean;
		onCategorySelect?: (slug: string | null) => void;
		onSearchChange: (value: string) => void;
		onSortChange: (sort: ExtensionSort) => void;
		onTagGroupSelect: (groupSlug: string | null) => void;
		onTagToggle: (tagSlug: string) => void;
		onTagClear: () => void;
		activeExtensionType?: ExtensionTypeFilter;
		onTypeSelect?: (type: ExtensionTypeFilter) => void;
		bookmarkedOnly?: boolean;
		bookmarkCount?: number;
		onBookmarkedOnlyChange?: (next: boolean) => void;
		class?: string;
	};

	let {
		hubKind,
		categoriesVm,
		tagFilterVm,
		searchValue = $bindable(''),
		sort,
		activeCategorySlug,
		activeTagPathSlug,
		activeTagGroup,
		activeTags,
		categorySidebarLinkMode = true,
		onCategorySelect,
		onSearchChange,
		onSortChange,
		onTagGroupSelect,
		onTagToggle,
		onTagClear,
		activeExtensionType,
		onTypeSelect,
		bookmarkedOnly = false,
		bookmarkCount = 0,
		onBookmarkedOnlyChange,
		class: className = ''
	}: Props = $props();

	const sortOptions: { id: ExtensionSort; label: string }[] = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'popular', label: 'Most liked' },
		{ id: 'views', label: 'Most viewed' }
	];

	const panelShell =
		'rounded-xl border border-primary/25 bg-primary/5 p-3.5 shadow-sm shadow-primary/5';
	const sectionDivider = 'border-t border-primary/20 pt-5';
	const sectionTitle = 'text-xs font-semibold uppercase tracking-wide text-primary/90';

	const searchPlaceholder = $derived(
		hubKind === 'playbooks' ? 'Search playbooks…' : 'Search building blocks…'
	);
	const ariaLabel = $derived(
		hubKind === 'playbooks' ? 'Filter playbooks' : 'Filter building blocks'
	);
</script>

<aside class={cn(className)} aria-label={ariaLabel}>
	<div class={cn(panelShell, 'space-y-5')}>
		<ListingsSearchBar
			class="[&_input]:border-primary/20 [&_input]:bg-base-100/50"
			bind:value={searchValue}
			placeholder={searchPlaceholder}
			onchange={onSearchChange}
		/>

		<div class={sectionDivider}>
			<label class={sectionTitle} for="listings-hub-sort">Sort</label>
			<select
				id="listings-hub-sort"
				class="select select-bordered select-sm mt-2 w-full border-primary/20 bg-base-100/60 text-sm"
				value={sort}
				onchange={(event) => {
					const value = (event.currentTarget as HTMLSelectElement).value as ExtensionSort;
					onSortChange(value);
				}}
			>
				{#each sortOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</div>

		{#if onBookmarkedOnlyChange}
			<div class={sectionDivider}>
				<h3 class={sectionTitle}>Saved</h3>
				<div
					class={cn(
						'mt-2 flex w-full overflow-hidden rounded-lg border',
						bookmarkedOnly
							? 'border-warning bg-warning text-warning-content shadow-sm'
							: 'border-warning/45 bg-warning/15'
					)}
				>
					<button
						type="button"
						class={cn(
							'btn btn-sm inline-flex min-w-0 flex-1 gap-1.5 rounded-none border-0 shadow-none',
							bookmarkedOnly
								? 'btn-warning text-warning-content hover:bg-warning'
								: 'bg-transparent text-warning-content hover:bg-warning/25'
						)}
						aria-pressed={bookmarkedOnly}
						onclick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}
					>
						<AbstractIcon
							name={icons.Bookmark.name}
							class={cn('size-3.5', bookmarkedOnly && 'fill-current')}
							width="14"
							height="14"
						/>
						Bookmarked
						{#if bookmarkCount > 0}
							<span class="ms-auto tabular-nums opacity-80">{bookmarkCount.toLocaleString()}</span>
						{/if}
					</button>
					{#if bookmarkedOnly}
						<button
							type="button"
							class="btn btn-sm shrink-0 rounded-none border-0 border-s border-warning/40 bg-transparent px-2.5 text-error shadow-none hover:bg-error/15"
							aria-label="Clear bookmarked filter"
							onclick={() => onBookmarkedOnlyChange(false)}
						>
							<AbstractIcon name={icons.X2.name} class="size-3.5" width="14" height="14" />
						</button>
					{/if}
				</div>
			</div>
		{/if}

		{#if hubKind === 'building-blocks' && activeExtensionType != null && onTypeSelect}
			<div class={sectionDivider}>
				<ListingsTypeChips activeType={activeExtensionType} onSelect={onTypeSelect} />
			</div>
		{/if}

		<div class={sectionDivider}>
			<h3 class={sectionTitle}>Categories</h3>
			<div class="mt-2">
				<ListingsCategorySidebar
					{categoriesVm}
					{activeCategorySlug}
					{activeTagPathSlug}
					linkMode={categorySidebarLinkMode}
					{hubKind}
					onSelect={onCategorySelect}
				/>
			</div>
		</div>

		<div class={sectionDivider}>
			<ListingsTagFilter
				{tagFilterVm}
				activeTagGroup={activeTagGroup}
				{activeTags}
				onGroupSelect={onTagGroupSelect}
				onTagToggle={onTagToggle}
				onClear={onTagClear}
			/>
		</div>
	</div>
</aside>
