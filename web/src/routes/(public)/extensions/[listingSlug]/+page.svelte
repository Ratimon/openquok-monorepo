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

	import ExtensionDetailPage from '$lib/ui/templates/extensions/ExtensionDetailPage.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let extensionVm = $derived(data.extensionVm);
	let relatedExtensionsVm = $derived(data.relatedExtensionsVm);
	let commentsVm = $derived((data.commentsVm ?? []) as ListingCommentViewModel[]);
	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let isBookmarked = $state(false);
	let showUpgradeModal = $state(false);

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

	const communityEnabled = $derived(viewerCommunityFeaturesEnabled ?? true);

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
		if (nextBookmarked) {
			toast.success('Extension bookmarked.');
		} else {
			toast.success('Bookmark removed.');
		}
		return { ok: true as const, bookmarked: nextBookmarked };
	}
</script>

<JsonLdHead schemaData={schemaData} />

<ExtensionDetailPage
	extension={extensionVm}
	relatedExtensions={relatedExtensionsVm}
	{commentsVm}
	{isLoggedIn}
	communityCommentsEnabled={communityEnabled}
	submitListingComment={(params) => publicExtensionBySlugPagePresenter.submitListingComment(params)}
	submitListingRating={(listingId, rating) =>
		publicExtensionBySlugPagePresenter.submitListingRating(listingId, rating)}
	submittingComment={publicExtensionBySlugPagePresenter.submittingComment}
	submittingRating={publicExtensionBySlugPagePresenter.submittingRating}
	onUpgradeRequired={() => {
		showUpgradeModal = true;
	}}
	onSignInRequired={() => {
		toast.error('Sign in to use community features.');
	}}
	{bookmarksPaidEnabled}
	upgradeHref={accountBillingHref}
	{isBookmarked}
	onToggleBookmark={handleToggleBookmark}
/>

<CommunityFeaturesLimitUpgradeModal bind:open={showUpgradeModal} upgradeHref={accountBillingHref} />
