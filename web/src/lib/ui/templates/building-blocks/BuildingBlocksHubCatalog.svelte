<script lang="ts">
	import type {
		ExtensionCardViewModel,
		ExtensionCategoryViewModel,
		ExtensionSort,
		ExtensionTypeFilter,
		ExtensionsHubFilters,
		ExtensionsTagFilterViewModel,
		ListingBookmarkToggleResultViewModel
	} from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { publicBuildingBlocksPagePresenter } from '$lib/area-public/index';
	import { showListingBookmarkToast } from '$lib/listings';
	import {
		buildHubListUrl,
		HUB_LIST_PAGE_SIZE_OPTIONS
	} from '$lib/listings/utils/hubListPagination';
	import {
		SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
		serializeExtensionSlugs
	} from '$lib/skill-builder/utils/parseBuilderQuery';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import BuildingBlockCard from '$lib/ui/templates/building-blocks/BuildingBlockCard.svelte';
	import ListingsCategorySidebar from '$lib/ui/templates/listings/ListingsCategorySidebar.svelte';
	import ListingsSearchBar from '$lib/ui/templates/listings/ListingsSearchBar.svelte';
	import ListingsTagFilter from '$lib/ui/templates/listings/ListingsTagFilter.svelte';
	import ListingsTypeChips from '$lib/ui/templates/listings/ListingsTypeChips.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';

	type Props = {
		buildingBlocksVm: ExtensionCardViewModel[];
		categoriesVm: ExtensionCategoryViewModel[];
		filtersVm: ExtensionsHubFilters;
		tagFilterVm: ExtensionsTagFilterViewModel;
		listPage: number;
		itemsPerPage: number;
		filteredCount: number;
		totalPages: number;
		isLoggedIn: boolean;
		bookmarksPaidEnabled: boolean | null;
		bookmarkedIds: Record<string, boolean>;
		onToggleBookmark: (
			listingId: string,
			nextBookmarked: boolean
		) => Promise<ListingBookmarkToggleResultViewModel>;
		categorySidebarLinkMode?: boolean;
		class?: string;
	};

	let {
		buildingBlocksVm,
		categoriesVm,
		filtersVm,
		tagFilterVm,
		listPage,
		itemsPerPage,
		filteredCount,
		totalPages,
		isLoggedIn,
		bookmarksPaidEnabled,
		bookmarkedIds,
		onToggleBookmark,
		categorySidebarLinkMode = true,
		class: className = ''
	}: Props = $props();

	const pagePresenter = publicBuildingBlocksPagePresenter;
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const skillBuilderHref = url(route(getRootPathPublicSkillBuilder()));

	let expandedId = $state<string | null>(null);
	let searchDraft = $derived(filtersVm.search ?? '');
	let selectedBuildingBlockIds = $state<string[]>([]);

	let selectedBuildingBlocks = $derived(
		buildingBlocksVm.filter((buildingBlockVm) => selectedBuildingBlockIds.includes(buildingBlockVm.id))
	);
	let selectedCount = $derived(selectedBuildingBlocks.length);

	let activeTagPathSlug = $derived(
		filtersVm.tags?.length === 1
			? (filtersVm.tags[0] ?? null)
			: (filtersVm.tagGroup ?? null)
	);

	const sortOptions: { id: ExtensionSort; label: string }[] = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'popular', label: 'Most liked' },
		{ id: 'views', label: 'Most viewed' }
	];

	function buildListUrl(overrides: Record<string, string | null | undefined>): string {
		return buildHubListUrl(page.url.pathname, page.url.searchParams, overrides);
	}

	function navigateFilters(overrides: Partial<ExtensionsHubFilters>) {
		expandedId = null;
		const href = pagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: true });
	}

	function handleSearchChange(value: string) {
		searchDraft = value;
		navigateFilters({ search: value.trim() || undefined });
	}

	function handleTypeSelect(type: ExtensionTypeFilter) {
		navigateFilters({ type });
	}

	function handleTagGroupSelect(groupSlug: string | null) {
		navigateFilters({ tagGroup: groupSlug ?? undefined, tags: undefined });
	}

	function handleTagToggle(tagSlug: string) {
		const current = filtersVm.tags ?? [];
		const tags = current.includes(tagSlug)
			? current.filter((slug) => slug !== tagSlug)
			: [...current, tagSlug];
		navigateFilters({
			tags: tags.length ? tags : undefined,
			tagGroup: tags.length ? undefined : filtersVm.tagGroup
		});
	}

	function handleTagClear() {
		navigateFilters({ tags: undefined, tagGroup: undefined });
	}

	function handleSortChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as ExtensionSort;
		navigateFilters({ sort: value });
	}

	function toggleExpanded(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	function isSelected(listingId: string) {
		return selectedBuildingBlockIds.includes(listingId);
	}

	function handleToggleSelect(listingId: string) {
		const availableIds = buildingBlocksVm.map((buildingBlockVm) => buildingBlockVm.id);
		selectedBuildingBlockIds = selectedBuildingBlockIds.filter((id) => availableIds.includes(id));
		if (selectedBuildingBlockIds.includes(listingId)) {
			selectedBuildingBlockIds = selectedBuildingBlockIds.filter((id) => id !== listingId);
			return;
		}
		selectedBuildingBlockIds = [...selectedBuildingBlockIds, listingId];
	}

	function handleClearSelection() {
		selectedBuildingBlockIds = [];
	}

	function handleOpenSkillBuilderFromSelection() {
		if (selectedBuildingBlocks.length === 0) {
			toast.error('Select at least one building block.');
			return;
		}
		const params = new URLSearchParams();
		params.set(
			SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
			serializeExtensionSlugs(selectedBuildingBlocks.map((buildingBlockVm) => buildingBlockVm.slug))
		);
		void goto(`${skillBuilderHref}?${params.toString()}`);
	}

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await onToggleBookmark(listingId, nextBookmarked);
		if (result.ok) {
			showListingBookmarkToast(nextBookmarked, 'extension');
		} else if (result.error) {
			toast.error(result.error);
		}
		return result;
	}
</script>

<div class={className}>
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<ListingsSearchBar
			bind:value={searchDraft}
			placeholder="Search building blocks…"
			onchange={handleSearchChange}
			class="flex-1"
		/>
		<label class="flex items-center gap-2 text-sm text-base-content/70">
			<span>Sort</span>
			<select
				class="select select-bordered select-sm"
				value={filtersVm.sort ?? 'newest'}
				onchange={handleSortChange}
			>
				{#each sortOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<ListingsTypeChips activeType={filtersVm.type ?? 'all'} onSelect={handleTypeSelect} />

	<ListingsTagFilter
		tagFilterVm={tagFilterVm}
		activeTagGroup={filtersVm.tagGroup ?? null}
		activeTags={filtersVm.tags ?? []}
		onGroupSelect={handleTagGroupSelect}
		onTagToggle={handleTagToggle}
		onClear={handleTagClear}
	/>

	<AccountViralFormatsStackSelectionBar
		{selectedCount}
		primaryActionLabel="Open Skill Builder"
		idleTitle="Build a skill from multiple building blocks"
		idleDescription="Use the Add to skill builder controls on building block cards below, then open the builder here."
		selectedTitle="building blocks selected for your skill"
		selectedDescription="Open the skill builder with your selected building blocks preloaded so you can refine the generated output."
		onPrimaryAction={handleOpenSkillBuilderFromSelection}
		onClearSelection={handleClearSelection}
	/>

	<div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
		<aside class="lg:sticky lg:top-24 lg:self-start">
			<h2 class="mb-3 text-sm font-semibold text-base-content/70">Categories</h2>
			<ListingsCategorySidebar
				{categoriesVm}
				activeCategorySlug={filtersVm.category ?? null}
				{activeTagPathSlug}
				linkMode={categorySidebarLinkMode}
			/>
		</aside>

		<section aria-label="Building block listings">
			{#if buildingBlocksVm.length === 0}
				<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
					No building blocks match your filters yet.
				</p>
			{:else}
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each buildingBlocksVm as buildingBlockVm (buildingBlockVm.id)}
						<li class={expandedId === buildingBlockVm.id ? 'col-span-full' : undefined}>
							<BuildingBlockCard
								extensionVm={buildingBlockVm}
								expanded={expandedId === buildingBlockVm.id}
								onToggle={toggleExpanded}
								showOwnerSubtitle={true}
								showBookmark={true}
								isBookmarked={bookmarkedIds[buildingBlockVm.id] === true}
								{isLoggedIn}
								{bookmarksPaidEnabled}
								upgradeHref={accountBillingHref}
								onToggleBookmark={handleToggleBookmark}
								selectable={true}
								selected={isSelected(buildingBlockVm.id)}
								onToggleSelect={handleToggleSelect}
							/>
						</li>
					{/each}
				</ul>
				{#if filteredCount > 0}
					<Pagination
						{itemsPerPage}
						totalItems={filteredCount}
						currentPage={listPage}
						{totalPages}
						{buildListUrl}
						nameOfItems="building blocks"
						pageSizeOptions={[...HUB_LIST_PAGE_SIZE_OPTIONS]}
					/>
				{/if}
			{/if}
		</section>
	</div>
</div>
