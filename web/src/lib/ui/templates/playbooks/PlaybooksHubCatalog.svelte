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

	import ListingsExtensionsHubListToolbar from '$lib/ui/templates/listings/ListingsExtensionsHubListToolbar.svelte';
	import ListingsExtensionsHubSidebar from '$lib/ui/templates/listings/ListingsExtensionsHubSidebar.svelte';
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

	let searchDraft = $state('');

	$effect(() => {
		searchDraft = filtersVm.search ?? '';
	});

	let activeTagPathSlug = $derived(
		filtersVm.tags?.length === 1
			? (filtersVm.tags[0] ?? null)
			: (filtersVm.tagGroup ?? null)
	);

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

	function handleCategorySelect(slug: string | null) {
		navigateFilters({ category: slug ?? undefined });
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

<div class={['grid gap-8 lg:grid-cols-[minmax(240px,280px)_1fr]', className]}>
	<ListingsExtensionsHubSidebar
		hubKind="playbooks"
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
		class="lg:sticky lg:top-24 lg:self-start"
	/>

	<div class="min-w-0 space-y-4">
		<ListingsExtensionsHubListToolbar
			{filteredCount}
			itemLabelSingular="playbook"
			itemLabelPlural="playbooks"
		/>

		<section aria-label="Playbook listings">
			{#if playbooksVm.length === 0}
				<div class="rounded-xl border border-dashed border-base-300 px-6 py-12 text-center">
					<p class="font-medium text-base-content">No playbooks match your filters.</p>
					<p class="mt-1 text-sm text-base-content/60">Try clearing tags or search in the sidebar.</p>
				</div>
			{:else}
				<ul class="flex flex-col gap-4">
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
			{/if}

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
		</section>
	</div>
</div>
