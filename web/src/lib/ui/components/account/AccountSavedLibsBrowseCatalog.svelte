<script lang="ts">
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountBuildingBlocksPage.presenter.svelte';
	import type { AccountExploreFilters } from '$lib/area-protected/ProtectedAccountBuildingBlocksPage.presenter.svelte';
	import type { ExtensionSort, ExtensionTypeFilter } from '$lib/listings/listing.types';
	import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';
	import type { ExtensionCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { cn } from '$lib/ui/helpers/common';
	import AccountViralFormatsKindChips from '$lib/ui/components/extensions/AccountViralFormatsKindChips.svelte';
	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import AccountListingsCollectionGroup from '$lib/ui/components/extensions/AccountListingsCollectionGroup.svelte';
	import ExtensionCatalogHubListToolbar from '$lib/ui/templates/public-hub/extension-catalog/ExtensionCatalogHubListToolbar.svelte';
	import ExtensionCatalogHubSidebar from '$lib/ui/templates/public-hub/extension-catalog/ExtensionCatalogHubSidebar.svelte';

	type MenuItemFactory = (item: AccountListingCollectionItemViewModel) => Array<{
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	}>;

	type Props = {
		filters: AccountExploreFilters;
		categoriesVm: ExtensionCategoryViewModel[];
		tagFilterVm: ExtensionsTagFilterViewModel;
		buildingBlocks: AccountListingCollectionItemViewModel[];
		stacks: AccountListingCollectionItemViewModel[];
		loading?: boolean;
		showBuildingBlocks?: boolean;
		showStacks?: boolean;
		bookmarkCount?: number;
		selectableBuildingBlocks?: boolean;
		isSelected?: (listingId: string) => boolean;
		onToggleSelect?: (listingId: string) => void;
		getPublicHref?: (item: AccountListingCollectionItemViewModel) => string;
		getMenuItems?: MenuItemFactory;
		onSearchChange?: (value: string) => void;
		onCategorySelect?: (slug: string | null) => void;
		onKindSelect?: (kind: AccountExploreFilters['listingKind']) => void;
		onTagGroupSelect?: (groupSlug: string | null) => void;
		onTagToggle?: (tagSlug: string) => void;
		onClearTagFilters?: () => void;
		onSortChange?: (sort: ExtensionSort) => void;
		onExtensionTypeSelect?: (type: ExtensionTypeFilter) => void;
		onBookmarkedToggle?: () => void;
		selectedCount?: number;
		onCreateStack?: () => void;
		onClearSelection?: () => void;
		showBookmarks?: boolean;
		isBookmarked?: (listingId: string) => boolean;
		isLoggedIn?: boolean;
		togglingBookmarkId?: string | null;
		onToggleBookmark?: (
			listingId: string,
			nextBookmarked: boolean
		) => Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }>;
		class?: string;
	};

	let {
		filters,
		categoriesVm,
		tagFilterVm,
		buildingBlocks,
		stacks,
		loading = false,
		showBuildingBlocks = true,
		showStacks = true,
		bookmarkCount = 0,
		selectableBuildingBlocks = false,
		isSelected = () => false,
		onToggleSelect,
		getPublicHref,
		getMenuItems,
		onSearchChange,
		onCategorySelect,
		onKindSelect,
		onTagGroupSelect,
		onTagToggle,
		onClearTagFilters,
		onSortChange,
		onExtensionTypeSelect,
		onBookmarkedToggle,
		selectedCount = 0,
		onCreateStack,
		onClearSelection,
		showBookmarks = false,
		isBookmarked = () => false,
		isLoggedIn = false,
		togglingBookmarkId = null,
		onToggleBookmark,
		class: className = ''
	}: Props = $props();

	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filters.search;
	});

	const sidebarHubKind = $derived(
		filters.listingKind === 'stack' ? 'playbooks' : 'building-blocks'
	);

	const showExtensionTypeInSidebar = $derived(
		filters.listingKind === 'extension' || filters.listingKind === 'all'
	);

	let activeTagPathSlug = $derived(
		filters.tags.length === 1 ? (filters.tags[0] ?? null) : (filters.tagGroup ?? null)
	);

	let filteredCount = $derived(
		(showBuildingBlocks ? buildingBlocks.length : 0) + (showStacks ? stacks.length : 0)
	);

	let toolbarItemLabelSingular = $derived(
		filters.listingKind === 'stack'
			? 'playbook'
			: filters.listingKind === 'extension'
				? 'building block'
				: 'listing'
	);

	let toolbarItemLabelPlural = $derived(
		filters.listingKind === 'stack'
			? 'playbooks'
			: filters.listingKind === 'extension'
				? 'building blocks'
				: 'listings'
	);

	function handleSearchChange(value: string) {
		onSearchChange?.(value);
	}

	function handleCategorySelect(slug: string | null) {
		onCategorySelect?.(slug);
	}

	function handleTagGroupSelect(groupSlug: string | null) {
		onTagGroupSelect?.(groupSlug);
	}

	function handleTagToggle(tagSlug: string) {
		onTagToggle?.(tagSlug);
	}

	function handleTagClear() {
		onClearTagFilters?.();
	}

	function handleSortChange(sort: ExtensionSort) {
		onSortChange?.(sort);
	}

	function handleExtensionTypeSelect(type: ExtensionTypeFilter) {
		onExtensionTypeSelect?.(type);
	}

	function handleBookmarkedOnlyChange(_next: boolean) {
		onBookmarkedToggle?.();
	}
</script>

<div class={cn('grid gap-8 lg:grid-cols-[minmax(240px,280px)_1fr]', className)}>
	<ExtensionCatalogHubSidebar
		hubKind={sidebarHubKind}
		{categoriesVm}
		{tagFilterVm}
		bind:searchValue={searchDraft}
		sort={filters.sort}
		activeCategorySlug={filters.category}
		{activeTagPathSlug}
		activeTagGroup={filters.tagGroup}
		activeTags={filters.tags}
		categorySidebarLinkMode={false}
		onCategorySelect={handleCategorySelect}
		onSearchChange={handleSearchChange}
		onSortChange={handleSortChange}
		onTagGroupSelect={handleTagGroupSelect}
		onTagToggle={handleTagToggle}
		onTagClear={handleTagClear}
		activeExtensionType={showExtensionTypeInSidebar ? filters.extensionType : undefined}
		onTypeSelect={showExtensionTypeInSidebar ? handleExtensionTypeSelect : undefined}
		bookmarkedOnly={filters.bookmarkedOnly}
		{bookmarkCount}
		onBookmarkedOnlyChange={onBookmarkedToggle ? handleBookmarkedOnlyChange : undefined}
		class="lg:sticky lg:top-24 lg:self-start"
	/>

	<div class="min-w-0 space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
			<AccountViralFormatsKindChips activeKind={filters.listingKind} onSelect={onKindSelect} />
		</div>

		<ExtensionCatalogHubListToolbar
			filteredCount={filteredCount}
			itemLabelSingular={toolbarItemLabelSingular}
			itemLabelPlural={toolbarItemLabelPlural}
		/>

		{#if selectedCount > 0 || showBuildingBlocks}
			<AccountViralFormatsStackSelectionBar
				{selectedCount}
				onCreateStack={onCreateStack}
				onClearSelection={onClearSelection}
			/>
		{/if}

		{#if showBuildingBlocks}
			<AccountListingsCollectionGroup
				label="Building blocks"
				description="Check Add on one or more building blocks to include them in a new playbook."
				items={buildingBlocks}
				{loading}
				layout="grid"
				gridDensity="narrow"
				emptyMessage={filters.bookmarkedOnly
					? 'No bookmarked building blocks match your filters.'
					: 'No building blocks match your filters.'}
				{selectableBuildingBlocks}
				{isSelected}
				{onToggleSelect}
				getEditHref={getPublicHref}
				{getMenuItems}
				{showBookmarks}
				{isBookmarked}
				{isLoggedIn}
				{togglingBookmarkId}
				{onToggleBookmark}
			/>
		{/if}

		{#if showStacks}
			<AccountListingsCollectionGroup
				label="Playbooks"
				items={stacks}
				{loading}
				layout="grid"
				gridDensity="narrow"
				emptyMessage={filters.bookmarkedOnly
					? 'No bookmarked playbooks match your filters.'
					: 'No playbooks match your filters.'}
				getEditHref={getPublicHref}
				{getMenuItems}
				{showBookmarks}
				{isBookmarked}
				{isLoggedIn}
				{togglingBookmarkId}
				{onToggleBookmark}
			/>
		{/if}
	</div>
</div>
