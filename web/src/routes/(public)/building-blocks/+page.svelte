<script lang="ts">
	import type { PageData } from './$types';
	import type { ExtensionSort, ExtensionTypeFilter, ExtensionsHubFilters } from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { publicExtensionsPagePresenter } from '$lib/area-public/index';
	import { getBillingPresenter } from '$lib/billing';
	import { showListingBookmarkToast } from '$lib/listings';
	import { isPaidSubscriptionTier } from 'openquok-common';
	import { serializeExtensionSlugs } from '$lib/stack-builder/utils/parseBuilderQuery';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import ExtensionsCategorySidebar from '$lib/ui/templates/extensions/ExtensionsCategorySidebar.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import ExtensionsHubStats from '$lib/ui/templates/extensions/ExtensionsHubStats.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/extensions/ListingsPublicHubNav.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTypeChips from '$lib/ui/templates/extensions/ExtensionsTypeChips.svelte';
	import ExtensionsTagFilter from '$lib/ui/templates/extensions/ExtensionsTagFilter.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let extensionsVm = $derived(data.extensionsVm);
	let categoriesVm = $derived(data.categoriesVm);
	let statsVm = $derived(data.statsVm);
	let filtersVm = $derived(data.filtersVm);
	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);

	const pagePresenter = publicExtensionsPagePresenter;

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const buildingBlocksHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.buildingBlocks;

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const skillBuilderHref = url(route(getRootPathPublicSkillBuilder()));

	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let bookmarkedIds = $state<Record<string, boolean>>({});
	let selectedExtensionIds = $state<string[]>([]);

	onMount(() => {
		if (!browser || !isLoggedIn) {
			bookmarksPaidEnabled = null;
			bookmarkedIds = {};
			return;
		}

		let cancelled = false;
		void (async () => {
			const vm = await getBillingPresenter.loadOwnedAccountBillingVmStateless();
			if (cancelled) return;
			bookmarksPaidEnabled = vm ? isPaidSubscriptionTier(vm.tier) : false;
			if (!bookmarksPaidEnabled) {
				bookmarkedIds = {};
				return;
			}
			const map = await pagePresenter.loadBookmarkedIdsMap();
			if (!cancelled) bookmarkedIds = map;
		})();

		return () => {
			cancelled = true;
		};
	});

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await pagePresenter.toggleBookmark(listingId, nextBookmarked, 'extension');
		if (result.ok) {
			bookmarkedIds = { ...bookmarkedIds, [listingId]: nextBookmarked };
			showListingBookmarkToast(nextBookmarked, 'extension');
		} else {
			toast.error(result.error);
		}
		return result;
	}

	const EXTENSIONS_GRID_PAGE_SIZE = 20;

	let expandedId = $state<string | null>(null);
	let searchDraft = $derived(filtersVm.search ?? '');
	let visibleCount = $state(EXTENSIONS_GRID_PAGE_SIZE);

	let visibleExtensions = $derived(extensionsVm.slice(0, visibleCount));
	let remainingCount = $derived(Math.max(0, extensionsVm.length - visibleCount));
	let hasMoreExtensions = $derived(remainingCount > 0);
	let selectedExtensions = $derived(
		extensionsVm.filter((extensionVm) => selectedExtensionIds.includes(extensionVm.id))
	);
	let selectedCount = $derived(selectedExtensions.length);

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

	function handleCategorySelect(slug: string | null) {
		navigateFilters({ category: slug ?? undefined });
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
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Building Blocks</p>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{metaTitle}
		</h1>
		<p class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{metaDescription}
		</p>
		<ListingsPublicHubNav active="building-blocks" class="pt-1" />
		<div class="flex justify-center pt-2">
			<ExtensionsHubStats statsVm={statsVm} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
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

		<ExtensionsTypeChips
			activeType={filtersVm.type ?? 'all'}
			onSelect={handleTypeSelect}
		/>

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
					categoriesVm={categoriesVm}
					activeCategorySlug={filtersVm.category ?? null}
					onSelect={handleCategorySelect}
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
									extensionVm={extensionVm}
									expanded={expandedId === extensionVm.id}
									onToggle={toggleExpanded}
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

	<div class="container mx-auto px-4">
		<AccentSplitCtaBanner
			title={buildingBlocksHubDocsBanner.title}
			description={buildingBlocksHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={buildingBlocksHubDocsBanner.docsPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
