<script lang="ts">
	import {
		publicBuildBacklinksPagePresenter,
		type BuildBacklinksHubFilters,
		type LinkDirectoryCategoryDto,
		type LinkDirectorySiteDto,
		type LinkDirectoryTagDto
	} from '$lib/link-directory/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { BuildBacklinksFacetClick } from '$lib/link-directory/utils/buildBacklinksFacetActions';
	import { applyBuildBacklinksFacetClick } from '$lib/link-directory/utils/buildBacklinksFacetActions';
	import {
		buildHubListUrl,
		HUB_LIST_PAGE_SIZE_OPTIONS
	} from '$lib/listings/utils/hubListPagination';

	import BuildBacklinksHubListToolbar from '$lib/ui/templates/build-backlinks/BuildBacklinksHubListToolbar.svelte';
	import BuildBacklinksHubSidebar from '$lib/ui/templates/build-backlinks/BuildBacklinksHubSidebar.svelte';
	import BuildBacklinksSiteCard from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteCard.svelte';
	import Pagination from '$lib/ui/templates/Pagination.svelte';

	type BookmarkToggleParams = { siteId: string; siteSlug: string; title?: string };
	type BookmarkToggleResult =
		| { ok: true; bookmarked: boolean }
		| { ok: false; error: string };

	type Props = {
		sitesVm: LinkDirectorySiteDto[];
		categoriesVm: LinkDirectoryCategoryDto[];
		tagsVm: LinkDirectoryTagDto[];
		filtersVm: BuildBacklinksHubFilters;
		listPage: number;
		itemsPerPage: number;
		filteredCount: number;
		totalPages: number;
		bookmarkedSlugs?: string[];
		onToggleBookmark?: (params: BookmarkToggleParams) => Promise<BookmarkToggleResult>;
		linkMode?: 'public' | 'inPlace';
		buildFilterUrl?: (
			current: BuildBacklinksHubFilters,
			overrides: Partial<BuildBacklinksHubFilters>
		) => string;
		isLoggedIn?: boolean;
		class?: string;
	};

	let {
		sitesVm,
		categoriesVm,
		tagsVm,
		filtersVm,
		listPage,
		itemsPerPage,
		filteredCount,
		totalPages,
		bookmarkedSlugs = [],
		onToggleBookmark,
		linkMode = 'public',
		buildFilterUrl,
		isLoggedIn = false,
		class: className = ''
	}: Props = $props();

	const bookmarkedSlugSet = $derived(new Set(bookmarkedSlugs));

	let expandedSiteId = $state<string | null>(null);

	function setOpportunitiesOpen(siteId: string, open: boolean) {
		expandedSiteId = open ? siteId : null;
	}

	function buildListUrl(overrides: Record<string, string | null | undefined>) {
		return buildHubListUrl(page.url.pathname, page.url.searchParams, overrides);
	}

	function navigate(overrides: Partial<BuildBacklinksHubFilters>) {
		const href = buildFilterUrl
			? buildFilterUrl(filtersVm, overrides)
			: publicBuildBacklinksPagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true, noScroll: linkMode === 'inPlace' });
	}

	function handleFacetClick(facet: BuildBacklinksFacetClick) {
		navigate(applyBuildBacklinksFacetClick(filtersVm, facet));
	}
</script>

<div class={['grid gap-8 lg:grid-cols-[minmax(240px,280px)_1fr]', className]}>
	<BuildBacklinksHubSidebar
		{filtersVm}
		{categoriesVm}
		{tagsVm}
		{linkMode}
		{buildFilterUrl}
		bookmarkCount={bookmarkedSlugs.length}
		class="lg:sticky lg:top-24 lg:self-start"
	/>

	<div class="min-w-0 space-y-4">
		<BuildBacklinksHubListToolbar
			{filtersVm}
			{categoriesVm}
			{tagsVm}
			{filteredCount}
			onSortChange={(sort) => navigate({ sort })}
			onClearFilter={(clear) => navigate(clear)}
		/>

		{#if sitesVm.length === 0}
			<div class="rounded-xl border border-dashed border-base-300 px-6 py-12 text-center">
				<p class="font-medium text-base-content">No sites match these filters.</p>
				<p class="mt-1 text-sm text-base-content/60">
					{#if filtersVm.bookmarkedOnly}
						Bookmark sites from the catalog, or turn off Bookmarked in the sidebar.
					{:else}
						Try clearing tags or opportunity filters.
					{/if}
				</p>
			</div>
		{:else}
			{#each sitesVm as site (site.id)}
				<BuildBacklinksSiteCard
					{site}
					tagsCatalog={tagsVm}
					{filtersVm}
					isBookmarked={bookmarkedSlugSet.has(site.slug)}
					{isLoggedIn}
					{onToggleBookmark}
					onFacetClick={handleFacetClick}
					opportunitiesOpen={expandedSiteId === site.id}
					onOpportunitiesOpenChange={(open) => setOpportunitiesOpen(site.id, open)}
				/>
			{/each}
		{/if}

		{#if filteredCount > 0}
			<Pagination
				{itemsPerPage}
				totalItems={filteredCount}
				currentPage={listPage}
				{totalPages}
				{buildListUrl}
				nameOfItems="sites"
				pageSizeOptions={[...HUB_LIST_PAGE_SIZE_OPTIONS]}
			/>
		{/if}
	</div>
</div>
