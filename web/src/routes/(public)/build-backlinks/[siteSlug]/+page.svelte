<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';
	import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { planLimitsForTier } from 'openquok-common';

	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils';
	import { getBillingPresenter } from '$lib/billing';
	import {
		publicBuildBacklinksBookmarksPresenter,
		publicBuildBacklinksSiteBySlugPagePresenter
	} from '$lib/link-directory/index';
	import { authenticationRepository } from '$lib/user-auth';
	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import SubjectComments from '$lib/ui/components/community/SubjectComments.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import BuildBacklinksOpportunityGuideSection from '$lib/ui/templates/build-backlinks/BuildBacklinksOpportunityGuideSection.svelte';
	import BuildBacklinksSiteEngagementBar from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteEngagementBar.svelte';
	import BuildBacklinksSiteDetailSidebar from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteDetailSidebar.svelte';
	import BuildBacklinksSiteOpportunitiesOverview from '$lib/ui/templates/build-backlinks/BuildBacklinksSiteOpportunitiesOverview.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicOpportunitiesHubBreadcrumb from '$lib/ui/templates/public-hub/PublicOpportunitiesHubBreadcrumb.svelte';
	import PublicListingDetailHeroTitle from '$lib/ui/templates/titles/PublicListingDetailHeroTitle.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let siteVm = $derived(data.siteVm);
	let commentsVm = $derived((data.commentsVm ?? []) as ListingCommentViewModel[]);
	let schemaData = $derived(data.schemaData);
	let listingsBreadcrumb = $derived(data.listingsBreadcrumb);
	let heroTitle = $derived(data.heroTitle);
	let guideSections = $derived(data.guideSections);
	let siteFaqSection = $derived(data.siteFaqSection);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;
	const siteBySlugPresenter = publicBuildBacklinksSiteBySlugPagePresenter;

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let showUpgradeModal = $state(false);
	let extraLikes = $state(0);
	let bookmarkCountDelta = $state(0);

	const communityEnabled = $derived(viewerCommunityFeaturesEnabled ?? true);
	let displayLikes = $derived(siteVm.likes + extraLikes);
	let displaySiteVm = $derived({
		...siteVm,
		bookmarkCount: Math.max(0, siteVm.bookmarkCount + bookmarkCountDelta)
	});

	// /account/billing
	const rootPathAccount = getRootPathAccount();
	const accountBillingHref = url(`${route(rootPathAccount)}/billing`);

	$effect(() => {
		siteVm.id;
		bookmarkCountDelta = 0;
		extraLikes = 0;
	});

	$effect(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
	});

	$effect(() => {
		if (!browser || !isLoggedIn) {
			viewerCommunityFeaturesEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			viewerCommunityFeaturesEnabled = vm ? planLimitsForTier(vm.tier).community_features : false;
		});
		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		if (!browser || !siteVm?.id) return;
		void siteBySlugPresenter.recordSiteView(siteVm.id);
	});

	const longDescriptionHtml = $derived(
		siteVm.longDescription?.trim()
			? prepareBlogRichTextForDisplay(siteVm.longDescription)
			: ''
	);

	const isSiteBookmarked = $derived(bookmarksPresenter.isBookmarked(siteVm.slug));

	const signUpPath = $derived(route(getRootPathSignup()));

	async function handleToggleBookmark(params: { siteId: string; siteSlug: string }) {
		const result = await bookmarksPresenter.toggleBookmark({ ...params, title: siteVm.title });
		if (result.ok && params.siteId === siteVm.id) {
			bookmarkCountDelta += result.bookmarked ? 1 : -1;
		}
		return result;
	}

	async function handleLike() {
		const result = await siteBySlugPresenter.incrementSiteLikes(siteVm.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	const siteSidebarProps = $derived({
		site: displaySiteVm,
		displayLikes,
		isLoggedIn,
		isBookmarked: isSiteBookmarked,
		onToggleBookmark: handleToggleBookmark,
		communityEnabled,
		submitRating: (siteId: string, rating: number) =>
			siteBySlugPresenter.submitSiteRating(siteId, rating),
		submittingRating: siteBySlugPresenter.submittingRating,
		onRatingSignInRequired: () => {
			toast.error('Sign in to use community features.');
		},
		onRatingUpgradeRequired: () => {
			showUpgradeModal = true;
		}
	});
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<div class="container mx-auto max-w-7xl px-4">
		<div
			class="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,18.5rem)] lg:gap-10 xl:gap-12"
		>
			<div class="min-w-0">
				<PublicOpportunitiesHubBreadcrumb
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
					</div>
				</header>

				<BuildBacklinksSiteEngagementBar
					class="mt-6"
					siteTitle={siteVm.title}
					siteSlug={siteVm.slug}
					shareText={siteVm.shortDescription}
					{displayLikes}
					onLike={handleLike}
					likeDisabled={siteBySlugPresenter.submittingLike}
				/>

				<div class="mt-8 lg:hidden">
					<BuildBacklinksSiteDetailSidebar {...siteSidebarProps} />
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

					<PublicFaq
						heroTheme={landingHeroTheme}
						faqSubtitle={siteFaqSection.faqSubtitle}
						faqTitle={siteFaqSection.faqTitle}
						faqDescription={siteFaqSection.faqDescription}
						faqItems={siteFaqSection.faqItems}
						sectionClass="mt-16 pt-10 border-t border-base-content/10"
					/>

					<section class="border-t border-base-content/10 py-10">
						<SubjectComments
							{commentsVm}
							subjectId={siteVm.id}
							{isLoggedIn}
							submitComment={(params) =>
								siteBySlugPresenter.submitSiteComment({
									siteId: params.subjectId,
									content: params.content,
									parentId: params.parentId
								})}
							submittingComment={siteBySlugPresenter.submittingComment}
							communityCommentsEnabled={communityEnabled}
							onUpgradeRequired={() => {
								showUpgradeModal = true;
							}}
						/>
					</section>

					<div class="pt-6">
						<CenteredDarkCtaBanner
							title={CENTERED_DARK_CTA_BANNER_TITLE}
							description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
							ctaText={PUBLIC_BANNER_CTA_TEXT}
							ctaHref={signUpPath}
							sectionClass="pb-4 sm:pb-6"
						/>
					</div>
				</div>
			</div>

			<aside class="hidden lg:block lg:min-h-0 lg:self-stretch">
				<div
					class="sticky top-24 z-20 max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain"
				>
					<BuildBacklinksSiteDetailSidebar {...siteSidebarProps} />
				</div>
			</aside>
		</div>
	</div>
</SectionOuterContainer>

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeModal}
	upgradeHref={accountBillingHref}
/>
