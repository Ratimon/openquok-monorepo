<script lang="ts">
	import { browser } from '$app/environment';

	import type { PageData } from './$types';

	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils';
	import { getPublicChannelBySlug } from '$lib/content/constants/channels';
	import { publicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/index';
	import { getRootPathPublicBuildBacklinksCategory } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import BuildBacklinksBookmarkButton from '$lib/ui/templates/build-backlinks/BuildBacklinksBookmarkButton.svelte';
	import BuildBacklinksOpportunityGuideSection from '$lib/ui/templates/build-backlinks/BuildBacklinksOpportunityGuideSection.svelte';
	import BuildBacklinksSiteDetailSidebar from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteDetailSidebar.svelte';
	import BuildBacklinksSiteOpportunitiesOverview from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteOpportunitiesOverview.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicListingsHubBreadcrumb from '$lib/ui/templates/listings/PublicListingsHubBreadcrumb.svelte';
	import PublicListingDetailHeroTitle from '$lib/ui/templates/titles/PublicListingDetailHeroTitle.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let siteVm = $derived(data.siteVm);
	let schemaData = $derived(data.schemaData);
	let listingsBreadcrumb = $derived(data.listingsBreadcrumb);
	let heroTitle = $derived(data.heroTitle);
	let guideSections = $derived(data.guideSections);
	let isLoggedIn = $derived(data.isLoggedIn === true);

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;

	$effect(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
	});

	const longDescriptionHtml = $derived(
		siteVm.longDescription?.trim()
			? prepareBlogRichTextForDisplay(siteVm.longDescription)
			: ''
	);

	const openquokBanner = $derived.by(() => {
		const channelSlug = siteVm.openquokChannelSlug?.trim();
		if (!channelSlug) return null;
		const channelVm = getPublicChannelBySlug(channelSlug);
		const channelLabel = channelVm?.heroTitle?.split('\n')[0]?.trim() ?? channelSlug;
		return {
			title: `Publish on ${channelLabel} with OpenQuok`,
			description:
				'Connect the channel in your workspace, then schedule posts or use plugs on opportunities that support automation.',
			ctaText: 'Connect channels guide',
			ctaHref: '/docs/channels/connect'
		};
	});

	const isSiteBookmarked = $derived(bookmarksPresenter.isBookmarked(siteVm.slug));

	const categoryHref = $derived(
		siteVm.category?.slug?.trim()
			? url(route(getRootPathPublicBuildBacklinksCategory(siteVm.category.slug.trim())))
			: null
	);

	async function handleToggleBookmark(params: { siteId: string; siteSlug: string }) {
		return bookmarksPresenter.toggleBookmark({ ...params, title: siteVm.title });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<div class="container mx-auto max-w-7xl px-4">
		<div
			class="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,18.5rem)] lg:gap-10 xl:gap-12"
		>
			<div class="min-w-0">
				<PublicListingsHubBreadcrumb
					kind={listingsBreadcrumb.kind}
					variant={listingsBreadcrumb.variant}
					siteLabel={listingsBreadcrumb.siteLabel ?? siteVm.title}
				/>

				<header class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
					{#if siteVm.logoUrl}
						<img
							src={siteVm.logoUrl}
							alt="{siteVm.title} logo"
							width="72"
							height="72"
							class="size-[4.5rem] rounded-xl border border-base-300/60 bg-base-200 object-contain"
						/>
					{/if}
					<div class="min-w-0 flex-1 space-y-2">
						<PublicListingDetailHeroTitle
							title={heroTitle}
							headingId="build-backlinks-site-heading"
						/>
						<p>
							<ExternalLink href={siteVm.siteUrl} class="link link-hover font-medium">
								{siteVm.siteUrl}
							</ExternalLink>
						</p>
						<div class="flex flex-wrap items-center gap-2">
							<BuildBacklinksBookmarkButton
								siteId={siteVm.id}
								siteSlug={siteVm.slug}
								isBookmarked={isSiteBookmarked}
								{isLoggedIn}
								onToggle={handleToggleBookmark}
							/>
							{#if siteVm.category?.name}
								{#if categoryHref}
									<InternalLink
										href={categoryHref}
										class="badge badge-outline no-underline hover:border-primary hover:bg-base-content/5"
									>
										{siteVm.category.name}
									</InternalLink>
								{:else}
									<span class="badge badge-outline">{siteVm.category.name}</span>
								{/if}
							{/if}
						</div>
					</div>
				</header>

				<div class="mt-8 lg:hidden">
					<BuildBacklinksSiteDetailSidebar site={siteVm} />
				</div>

				{#if siteVm.shortDescription?.trim()}
					<p class="mt-6 text-base leading-relaxed text-base-content/80">
						{siteVm.shortDescription}
					</p>
				{/if}

				{#if longDescriptionHtml}
					<div class="prose prose-sm mt-6 max-w-none dark:prose-invert">
						{@html longDescriptionHtml}
					</div>
				{/if}

				<div class="mt-10 space-y-6">
					{#each guideSections as section (section.sectionId)}
						{#if section.sectionId === 'howto-site'}
							<BuildBacklinksSiteOpportunitiesOverview
								heroTheme={landingHeroTheme}
								sectionId={section.sectionId}
								subtitle={section.sectionSubtitle}
								sectionTitle={section.sectionTitle}
								sectionDescription={section.sectionDescription}
								cards={section.overviewCards ?? []}
							/>
						{:else}
							<BuildBacklinksOpportunityGuideSection {section} />
						{/if}
					{/each}

					{#if openquokBanner}
						<div class="pt-6">
							<CenteredDarkCtaBanner
								title={openquokBanner.title}
								description={openquokBanner.description}
								ctaText={openquokBanner.ctaText}
								ctaHref={openquokBanner.ctaHref}
							/>
						</div>
					{/if}
				</div>
			</div>

			<aside class="hidden lg:block lg:min-h-0 lg:self-stretch">
				<div
					class="sticky top-24 z-20 max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain"
				>
					<BuildBacklinksSiteDetailSidebar site={siteVm} />
				</div>
			</aside>
		</div>
	</div>
</SectionOuterContainer>
