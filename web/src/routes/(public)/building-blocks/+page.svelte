<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { publicListingBookmarksPresenter } from '$lib/listings';
	import { hydratePublicListingBookmarksForHub } from '$lib/listings/utils/hydratePublicListingBookmarks';
	import { authenticationRepository } from '$lib/user-auth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import BuildingBlocksHubCatalog from '$lib/ui/templates/building-blocks/BuildingBlocksHubCatalog.svelte';
	import ListingsHubStats from '$lib/ui/templates/listings/ListingsHubStats.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/listings/ListingsPublicHubNav.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicOpportunitiesHubBreadcrumb from '$lib/ui/templates/public-hub/PublicOpportunitiesHubBreadcrumb.svelte';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';
	import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let buildingBlocksVm = $derived(data.buildingBlocksVm);
	let fullCatalogVm = $derived(data.allBuildingBlocksVm);
	let categoriesVm = $derived(data.categoriesVm);
	let statsVm = $derived(data.statsVm);
	let filtersVm = $derived(data.filtersVm);
	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);
	let heroTitle = $derived(data.heroTitle);
	let heroDescription = $derived(data.heroDescription);
	let listingsBreadcrumb = $derived(data.listingsBreadcrumb);
	let listPage = $derived(data.page);
	let itemsPerPage = $derived(data.itemsPerPage);
	let filteredCount = $derived(data.filteredCount);
	let totalPages = $derived(data.totalPages);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const buildingBlocksHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.buildingBlocks;

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

	const bookmarkedIds = $derived(publicListingBookmarksPresenter.bookmarkedIdsMap());

	$effect(() => {
		if (!browser) return;
		const loggedIn = isLoggedIn;
		void hydratePublicListingBookmarksForHub(loggedIn);
	});

	async function handleToggleBookmark(listingId: string, _nextBookmarked: boolean) {
		return publicListingBookmarksPresenter.toggleBookmark({ listingId, listingKind: 'extension' });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<div class="flex justify-center">
			<PublicOpportunitiesHubBreadcrumb {...listingsBreadcrumb} />
		</div>
		<PublicHeroTitle
			title={heroTitle}
			headingId="building-blocks-hub-heading"
			class="text-base-content sm:text-4xl lg:text-4xl"
		/>
		<p class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{heroDescription}
		</p>
		<ListingsPublicHubNav active="building-blocks" class="pt-1" />
		<div class="flex justify-center pt-2">
			<ListingsHubStats statsVm={statsVm} />
		</div>
	</header>

	<div class="container mx-auto mt-10 max-w-6xl space-y-6 px-4">
		<BuildingBlocksHubCatalog
			{buildingBlocksVm}
			{fullCatalogVm}
			{categoriesVm}
			{filtersVm}
			{tagFilterVm}
			{listPage}
			{itemsPerPage}
			{filteredCount}
			{totalPages}
			{isLoggedIn}
			{bookmarkedIds}
			onToggleBookmark={handleToggleBookmark}
		/>
	</div>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqSubtitle}
			faqTitle={PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqTitle}
			faqDescription={PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqDescription}
			faqItems={[...PUBLIC_BUILDING_BLOCKS_HUB.faqSection.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>

		<AccentSplitCtaBanner
			title={buildingBlocksHubDocsBanner.title}
			description={buildingBlocksHubDocsBanner.description}
			ctaText={buildingBlocksHubDocsBanner.ctaText}
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
