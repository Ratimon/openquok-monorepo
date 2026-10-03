<script lang="ts">
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountBuildingBlocksPage.presenter.svelte';
	import type { AccountExploreFilters } from '$lib/area-protected/ProtectedAccountBuildingBlocksPage.presenter.svelte';
	import type { SavedLibsSegmentId } from '$lib/area-protected/utils/buildAccountSavedHubSearch';
	import type {
		ExtensionSort,
		ExtensionTypeFilter,
		ExtensionsTagFilterViewModel
	} from '$lib/listings/listing.types';
	import type { ExtensionCategoryViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { OwnedListingStatsProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AccountSavedLibsBrowseCatalog from '$lib/ui/components/account/AccountSavedLibsBrowseCatalog.svelte';
	import AccountViralFormatsMineTab from '$lib/ui/components/extensions/AccountViralFormatsMineTab.svelte';
	import AccountPlaybooksStatsSection from '$lib/ui/components/home/AccountPlaybooksStatsSection.svelte';
	import HubAccountSignInCtaInlineHint from '$lib/ui/components/account/HubAccountSignInCtaInlineHint.svelte';

	type MenuItemFactory = (item: AccountListingCollectionItemViewModel) => Array<{
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	}>;

	type Props = {
		libsSegment: SavedLibsSegmentId;
		onLibsSegmentChange: (segment: SavedLibsSegmentId) => void;
		newBuildingBlockHref: string;
		onNewPlaybook: () => void;
		filters: AccountExploreFilters;
		categoriesVm: ExtensionCategoryViewModel[];
		tagFilterVm: ExtensionsTagFilterViewModel;
		exploreBuildingBlocks: AccountListingCollectionItemViewModel[];
		exploreStacks: AccountListingCollectionItemViewModel[];
		loadingExplore: boolean;
		showExploreBuildingBlocks: boolean;
		showExploreStacks: boolean;
		bookmarkCount: number;
		isBuildingBlockSelected: (id: string) => boolean;
		onToggleSelect: (listingId: string) => void;
		getPublicHref: (item: AccountListingCollectionItemViewModel) => string;
		exploreMenuItems: MenuItemFactory;
		onSearchChange: (value: string) => void;
		onCategorySelect: (slug: string | null) => void;
		onKindSelect: (kind: AccountExploreFilters['listingKind']) => void;
		onTagGroupSelect: (groupSlug: string | null) => void;
		onTagToggle: (tagSlug: string) => void;
		onClearTagFilters: () => void;
		onSortChange: (sort: ExtensionSort) => void;
		onExtensionTypeSelect: (type: ExtensionTypeFilter) => void;
		onBookmarkedToggle: () => void;
		selectedCount: number;
		onCreateStack: () => void;
		onClearSelection: () => void;
		isBookmarked: (id: string) => boolean;
		isLoggedIn: boolean;
		togglingBookmarkId: string | null;
		onToggleBookmark: (
			listingId: string,
			nextBookmarked: boolean
		) => Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }>;
		ownBuildingBlocks: AccountListingCollectionItemViewModel[];
		ownStacks: AccountListingCollectionItemViewModel[];
		loadingOwn: boolean;
		ownPublishedBuildingBlockCount: number;
		ownPublishedStackCount: number;
		listingHubStatsVm: OwnedListingStatsProgrammerModel | null;
		publicPlaybooksHref: string;
		publicBuildingBlocksHref: string;
		getOwnEditHref: (item: AccountListingCollectionItemViewModel) => string;
		ownMenuItems: MenuItemFactory;
	};

	let {
		libsSegment,
		onLibsSegmentChange,
		newBuildingBlockHref,
		onNewPlaybook,
		filters,
		categoriesVm,
		tagFilterVm,
		exploreBuildingBlocks,
		exploreStacks,
		loadingExplore,
		showExploreBuildingBlocks,
		showExploreStacks,
		bookmarkCount,
		isBuildingBlockSelected,
		onToggleSelect,
		getPublicHref,
		exploreMenuItems,
		onSearchChange,
		onCategorySelect,
		onKindSelect,
		onTagGroupSelect,
		onTagToggle,
		onClearTagFilters,
		onSortChange,
		onExtensionTypeSelect,
		onBookmarkedToggle,
		selectedCount,
		onCreateStack,
		onClearSelection,
		isBookmarked,
		isLoggedIn,
		togglingBookmarkId,
		onToggleBookmark,
		ownBuildingBlocks,
		ownStacks,
		loadingOwn,
		ownPublishedBuildingBlockCount,
		ownPublishedStackCount,
		listingHubStatsVm,
		publicPlaybooksHref,
		publicBuildingBlocksHref,
		getOwnEditHref,
		ownMenuItems
	}: Props = $props();

	function libsSegmentButtonClass(active: boolean): string {
		return `inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
			active
				? 'bg-base-100 font-semibold text-base-content shadow-sm'
				: 'text-base-content/65 hover:bg-base-content/10 hover:text-base-content'
		}`;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div
			class="grid w-full max-w-md grid-cols-2 gap-1 rounded-lg bg-base-200 p-1 sm:inline-flex sm:w-auto sm:grid-cols-none"
			role="group"
			aria-label="Libs sections"
		>
			<button
				type="button"
				class={libsSegmentButtonClass(libsSegment === 'browse')}
				aria-pressed={libsSegment === 'browse'}
				onclick={() => onLibsSegmentChange('browse')}
			>
				<AbstractIcon name={icons.Search.name} class="size-4 shrink-0" width="16" height="16" />
				Browse
			</button>
			<button
				type="button"
				class={libsSegmentButtonClass(libsSegment === 'library')}
				aria-pressed={libsSegment === 'library'}
				onclick={() => onLibsSegmentChange('library')}
			>
				<AbstractIcon name={icons.Bot.name} class="size-4 shrink-0" width="16" height="16" />
				Your library
			</button>
		</div>

		{#if libsSegment === 'library'}
			<div class="flex flex-wrap items-center gap-2">
				<Button href={newBuildingBlockHref} variant="outline" size="sm">New building block</Button>
				<Button variant="primary" size="sm" onclick={onNewPlaybook}>New playbook</Button>
			</div>
		{/if}
	</div>

	{#if libsSegment === 'browse'}
		<HubAccountSignInCtaInlineHint variant="listings" {isLoggedIn} />
		<AccountSavedLibsBrowseCatalog
			{filters}
			categoriesVm={categoriesVm}
			tagFilterVm={tagFilterVm}
			buildingBlocks={exploreBuildingBlocks}
			stacks={exploreStacks}
			loading={loadingExplore}
			showBuildingBlocks={showExploreBuildingBlocks}
			showStacks={showExploreStacks}
			{bookmarkCount}
			selectableBuildingBlocks={true}
			isSelected={isBuildingBlockSelected}
			{onToggleSelect}
			{getPublicHref}
			getMenuItems={exploreMenuItems}
			{onSearchChange}
			{onCategorySelect}
			{onKindSelect}
			{onTagGroupSelect}
			{onTagToggle}
			{onClearTagFilters}
			{onSortChange}
			{onExtensionTypeSelect}
			{onBookmarkedToggle}
			{selectedCount}
			{onCreateStack}
			{onClearSelection}
			showBookmarks={true}
			{isBookmarked}
			{isLoggedIn}
			{togglingBookmarkId}
			{onToggleBookmark}
		/>
	{:else}
		<div class="space-y-5">
			<AccountPlaybooksStatsSection
				buildingBlockCount={ownBuildingBlocks.length}
				publishedBuildingBlockCount={ownPublishedBuildingBlockCount}
				playbookCount={ownStacks.length}
				publishedPlaybookCount={ownPublishedStackCount}
				hubStats={listingHubStatsVm}
				{publicPlaybooksHref}
				{publicBuildingBlocksHref}
			/>
			<AccountViralFormatsMineTab
				buildingBlocks={ownBuildingBlocks}
				stacks={ownStacks}
				loading={loadingOwn}
				selectableBuildingBlocks={true}
				isSelected={isBuildingBlockSelected}
				{onToggleSelect}
				getEditHref={getOwnEditHref}
				getMenuItems={ownMenuItems}
				{selectedCount}
				{onCreateStack}
				{onClearSelection}
			/>
		</div>
	{/if}
</div>
