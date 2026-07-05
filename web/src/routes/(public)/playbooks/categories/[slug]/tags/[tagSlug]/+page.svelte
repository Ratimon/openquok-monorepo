<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import type { ExtensionCategoryViewModel } from '$lib/listings/index';
	import type {
		ExtensionTagFilterChip,
		ExtensionTagGroupFilterChip
	} from '$lib/listings/listing.types';
	import {
		getRootPathPublicPlaybooksCategories,
		getRootPathPublicPlaybooksCategory
	} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { publicPlaybooksPagePresenter } from '$lib/area-public/index';
	import { getBillingPresenter } from '$lib/billing';
	import { isPaidSubscriptionTier } from 'openquok-common';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import PlaybooksHubCatalog from '$lib/ui/templates/playbooks/PlaybooksHubCatalog.svelte';
	import ListingsHubStats from '$lib/ui/templates/listings/ListingsHubStats.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/listings/ListingsPublicHubNav.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let playbooksVm = $derived(data.playbooksVm);
	let categoriesVm = $derived(data.categoriesVm);
	let statsVm = $derived(data.statsVm);
	let filtersVm = $derived(data.filtersVm);
	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);
	let heroTitle = $derived(data.heroTitle);
	let heroDescription = $derived(data.heroDescription);
	let heroSubtitle = $derived(data.heroSubtitle);
	let categorySlug = $derived(data.filtersVm.category ?? null);
	let tagPathSlug = $derived(page.params.tagSlug ?? '');

	const pagePresenter = publicPlaybooksPagePresenter;
	const categoriesOverviewHref = url(route(getRootPathPublicPlaybooksCategories()));
	const categoryOnlyHref = $derived(
		categorySlug ? url(route(getRootPathPublicPlaybooksCategory(categorySlug))) : categoriesOverviewHref
	);
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);
	const playbooksHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.playbooks;

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let bookmarkedIds = $state<Record<string, boolean>>({});

	onMount(() => {
		if (!browser) return;
		const categoryMissing =
			categorySlug &&
			!categoriesVm.some((category: ExtensionCategoryViewModel) => category.slug === categorySlug);
		const tagMissing =
			tagPathSlug &&
			!tagFilterVm.tags.some((tag: ExtensionTagFilterChip) => tag.slug === tagPathSlug) &&
			!tagFilterVm.groups.some((group: ExtensionTagGroupFilterChip) => group.slug === tagPathSlug);
		if (categoryMissing || tagMissing) {
			void goto(url('/not-found'), { replaceState: true });
		}
	});

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
		return pagePresenter.toggleBookmark(listingId, nextBookmarked, 'stack');
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<div class="flex flex-wrap justify-center gap-2">
			<Button variant="outline" href={categoriesOverviewHref}>View all categories</Button>
			<Button variant="outline" href={categoryOnlyHref}>View category only</Button>
		</div>
		<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">
			{heroSubtitle}
		</p>
		<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
			{heroTitle}
		</h1>
		<p class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{heroDescription}
		</p>
		<ListingsPublicHubNav active="playbooks" class="pt-1" />
		<div class="flex justify-center pt-2">
			<ListingsHubStats statsVm={statsVm} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
		<PlaybooksHubCatalog
			{playbooksVm}
			{categoriesVm}
			{filtersVm}
			{tagFilterVm}
			{isLoggedIn}
			{bookmarksPaidEnabled}
			{bookmarkedIds}
			onToggleBookmark={handleToggleBookmark}
		/>
	</div>

	<div class="container mx-auto px-4">
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
