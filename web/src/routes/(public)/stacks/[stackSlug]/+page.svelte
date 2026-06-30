<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';

	import { toast } from '$lib/ui/sonner';
	import { getBillingPresenter } from '$lib/billing';
	import { planLimitsForTier } from 'openquok-common';
	import { authenticationRepository } from '$lib/user-auth';

	import {
		publicExtensionBySlugPagePresenter,
		publicStackBySlugPagePresenter
	} from '$lib/area-public';

	import StackDetailPage from '$lib/ui/templates/stacks/StackDetailPage.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let stackVm = $derived(data.stackVm);
	let commentsVm = $derived(data.commentsVm);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let showUpgradeModal = $state(false);

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

	const communityEnabled = $derived(viewerCommunityFeaturesEnabled ?? true);

	async function handleClone() {
		if (!stackVm) return;
		if (!isLoggedIn) {
			toast.error('Sign in to clone this stack.');
			return;
		}
		if (!communityEnabled) {
			showUpgradeModal = true;
			return;
		}
		const result = await publicStackBySlugPagePresenter.cloneStack(stackVm.id);
		if (result.ok) {
			toast.success('Stack cloned as a new draft.');
			return;
		}
		toast.error(result.error);
	}
</script>

<JsonLdHead
	schemaData={{
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: stackVm.title,
		description: stackVm.excerpt ?? stackVm.description
	}}
/>

<StackDetailPage
	stack={stackVm}
	{isLoggedIn}
	comments={commentsVm}
	communityCommentsEnabled={communityEnabled}
	onClone={handleClone}
	cloning={publicStackBySlugPagePresenter.submittingClone}
	submitListingComment={(params) => publicExtensionBySlugPagePresenter.submitListingComment(params)}
	submitListingRating={(listingId, rating) =>
		publicExtensionBySlugPagePresenter.submitListingRating(listingId, rating)}
	submittingComment={publicExtensionBySlugPagePresenter.submittingComment}
	submittingRating={publicExtensionBySlugPagePresenter.submittingRating}
	onUpgradeRequired={() => {
		showUpgradeModal = true;
	}}
	onSignInRequired={() => {
		toast.error('Sign in to rate this stack.');
	}}
/>

<CommunityFeaturesLimitUpgradeModal bind:open={showUpgradeModal} upgradeHref="/account/billing" />
