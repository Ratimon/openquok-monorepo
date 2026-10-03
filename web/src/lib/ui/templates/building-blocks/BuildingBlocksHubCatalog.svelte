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
	import ListingsExtensionsHubListToolbar from '$lib/ui/templates/listings/ListingsExtensionsHubListToolbar.svelte';
	import ListingsExtensionsHubSidebar from '$lib/ui/templates/listings/ListingsExtensionsHubSidebar.svelte';
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
	let searchDraft = $state('');
	let selectedBuildingBlockIds = $state<string[]>([]);

	$effect(() => {
		searchDraft = filtersVm.search ?? '';
	});

	let selectedBuildingBlocks = $derived(
		buildingBlocksVm.filter((buildingBlockVm) => selectedBuildingBlockIds.includes(buildingBlockVm.id))
	);
	let selectedCount = $derived(selectedBuildingBlocks.length);

	let activeTagPathSlug = $derived(
		filtersVm.tags?.length === 1
			? (filtersVm.tags[0] ?? null)
			: (filtersVm.tagGroup ?? null)
	);

	function buildListUrl(overrides: Record<string, string | null | undefined>): string {
		return buildHubListUrl(page.url.pathname, page.url.searchParams, overrides);
	}

	function navigateFilters(overrides: Partial<ExtensionsHubFilters>) {
		expandedId = null;
		const href = pagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: true });
	}

	function handleSearchChange(value: string) {
		navigateFilters({ search: value.trim() || undefined });
	}

	function handleCategorySelect(slug: string | null) {
		navigateFilters({ category: slug ?? undefined });
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
			? current.filter((s) => s !== tagSlug)
			: [...current, tagSlug];
		navigateFilters({
			tags: tags.length ? tags : undefined,
			tagGroup: tags.length ? undefined : filtersVm.tagGroup
		});
	}

	function handleTagClear() {
		navigateFilters({ tags: undefined, tagGroup: undefined });
	}

	function handleSortChange(sort: ExtensionSort) {
		navigateFilters({ sort });
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

<div class={['grid gap-8 lg:grid-cols-[minmax(240px,280px)_1fr]', className]}>
	<ListingsExtensionsHubSidebar
		hubKind="building-blocks"
		{categoriesVm}
		{tagFilterVm}
		bind:searchValue={searchDraft}
		sort={filtersVm.sort ?? 'newest'}
		activeCategorySlug={filtersVm.category ?? null}
		{activeTagPathSlug}
		activeTagGroup={filtersVm.tagGroup ?? null}
		activeTags={filtersVm.tags ?? []}
		{categorySidebarLinkMode}
		onCategorySelect={categorySidebarLinkMode ? undefined : handleCategorySelect}
		onSearchChange={handleSearchChange}
		onSortChange={handleSortChange}
		onTagGroupSelect={handleTagGroupSelect}
		onTagToggle={handleTagToggle}
		onTagClear={handleTagClear}
		activeExtensionType={filtersVm.type ?? 'all'}
		onTypeSelect={handleTypeSelect}
		class="lg:sticky lg:top-24 lg:self-start"
	/>

	<div class="min-w-0 space-y-4">
		<ListingsExtensionsHubListToolbar
			{filteredCount}
			itemLabelSingular="building block"
			itemLabelPlural="building blocks"
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

		<section aria-label="Building block listings">
			{#if buildingBlocksVm.length === 0}
				<div class="rounded-xl border border-dashed border-base-300 px-6 py-12 text-center">
					<p class="font-medium text-base-content">No building blocks match your filters.</p>
					<p class="mt-1 text-sm text-base-content/60">Try clearing tags or search in the sidebar.</p>
				</div>
			{:else}
				<ul class="flex flex-col gap-4">
					{#each buildingBlocksVm as buildingBlockVm (buildingBlockVm.id)}
						<li>
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
			{/if}

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
		</section>
	</div>
</div>
