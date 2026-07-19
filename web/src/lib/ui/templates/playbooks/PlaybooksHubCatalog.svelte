<script lang="ts">
	import type {
		ExtensionCategoryViewModel,
		ExtensionSort,
		ExtensionsTagFilterViewModel,
		ListingBookmarkToggleResultViewModel,
		StackCardViewModel,
		StacksHubFilters
	} from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { getRootPathAccount } from '$lib/area-protected';
	import { publicPlaybooksPagePresenter } from '$lib/area-public/index';
	import { showListingBookmarkToast } from '$lib/listings';
	import {
		buildHubListUrl,
		HUB_LIST_PAGE_SIZE_OPTIONS
	} from '$lib/listings/utils/hubListPagination';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import ListingsCategorySidebar from '$lib/ui/templates/listings/ListingsCategorySidebar.svelte';
	import ListingsSearchBar from '$lib/ui/templates/listings/ListingsSearchBar.svelte';
	import ListingsTagFilter from '$lib/ui/templates/listings/ListingsTagFilter.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';
	import PlaybookHubCard from '$lib/ui/templates/playbooks/PlaybookHubCard.svelte';

	type Props = {
		playbooksVm: StackCardViewModel[];
		categoriesVm: ExtensionCategoryViewModel[];
		filtersVm: StacksHubFilters;
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
		playbooksVm,
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

	const pagePresenter = publicPlaybooksPagePresenter;
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);

	let searchDraft = $derived(filtersVm.search ?? '');

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

	function navigateFilters(overrides: Partial<StacksHubFilters>) {
		const href = pagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: true });
	}

	function handleSearchChange(value: string) {
		navigateFilters({ search: value.trim() || undefined });
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

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await onToggleBookmark(listingId, nextBookmarked);
		if (result.ok) {
			showListingBookmarkToast(nextBookmarked, 'stack');
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
			placeholder="Search playbooks…"
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

	<ListingsTagFilter
		tagFilterVm={tagFilterVm}
		activeTagGroup={filtersVm.tagGroup ?? null}
		activeTags={filtersVm.tags ?? []}
		onGroupSelect={handleTagGroupSelect}
		onTagToggle={handleTagToggle}
		onClear={handleTagClear}
	/>

	<div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
		<aside class="lg:sticky lg:top-24 lg:self-start">
			<h2 class="mb-3 text-sm font-semibold text-base-content/70">Categories</h2>
			<ListingsCategorySidebar
				{categoriesVm}
				activeCategorySlug={filtersVm.category ?? null}
				{activeTagPathSlug}
				linkMode={categorySidebarLinkMode}
				hubKind="playbooks"
			/>
		</aside>

		<section aria-label="Playbook listings">
			{#if playbooksVm.length === 0}
				<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
					No playbooks match your filters yet.
				</p>
			{:else}
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each playbooksVm as playbookVm (playbookVm.id)}
						<li>
							<PlaybookHubCard
								{playbookVm}
								showBookmark={true}
								isBookmarked={bookmarkedIds[playbookVm.id] === true}
								{isLoggedIn}
								{bookmarksPaidEnabled}
								upgradeHref={accountBillingHref}
								onToggleBookmark={handleToggleBookmark}
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
						nameOfItems="playbooks"
						pageSizeOptions={[...HUB_LIST_PAGE_SIZE_OPTIONS]}
					/>
				{/if}
			{/if}
		</section>
	</div>
</div>
