<script lang="ts">
	import type { AccountListingCollectionItemVm } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';
	import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';
	import type { ExtensionCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { AccountExploreFilters } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Badge } from '$lib/ui/badge';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTagFilter from '$lib/ui/templates/extensions/ExtensionsTagFilter.svelte';
	import AccountViralFormatsKindChips from '$lib/ui/components/extensions/AccountViralFormatsKindChips.svelte';
	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import AccountListingsCollectionGroup from '$lib/ui/components/extensions/AccountListingsCollectionGroup.svelte';

	type MenuItemFactory = (item: AccountListingCollectionItemVm) => Array<{
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	}>;

	type Props = {
		filters: AccountExploreFilters;
		categoriesVm: ExtensionCategoryViewModel[];
		tagFilterVm: ExtensionsTagFilterViewModel;
		extensions: AccountListingCollectionItemVm[];
		stacks: AccountListingCollectionItemVm[];
		loading?: boolean;
		showExtensions?: boolean;
		showStacks?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		bookmarkCount?: number;
		accountBillingHref?: string;
		selectableExtensions?: boolean;
		isSelected?: (listingId: string) => boolean;
		onToggleSelect?: (listingId: string) => void;
		getPublicHref?: (item: AccountListingCollectionItemVm) => string;
		getMenuItems?: MenuItemFactory;
		onSearchChange?: (value: string) => void;
		onCategorySelect?: (slug: string | null) => void;
		onKindSelect?: (kind: AccountExploreFilters['listingKind']) => void;
		onTagGroupSelect?: (groupSlug: string | null) => void;
		onTagToggle?: (tagSlug: string) => void;
		onClearTagFilters?: () => void;
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
	};

	let {
		filters,
		categoriesVm,
		tagFilterVm,
		extensions,
		stacks,
		loading = false,
		showExtensions = true,
		showStacks = true,
		bookmarksPaidEnabled = null,
		bookmarkCount = 0,
		accountBillingHref = '',
		selectableExtensions = false,
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
		onBookmarkedToggle,
		selectedCount = 0,
		onCreateStack,
		onClearSelection,
		showBookmarks = false,
		isBookmarked = () => false,
		isLoggedIn = false,
		togglingBookmarkId = null,
		onToggleBookmark
	}: Props = $props();

	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filters.search;
	});

	const bookmarkChipClass =
		'cursor-pointer gap-1.5 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
</script>

<div class="space-y-5">
	<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
		<ExtensionsSearchBar
			bind:value={searchDraft}
			placeholder="Search extensions and stacks…"
			class="min-w-0 flex-1"
			onchange={onSearchChange}
		/>
		<AccountViralFormatsKindChips activeKind={filters.listingKind} onSelect={onKindSelect} />
	</div>

	<div class="flex flex-col gap-4 rounded-2xl border border-base-300/70 bg-base-100/80 p-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div class="min-w-0 flex-1 space-y-2">
				<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-base-content/45 uppercase">
					Category
				</p>
				<select
					class="select select-bordered select-sm w-full max-w-xs"
					value={filters.category ?? ''}
					onchange={(event) => {
						const value = (event.currentTarget as HTMLSelectElement).value;
						onCategorySelect?.(value || null);
					}}
				>
					<option value="">All categories</option>
					{#each categoriesVm as category (category.id)}
						<option value={category.slug}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Badge
					variant={filters.bookmarkedOnly ? 'default' : 'outline'}
					class={bookmarkChipClass}
					ariaPressed={filters.bookmarkedOnly}
					onclick={() => onBookmarkedToggle?.()}
				>
					<AbstractIcon name={icons.Bookmark.name} class="size-3.5" width="14" height="14" />
					Bookmarked
					{#if bookmarkCount > 0}
						<span class="tabular-nums opacity-70">{bookmarkCount.toLocaleString()}</span>
					{/if}
				</Badge>
			</div>
		</div>

		<ExtensionsTagFilter
			{tagFilterVm}
			activeTagGroup={filters.tagGroup}
			activeTags={filters.tags}
			onGroupSelect={onTagGroupSelect}
			onTagToggle={onTagToggle}
			onClear={onClearTagFilters}
		/>
	</div>

	{#if filters.bookmarkedOnly && bookmarksPaidEnabled === false}
		<HomeAccountNoticeBanner iconName={icons.Sparkles.name} tone="upgrade" dismissible={false}>
			<p class="text-base-content/90">
				Extension bookmarks are available on paid plans. Upgrade to save listings from the hub and
				filter by bookmarked items.
			</p>
			{#snippet actions()}
				<Button href={accountBillingHref} variant="secondary" size="sm" class="gap-1.5">
					<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
					Upgrade plan
				</Button>
			{/snippet}
		</HomeAccountNoticeBanner>
	{/if}

	{#if selectedCount > 0 || showExtensions}
		<AccountViralFormatsStackSelectionBar
			{selectedCount}
			onCreateStack={onCreateStack}
			onClearSelection={onClearSelection}
		/>
	{/if}

	{#if showExtensions}
		<AccountListingsCollectionGroup
			label="Extensions"
			description="Check Add on one or more extensions to include them in a new stack."
			items={extensions}
			{loading}
			layout="grid"
			emptyMessage={filters.bookmarkedOnly
				? 'No bookmarked extensions match your filters.'
				: 'No extensions match your filters.'}
			{selectableExtensions}
			{isSelected}
			{onToggleSelect}
			getEditHref={getPublicHref}
			{getMenuItems}
			{showBookmarks}
			{isBookmarked}
			{isLoggedIn}
			{bookmarksPaidEnabled}
			upgradeHref={accountBillingHref}
			{togglingBookmarkId}
			{onToggleBookmark}
		/>
	{/if}

	{#if showStacks}
		<AccountListingsCollectionGroup
			label="Stacks"
			items={stacks}
			{loading}
			layout="grid"
			emptyMessage={filters.bookmarkedOnly
				? 'No bookmarked stacks match your filters.'
				: 'No stacks match your filters.'}
			getEditHref={getPublicHref}
			{getMenuItems}
			{showBookmarks}
			{isBookmarked}
			{isLoggedIn}
			{bookmarksPaidEnabled}
			upgradeHref={accountBillingHref}
			{togglingBookmarkId}
			{onToggleBookmark}
		/>
	{/if}
</div>
