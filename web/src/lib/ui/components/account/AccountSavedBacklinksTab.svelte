<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type {
		BuildBacklinksHubFilters,
		LinkDirectoryCategoryDto,
		LinkDirectorySiteDto,
		LinkDirectoryTagDto
	} from '$lib/link-directory/link-directory.types';

	import { getRootPathAccount } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import { directorySiteKeyFromProviderSlug } from '$lib/auto-launch/buildDirectoryAddChannelTiles';
	import { publicBuildBacklinksBookmarksPresenter, linkDirectoryRepository } from '$lib/link-directory/index';
	import { resolveBuildBacklinksHubCatalog } from '$lib/link-directory/utils/resolveBuildBacklinksHubCatalog';
	import { route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import {
		buildAccountSavedBacklinksNavigationUrl,
		parseAccountSavedBacklinksFiltersFromUrl
	} from '$lib/area-protected/utils/buildAccountSavedHubSearch';
	import { parseHubListPagination } from '$lib/listings/utils/hubListPagination';
	import { toast } from '$lib/ui/sonner';

	import BuildBacklinksHubCatalog from '$lib/ui/templates/build-backlinks/BuildBacklinksHubCatalog.svelte';
	import BuildBacklinksSavedSitesPanel from '$lib/ui/templates/build-backlinks/BuildBacklinksSavedSitesPanel.svelte';
	import HubAccountSignInCtaInlineHint from '$lib/ui/components/account/HubAccountSignInCtaInlineHint.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		isLoggedIn: boolean;
	};

	let { isLoggedIn }: Props = $props();

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;

	const orderedSlugs = $derived(bookmarksPresenter.orderedSlugs);
	const bookmarkedSlugs = $derived(orderedSlugs);
	const bookmarksHydrating = $derived(bookmarksPresenter.hydrating);
	const canReorder = $derived(bookmarksPresenter.canReorder);

	const hasUnsavedShortlist = $derived(bookmarksPresenter.hasUnsavedShortlistChanges());
	const savingShortlist = $derived(bookmarksPresenter.savingShortlist);

	const filtersVm = $derived(parseAccountSavedBacklinksFiltersFromUrl(page.url.searchParams));
	const listPagination = $derived(parseHubListPagination(page.url.searchParams));

	let catalogLoading = $state(false);
	let catalogLoadError = $state<string | null>(null);
	let sitesVm = $state<LinkDirectorySiteDto[]>([]);
	let categoriesVm = $state<LinkDirectoryCategoryDto[]>([]);
	let tagsVm = $state<LinkDirectoryTagDto[]>([]);
	let filteredCount = $state(0);
	let totalPages = $state(1);
	let tagNotFound = $state(false);
	let launchableSiteSlugs = $state<Set<string>>(new Set());

	const accountProductsHref = $derived(
		url(`${route(getRootPathAccount())}?tab=products`)
	);

	const catalogSitesForLookup = $derived(
		sitesVm.map((site) => ({ slug: site.slug, title: site.title }))
	);

	const savedSitesBySlug = $derived(
		bookmarksPresenter.buildSitesBySlugLookup(catalogSitesForLookup)
	);

	let catalogRequestId = 0;

	async function loadCatalogFromUrl() {
		if (!browser) return;
		const requestId = ++catalogRequestId;
		catalogLoading = true;
		catalogLoadError = null;
		try {
			const result = await resolveBuildBacklinksHubCatalog({
				filters: filtersVm,
				pagination: listPagination,
				bookmarkedSiteSlugs: orderedSlugs
			});
			if (requestId !== catalogRequestId) return;
			sitesVm = result.sitesVm;
			categoriesVm = result.categoriesVm;
			tagsVm = result.tagsVm;
			filteredCount = result.filteredCount;
			totalPages = result.totalPages;
			tagNotFound = result.tagNotFound;
		} catch {
			if (requestId !== catalogRequestId) return;
			catalogLoadError = 'Could not load the backlink catalog. Try again in a moment.';
			sitesVm = [];
			filteredCount = 0;
			totalPages = 1;
		} finally {
			if (requestId === catalogRequestId) {
				catalogLoading = false;
			}
		}
	}

	$effect(() => {
		if (!browser) return;
		void filtersVm;
		void listPagination.page;
		void listPagination.itemsPerPage;
		void orderedSlugs.length;
		void loadCatalogFromUrl();
	});

	async function loadLaunchableSiteSlugs() {
		if (!isLoggedIn) {
			launchableSiteSlugs = new Set();
			return;
		}
		try {
			const [destinations, publishedSites] = await Promise.all([
				autoLaunchRepository.listDestinations(),
				linkDirectoryRepository.getPublishedSites({ limit: 500, skip: 0 })
			]);
			const publishedSlugs = publishedSites.sites.map((s) => s.slug);
			const slugs = new Set<string>();
			for (const destination of destinations) {
				if (destination.submissionPath !== 'extension') continue;
				slugs.add(directorySiteKeyFromProviderSlug(destination.providerSlug, publishedSlugs));
			}
			launchableSiteSlugs = slugs;
		} catch {
			launchableSiteSlugs = new Set();
		}
	}

	onMount(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
		void loadLaunchableSiteSlugs();
	});

	function buildFilterUrl(
		current: BuildBacklinksHubFilters,
		overrides: Partial<BuildBacklinksHubFilters>
	): string {
		return buildAccountSavedBacklinksNavigationUrl(page.url.pathname, current, overrides);
	}

	function handleMove(siteSlug: string, direction: 'up' | 'down') {
		const result = bookmarksPresenter.moveBookmark(siteSlug, direction);
		if (!result.ok && result.error) {
			toast.error(result.error);
		}
	}

	async function handleSaveShortlist() {
		const result = await bookmarksPresenter.saveShortlist();
		if (result.ok) {
			toast.success('Shortlist saved');
		} else if (result.error) {
			toast.error(result.error);
		}
	}

	async function handleToggleBookmark(params: {
		siteId: string;
		siteSlug: string;
		title?: string;
	}) {
		const title =
			params.title ??
			sitesVm.find((site) => site.slug === params.siteSlug)?.title ??
			undefined;
		return bookmarksPresenter.toggleBookmark({ ...params, title });
	}
</script>

<div class="space-y-10">
	<HubAccountSignInCtaInlineHint variant="backlinks" {isLoggedIn} />

	<section class="space-y-4" aria-labelledby="saved-backlinks-shortlist-heading">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h2 id="saved-backlinks-shortlist-heading" class="text-lg font-semibold text-base-content">
					Your shortlist
				</h2>
				<p class="mt-1 text-sm text-base-content/65">
					Reorder saved sites, then launch with the extension and mark progress per product.
				</p>
			</div>
			{#if isLoggedIn}
				<div class="flex flex-wrap items-center gap-2">
					<AddDirectoryLaunch
						buttonLabel="Add Channel"
						buttonVariant="secondary"
						buttonClass="btn-sm"
						sitePickerFirst={true}
					/>
					<Button href={accountProductsHref} variant="outline" size="sm" class="gap-1.5">
						<AbstractIcon name={icons.Rocket.name} class="h-4 w-4" width="16" height="16" />
						Launch checklist
					</Button>
				</div>
			{/if}
		</div>

		{#if bookmarksHydrating}
			<p class="text-sm text-base-content/60">Loading your saved sites…</p>
		{:else if orderedSlugs.length === 0}
			<div class="rounded-xl border border-base-300/60 bg-base-200/40 p-6 text-center">
				<p class="text-base font-medium">No backlink sites saved yet</p>
				<p class="mt-1 text-sm text-base-content/65">
					Bookmark sites in the catalog below, or start a directory launch from a product profile.
				</p>
				{#if isLoggedIn}
					<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
						<AddDirectoryLaunch
							buttonLabel="Add Channel"
							buttonVariant="secondary"
							buttonClass="btn-sm"
							sitePickerFirst={true}
						/>
						<Button href={accountProductsHref} variant="outline" size="sm" class="gap-1.5">
							<AbstractIcon name={icons.Rocket.name} class="h-4 w-4" width="16" height="16" />
							Launch checklist
						</Button>
					</div>
				{/if}
			</div>
		{:else}
			<BuildBacklinksSavedSitesPanel
				{orderedSlugs}
				sitesBySlug={savedSitesBySlug}
				{canReorder}
				launchableSiteSlugs={launchableSiteSlugs}
				showDirectoryLaunchActions={isLoggedIn}
				onMove={handleMove}
			/>
			{#if canReorder}
				<div class="flex flex-wrap items-center justify-between gap-3">
					<p class="text-xs text-base-content/50">
						{#if hasUnsavedShortlist}
							You have unsaved shortlist changes.
						{:else}
							Reorder, then save when you are finished.
						{/if}
					</p>
					<Button
						type="button"
						variant="primary"
						size="sm"
						disabled={!hasUnsavedShortlist || savingShortlist}
						onclick={handleSaveShortlist}
					>
						{savingShortlist ? 'Saving…' : 'Save shortlist'}
					</Button>
				</div>
			{/if}
		{/if}
	</section>

	<section class="space-y-4" aria-labelledby="saved-backlinks-catalog-heading">
		<div>
			<h2 id="saved-backlinks-catalog-heading" class="text-lg font-semibold text-base-content">
				Browse catalog
			</h2>
			<p class="mt-1 text-sm text-base-content/65">
				Filter backlink opportunities without leaving Saved.
			</p>
		</div>

		{#if catalogLoadError}
			<div class="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
				{catalogLoadError}
				<button type="button" class="ml-2 underline" onclick={() => void loadCatalogFromUrl()}>
					Retry
				</button>
			</div>
		{:else if catalogLoading && sitesVm.length === 0}
			<p class="text-sm text-base-content/60">Loading catalog…</p>
		{:else if tagNotFound}
			<div class="rounded-xl border border-dashed border-base-300 px-6 py-12 text-center">
				<p class="font-medium text-base-content">Tag not found</p>
				<p class="mt-1 text-sm text-base-content/60">Clear the tag filter to browse all sites.</p>
				<div class="mt-4">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => {
							const href = buildFilterUrl(filtersVm, { tags: undefined });
							void goto(href, { keepFocus: true, noScroll: true });
						}}
					>
						Clear tag filter
					</Button>
				</div>
			</div>
		{:else}
			<BuildBacklinksHubCatalog
				{sitesVm}
				{categoriesVm}
				{tagsVm}
				{filtersVm}
				listPage={listPagination.page}
				itemsPerPage={listPagination.itemsPerPage}
				{filteredCount}
				{totalPages}
				{bookmarkedSlugs}
				onToggleBookmark={handleToggleBookmark}
				linkMode="inPlace"
				{buildFilterUrl}
				{isLoggedIn}
			/>
		{/if}
	</section>
</div>
