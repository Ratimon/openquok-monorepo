<script lang="ts">
	import { browser } from '$app/environment';

	import type { BuildBacklinksHubPageContentData } from '$lib/link-directory/buildBacklinksHubPageContent.types';
	import { PUBLIC_BUILD_BACKLINKS_HUB } from '$lib/content/constants/hubs/build-backlinks';
	import { publicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/index';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import BuildBacklinksHubCatalog from '$lib/ui/templates/build-backlinks/BuildBacklinksHubCatalog.svelte';
	import BuildBacklinksHubStats from '$lib/ui/templates/build-backlinks/BuildBacklinksHubStats.svelte';
	import BuildBacklinksSubmitModal from '$lib/ui/templates/build-backlinks/BuildBacklinksSubmitModal.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicListingsHubBreadcrumb from '$lib/ui/templates/listings/PublicListingsHubBreadcrumb.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = { data: BuildBacklinksHubPageContentData };

	let { data }: Props = $props();

	let sitesVm = $derived(data.sitesVm);
	let categoriesVm = $derived(data.categoriesVm);
	let tagsVm = $derived(data.tagsVm);
	let filtersVm = $derived(data.filtersVm);
	let schemaData = $derived(data.schemaData);
	let heroTitle = $derived(data.heroTitle);
	let heroDescription = $derived(data.heroDescription);
	let listPage = $derived(data.page);
	let itemsPerPage = $derived(data.itemsPerPage);
	let filteredCount = $derived(data.filteredCount);
	let totalPages = $derived(data.totalPages);
	let showHubFaq = $derived(data.showHubFaq);
	let statsVm = $derived(data.statsVm ?? null);
	let isLoggedIn = $derived(data.isLoggedIn === true);
	let listingsBreadcrumb = $derived(data.listingsBreadcrumb);

	let submitOpen = $state(false);

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;

	const savedSitesBySlug = $derived(
		bookmarksPresenter.buildSitesBySlugLookup(
			sitesVm.map((site) => ({ slug: site.slug, title: site.title }))
		)
	);

	$effect(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
	});

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

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="border-b border-base-300/60 pb-8">
		<div class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
			<div class="flex justify-center">
				<PublicListingsHubBreadcrumb
					kind={listingsBreadcrumb.kind}
					variant={listingsBreadcrumb.variant}
					categoryLabel={listingsBreadcrumb.categoryLabel}
					categorySlug={listingsBreadcrumb.categorySlug}
					tagLabel={listingsBreadcrumb.tagLabel}
				/>
			</div>
			{#if statsVm}
				<h1 class="text-3xl font-black tracking-tight text-balance text-base-content sm:text-4xl">
					{heroTitle}
				</h1>
				<p
					class="mx-auto max-w-3xl text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg"
				>
					{heroDescription}
				</p>
				<div class="flex justify-center pt-2">
					<BuildBacklinksHubStats {statsVm} />
				</div>
				<div class="flex justify-center pt-2">
					<Button type="button" variant="primary" onclick={() => (submitOpen = true)}>
						Suggest a site
					</Button>
				</div>
			{:else}
				<h1 class="text-2xl font-black tracking-tight text-balance sm:text-3xl">{heroTitle}</h1>
				<p class="mx-auto max-w-3xl text-base leading-relaxed text-pretty text-base-content/70">
					{heroDescription}
				</p>
				<div class="flex justify-center pt-2">
					<Button type="button" variant="primary" onclick={() => (submitOpen = true)}>
						Suggest a site
					</Button>
				</div>
			{/if}
		</div>
	</header>

	<div class="container mx-auto mt-8 max-w-6xl px-4">
		<BuildBacklinksHubCatalog
			{sitesVm}
			{categoriesVm}
			{tagsVm}
			{filtersVm}
			listPage={listPage}
			{itemsPerPage}
			{filteredCount}
			{totalPages}
			bookmarkedSlugs={bookmarksPresenter.orderedSlugs}
			savedSitesBySlug={savedSitesBySlug}
			onToggleBookmark={handleToggleBookmark}
		/>
	</div>

	{#if showHubFaq}
		<div class="container mx-auto mt-16 max-w-6xl px-4">
			<PublicFaq
				faqSubtitle={PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqSubtitle}
				faqTitle={PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqTitle}
				faqDescription={PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqDescription}
				faqItems={[...PUBLIC_BUILD_BACKLINKS_HUB.faqSection.faqItems]}
				heroTheme={landingHeroTheme}
			/>
		</div>
	{/if}
</SectionOuterContainer>

<BuildBacklinksSubmitModal
	open={submitOpen}
	onOpenChange={(next) => (submitOpen = next)}
/>
