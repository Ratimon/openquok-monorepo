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
	import { buildBacklinksSiteElementId } from '$lib/link-directory/utils/buildBacklinksSiteElementId';
	import { buildHubListUrl } from '$lib/listings/utils/hubListPagination';

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
		savedSitesBySlug?: Map<string, { title: string; slug: string }>;
		onToggleBookmark?: (params: BookmarkToggleParams) => Promise<BookmarkToggleResult>;
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
		savedSitesBySlug = new Map(),
		onToggleBookmark,
		class: className = ''
	}: Props = $props();

	const bookmarkedSlugSet = $derived(new Set(bookmarkedSlugs));

	let expandedSiteId = $state<string | null>(null);

	function setOpportunitiesOpen(siteId: string, open: boolean) {
		expandedSiteId = open ? siteId : null;
	}

	function scrollToBookmarkedSite(siteSlug: string) {
		const element = document.getElementById(buildBacklinksSiteElementId(siteSlug));
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-base-100');
		window.setTimeout(() => {
			element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-base-100');
		}, 1600);
	}

	function buildListUrl(overrides: Record<string, string | null | undefined>) {
		return buildHubListUrl(page.url.pathname, page.url.searchParams, overrides);
	}

	function navigate(overrides: Partial<BuildBacklinksHubFilters>) {
		const href = publicBuildBacklinksPagePresenter.buildFilterUrl(filtersVm, overrides);
		void goto(href, { keepFocus: true });
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
		class="lg:sticky lg:top-24 lg:self-start"
	/>

	<div class="min-w-0 space-y-4">
		<BuildBacklinksHubListToolbar
			{filtersVm}
			{categoriesVm}
			{tagsVm}
			{filteredCount}
			{bookmarkedSlugs}
			savedSitesBySlug={savedSitesBySlug}
			onSortChange={(sort) => navigate({ sort })}
			onClearFilter={(clear) => navigate(clear)}
			onScrollToBookmark={scrollToBookmarkedSite}
		/>

		{#if sitesVm.length === 0}
			<div class="rounded-xl border border-dashed border-base-300 px-6 py-12 text-center">
				<p class="font-medium text-base-content">No sites match these filters.</p>
				<p class="mt-1 text-sm text-base-content/60">Try clearing tags or opportunity filters.</p>
			</div>
		{:else}
			{#each sitesVm as site (site.id)}
				<BuildBacklinksSiteCard
					{site}
					tagsCatalog={tagsVm}
					{filtersVm}
					isBookmarked={bookmarkedSlugSet.has(site.slug)}
					{onToggleBookmark}
					onFacetClick={handleFacetClick}
					opportunitiesOpen={expandedSiteId === site.id}
					onOpportunitiesOpenChange={(open) => setOpportunitiesOpen(site.id, open)}
				/>
			{/each}
		{/if}

		{#if filteredCount > itemsPerPage}
			<Pagination
				{itemsPerPage}
				totalItems={filteredCount}
				currentPage={listPage}
				{totalPages}
				{buildListUrl}
				nameOfItems="sites"
			/>
		{/if}
	</div>
</div>
