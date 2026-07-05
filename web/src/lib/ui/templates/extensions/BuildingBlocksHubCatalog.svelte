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
	import { publicExtensionsPagePresenter } from '$lib/area-public/index';
	import { showListingBookmarkToast } from '$lib/listings';
	import { serializeExtensionSlugs } from '$lib/stack-builder/utils/parseBuilderQuery';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import ExtensionsCategorySidebar from '$lib/ui/templates/extensions/ExtensionsCategorySidebar.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTypeChips from '$lib/ui/templates/extensions/ExtensionsTypeChips.svelte';
	import ExtensionsTagFilter from '$lib/ui/templates/extensions/ExtensionsTagFilter.svelte';

	type Props = {
		extensionsVm: ExtensionCardViewModel[];
		categoriesVm: ExtensionCategoryViewModel[];
		filtersVm: ExtensionsHubFilters;
		tagFilterVm: ExtensionsTagFilterViewModel;
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
		extensionsVm,
		categoriesVm,
		filtersVm,
		tagFilterVm,
		isLoggedIn,
		bookmarksPaidEnabled,
		bookmarkedIds,
		onToggleBookmark,
		categorySidebarLinkMode = true,
		class: className = ''
	}: Props = $props();

	const pagePresenter = publicExtensionsPagePresenter;
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const skillBuilderHref = url(route(getRootPathPublicSkillBuilder()));

	const EXTENSIONS_GRID_PAGE_SIZE = 20;

	let expandedId = $state<string | null>(null);
	let searchDraft = $derived(filtersVm.search ?? '');
	let visibleCount = $state(EXTENSIONS_GRID_PAGE_SIZE);
	let selectedExtensionIds = $state<string[]>([]);

	let visibleExtensions = $derived(extensionsVm.slice(0, visibleCount));
	let remainingCount = $derived(Math.max(0, extensionsVm.length - visibleCount));
	let hasMoreExtensions = $derived(remainingCount > 0);
	let selectedExtensions = $derived(
		extensionsVm.filter((extensionVm) => selectedExtensionIds.includes(extensionVm.id))
	);
	let selectedCount = $derived(selectedExtensions.length);

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

	function navigateFilters(overrides: Partial<ExtensionsHubFilters>) {
		visibleCount = EXTENSIONS_GRID_PAGE_SIZE;
		expandedId = null;
		const href = pagePresenter.buildFilterUrl(page.url.pathname, filtersVm, overrides);
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

	function showMoreExtensions() {
		visibleCount = Math.min(visibleCount + EXTENSIONS_GRID_PAGE_SIZE, extensionsVm.length);
	}

	function isSelected(listingId: string) {
		return selectedExtensionIds.includes(listingId);
	}

	function handleToggleSelect(listingId: string) {
		const availableIds = extensionsVm.map((extensionVm) => extensionVm.id);
		selectedExtensionIds = selectedExtensionIds.filter((id) => availableIds.includes(id));
		if (selectedExtensionIds.includes(listingId)) {
			selectedExtensionIds = selectedExtensionIds.filter((id) => id !== listingId);
			return;
		}
		selectedExtensionIds = [...selectedExtensionIds, listingId];
	}

	function handleClearSelection() {
		selectedExtensionIds = [];
	}

	function handleOpenSkillBuilderFromSelection() {
		if (selectedExtensions.length === 0) {
			toast.error('Select at least one building block.');
			return;
		}
		const params = new URLSearchParams();
		params.set(
			'extensions',
			serializeExtensionSlugs(selectedExtensions.map((extensionVm) => extensionVm.slug))
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
		<ExtensionsSearchBar bind:value={searchDraft} onchange={handleSearchChange} class="flex-1" />
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

	<ExtensionsTypeChips activeType={filtersVm.type ?? 'all'} onSelect={handleTypeSelect} />

	<ExtensionsTagFilter
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
			<ExtensionsCategorySidebar
				{categoriesVm}
				activeCategorySlug={filtersVm.category ?? null}
				{activeTagPathSlug}
				linkMode={categorySidebarLinkMode}
			/>
		</aside>

		<section aria-label="Building block listings">
			{#if extensionsVm.length === 0}
				<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
					No building blocks match your filters yet.
				</p>
			{:else}
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each visibleExtensions as extensionVm (extensionVm.id)}
						<li class={expandedId === extensionVm.id ? 'col-span-full' : undefined}>
							<ExtensionCard
								{extensionVm}
								expanded={expandedId === extensionVm.id}
								onToggle={toggleExpanded}
								showOwnerSubtitle={true}
								showBookmark={true}
								isBookmarked={bookmarkedIds[extensionVm.id] === true}
								{isLoggedIn}
								{bookmarksPaidEnabled}
								upgradeHref={accountBillingHref}
								onToggleBookmark={handleToggleBookmark}
								selectable={true}
								selected={isSelected(extensionVm.id)}
								onToggleSelect={handleToggleSelect}
							/>
						</li>
					{/each}
				</ul>
				{#if hasMoreExtensions}
					<div class="mt-8 flex justify-center">
						<button
							type="button"
							class="btn btn-outline btn-warning rounded-full px-6"
							onclick={showMoreExtensions}
						>
							Show more ({remainingCount.toLocaleString()} remaining)
						</button>
					</div>
				{/if}
			{/if}
		</section>
	</div>
</div>
