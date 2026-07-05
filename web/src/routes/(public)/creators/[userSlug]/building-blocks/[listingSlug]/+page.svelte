<script lang="ts">
	import type { PageData } from './$types';
	import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { toast } from '$lib/ui/sonner';
	import { getBillingPresenter } from '$lib/billing';
	import { isPaidSubscriptionTier, planLimitsForTier } from 'openquok-common';
	import { getRootPathAccount } from '$lib/area-protected';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';

	import { publicExtensionBySlugPagePresenter } from '$lib/area-public/index';
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { showListingBookmarkToast } from '$lib/listings';
	import { loadExtensionDetailComponent } from '$lib/listings/utils/loadExtensionDetailComponent';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import ListingHubBreadcrumb from '$lib/ui/components/extensions/ListingHubBreadcrumb.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import ListingComments from '$lib/ui/components/extensions/ListingComments.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let extensionVm = $derived(data.extensionVm);
	let relatedExtensionsVm = $derived(data.relatedExtensionsVm);
	let commentsVm = $derived((data.commentsVm ?? []) as ListingCommentViewModel[]);
	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

	// /account/billing
	const rootPathAccount = getRootPathAccount();
	const accountBillingHref = url(`${route(rootPathAccount)}/billing`);

	// /building-blocks
	const rootPathPublicBuildingBlocks = getRootPathPublicBuildingBlocks();
	const buildingBlocksHubHref = url(route(rootPathPublicBuildingBlocks));

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let isBookmarked = $state(false);
	let showUpgradeModal = $state(false);
	let extraLikes = $state(0);
	let expandedRelatedId = $state<string | null>(null);

	const communityEnabled = $derived(viewerCommunityFeaturesEnabled ?? true);
	let displayLikes = $derived(extensionVm.likes + extraLikes);

	$effect(() => {
		if (!browser || !isLoggedIn) {
			viewerCommunityFeaturesEnabled = null;
			bookmarksPaidEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			viewerCommunityFeaturesEnabled = vm ? planLimitsForTier(vm.tier).community_features : false;
			bookmarksPaidEnabled = vm ? isPaidSubscriptionTier(vm.tier) : false;
		});
		return () => {
			cancelled = true;
		};
	});

	onMount(() => {
		if (!browser || !extensionVm?.id) return;
		void publicExtensionBySlugPagePresenter.trackExtensionView(extensionVm.id);
	});

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await publicExtensionBySlugPagePresenter.toggleBookmark(listingId, nextBookmarked);
		if (!result.ok) {
			toast.error(result.error);
			return result;
		}
		if (listingId === extensionVm?.id) {
			isBookmarked = nextBookmarked;
		}
		showListingBookmarkToast(nextBookmarked, 'extension');
		return { ok: true as const, bookmarked: nextBookmarked };
	}

	async function handleLike() {
		const result = await publicExtensionBySlugPagePresenter.trackExtensionLike(extensionVm.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	function handleExternalClick() {
		void publicExtensionBySlugPagePresenter.trackExtensionClick(extensionVm.id);
	}

	function toggleRelatedExpanded(id: string) {
		expandedRelatedId = expandedRelatedId === id ? null : id;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		<ListingHubBreadcrumb
			hubHref={buildingBlocksHubHref}
			hubLabel="Building Blocks"
			owner={extensionVm.owner}
			pageTitle={extensionVm.title}
			class="mb-4"
		/>
		{#await loadExtensionDetailComponent(extensionVm.extensionType) then { default: ExtensionDetail }}
			<ExtensionDetail
				{extensionVm}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={publicExtensionBySlugPagePresenter.submittingLike}
				{isBookmarked}
				{isLoggedIn}
				{bookmarksPaidEnabled}
				upgradeHref={accountBillingHref}
				onToggleBookmark={handleToggleBookmark}
				communityEnabled={communityEnabled}
				submitRating={(listingId, rating) =>
					publicExtensionBySlugPagePresenter.submitListingRating(listingId, rating)}
				submittingRating={publicExtensionBySlugPagePresenter.submittingRating}
				onRatingSignInRequired={() => {
					toast.error('Sign in to use community features.');
				}}
				onRatingUpgradeRequired={() => {
					showUpgradeModal = true;
				}}
			/>
		{/await}

		{#if relatedExtensionsVm.length > 0}
			<section class="border-t border-base-content/10 py-10">
				<h2 class="mb-4 text-xl font-bold">
					Related extensions
				</h2>
				<ul class="space-y-4">
					{#each relatedExtensionsVm as relatedVm (relatedVm.id)}
						<li>
							<ExtensionCard
								extensionVm={relatedVm}
								expanded={expandedRelatedId === relatedVm.id}
								onToggle={toggleRelatedExpanded}
								showBookmark={true}
								isBookmarked={false}
								{isLoggedIn}
								{bookmarksPaidEnabled}
								upgradeHref={accountBillingHref}
								onToggleBookmark={handleToggleBookmark}
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="border-t border-base-content/10 py-10">
			<ListingComments
				{commentsVm}
				listingId={extensionVm.id}
				{isLoggedIn}
				submitListingComment={(params) =>
					publicExtensionBySlugPagePresenter.submitListingComment(params)}
				submittingComment={publicExtensionBySlugPagePresenter.submittingComment}
				communityCommentsEnabled={communityEnabled}
				onUpgradeRequired={() => {
					showUpgradeModal = true;
				}}
			/>
		</section>
	</article>
</SectionOuterContainer>

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeModal}
	upgradeHref={accountBillingHref}
/>
