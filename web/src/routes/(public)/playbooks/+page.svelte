<script lang="ts">
	import type { PageData } from './$types';
	import type { ExtensionSort, StacksHubFilters } from '$lib/listings/index';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { publicStacksPagePresenter } from '$lib/area-public/index';
	import { getBillingPresenter } from '$lib/billing';
	import { showListingBookmarkToast } from '$lib/listings';
	import { isPaidSubscriptionTier } from 'openquok-common';
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

	import { PUBLIC_PLAYBOOKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import ExtensionsCategorySidebar from '$lib/ui/templates/extensions/ExtensionsCategorySidebar.svelte';
	import ExtensionsHubStats from '$lib/ui/templates/extensions/ExtensionsHubStats.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/extensions/ListingsPublicHubNav.svelte';
	import ExtensionsSearchBar from '$lib/ui/templates/extensions/ExtensionsSearchBar.svelte';
	import ExtensionsTagFilter from '$lib/ui/templates/extensions/ExtensionsTagFilter.svelte';
	import StackHubCard from '$lib/ui/templates/stacks/StackHubCard.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let stacksVm = $derived(data.stacksVm);
	let categoriesVm = $derived(data.categoriesVm);
	let statsVm = $derived(data.statsVm);
	let filtersVm = $derived(data.filtersVm);
	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);

	const pagePresenter = publicStacksPagePresenter;

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const playbooksHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.playbooks;

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);

	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let bookmarkedIds = $state<Record<string, boolean>>({});

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
		const result = await pagePresenter.toggleBookmark(listingId, nextBookmarked, 'stack');
		if (result.ok) {
			bookmarkedIds = { ...bookmarkedIds, [listingId]: nextBookmarked };
			showListingBookmarkToast(nextBookmarked, 'stack');
		} else {
			toast.error(result.error);
		}
		return result;
	}

	const PLAYBOOKS_GRID_PAGE_SIZE = 20;

	let visibleCount = $state(PLAYBOOKS_GRID_PAGE_SIZE);
	let searchDraft = $derived(filtersVm.search ?? '');

	let visibleStacks = $derived(stacksVm.slice(0, visibleCount));
	let remainingCount = $derived(Math.max(0, stacksVm.length - visibleCount));
	let hasMoreStacks = $derived(remainingCount > 0);

	const sortOptions: { id: ExtensionSort; label: string }[] = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'popular', label: 'Most liked' },
		{ id: 'views', label: 'Most viewed' }
	];

	function navigateFilters(overrides: Partial<StacksHubFilters>) {
		visibleCount = PLAYBOOKS_GRID_PAGE_SIZE;
		const href = pagePresenter.buildFilterUrl(page.url.pathname, filtersVm, overrides);
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

	function handleCategorySelect(slug: string | null) {
		navigateFilters({ category: slug ?? undefined });
	}

	function handleSortChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as ExtensionSort;
		navigateFilters({ sort: value });
	}

	function showMoreStacks() {
		visibleCount = Math.min(visibleCount + PLAYBOOKS_GRID_PAGE_SIZE, stacksVm.length);
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">
			{PUBLIC_PLAYBOOKS_HUB.subtitle}
		</p>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{PUBLIC_PLAYBOOKS_HUB.title}
		</h1>
		<p class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{PUBLIC_PLAYBOOKS_HUB.description}
		</p>
		<ListingsPublicHubNav active="playbooks" class="pt-1" />
		<div class="flex justify-center pt-2">
			<ExtensionsHubStats statsVm={statsVm} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<ExtensionsSearchBar
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

		<ExtensionsTagFilter
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
				<ExtensionsCategorySidebar
					categoriesVm={categoriesVm}
					activeCategorySlug={filtersVm.category ?? null}
					onSelect={handleCategorySelect}
				/>
			</aside>

			<section aria-label="Playbook listings">
				{#if stacksVm.length === 0}
					<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
						No playbooks match your filters yet.
					</p>
				{:else}
					<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each visibleStacks as stackVm (stackVm.id)}
							<li>
								<StackHubCard
									{stackVm}
									showBookmark={true}
									isBookmarked={bookmarkedIds[stackVm.id] === true}
									{isLoggedIn}
									{bookmarksPaidEnabled}
									upgradeHref={accountBillingHref}
									onToggleBookmark={handleToggleBookmark}
								/>
							</li>
						{/each}
					</ul>
					{#if hasMoreStacks}
						<div class="mt-8 flex justify-center">
							<button
								type="button"
								class="btn btn-outline btn-warning rounded-full px-6"
								onclick={showMoreStacks}
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
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_PLAYBOOKS_HUB.faqSection.faqSubtitle}
			faqTitle={PUBLIC_PLAYBOOKS_HUB.faqSection.faqTitle}
			faqDescription={PUBLIC_PLAYBOOKS_HUB.faqSection.faqDescription}
			faqItems={[...PUBLIC_PLAYBOOKS_HUB.faqSection.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>

		<AccentSplitCtaBanner
			title={playbooksHubDocsBanner.title}
			description={playbooksHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={playbooksHubDocsBanner.docsPath}
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
