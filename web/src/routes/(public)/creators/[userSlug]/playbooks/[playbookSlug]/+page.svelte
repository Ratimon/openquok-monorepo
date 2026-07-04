<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	import { toast } from '$lib/ui/sonner';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { getBillingPresenter } from '$lib/billing';
	import { planLimitsForTier } from 'openquok-common';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';

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
	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	let skillBuilderHref = $derived(url(`${route(getRootPathPublicSkillBuilder())}?stack=${stackVm.slug}`));

	let viewerCommunityFeaturesEnabled = $state<boolean | null>(null);
	let showUpgradeModal = $state(false);

	onMount(() => {
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

<JsonLdHead schemaData={schemaData} />

<StackDetailPage
	stack={stackVm}
	{skillBuilderHref}
	{isLoggedIn}
	commentsVm={commentsVm}
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
