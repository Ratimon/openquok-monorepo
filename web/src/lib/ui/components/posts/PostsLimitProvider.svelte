<script lang="ts">
	import type { Snippet } from 'svelte';

	import { setContext } from 'svelte';

	import { getRootPathAccount } from '$lib/area-protected';
	import { firstBillingGatePresenter } from '$lib/billing';
	import { route, url } from '$lib/utils/path';

	import PostsLimitUpgradeDialog from '$lib/ui/components/posts/PostsLimitUpgradeDialog.svelte';
	import { postsLimitKey, type PostsLimitContext } from '$lib/ui/components/posts/postsLimitContext';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let postsUpgradeDialogOpen = $state(false);

	const postsUsed = $derived(firstBillingGatePresenter.pricingVm?.currentVm?.posts?.used ?? 0);
	const allowedPostsPerMonth = $derived(
		firstBillingGatePresenter.pricingVm?.currentVm?.posts?.limit ?? null
	);
	const postsLimit = $derived(
		allowedPostsPerMonth != null && allowedPostsPerMonth >= 1 ? allowedPostsPerMonth : null
	);
	const isPostsLimitFull = $derived(postsLimit != null && postsUsed >= postsLimit);
	const billingHref = $derived(url(`${route(getRootPathAccount())}/billing`));

	function openUpgradeDialog() {
		postsUpgradeDialogOpen = true;
	}

	function tryCreatePost(run: () => void | Promise<void>) {
		if (isPostsLimitFull) {
			openUpgradeDialog();
			return;
		}
		void run();
	}

	function adjustPostsUsedThisMonth(delta: number) {
		if (!delta) return;
		const pricingVm = firstBillingGatePresenter.pricingVm;
		if (!pricingVm) return;
		const currentVm = pricingVm.currentVm;
		if (!currentVm?.posts || currentVm.posts.limit == null) return;

		const nextUsed = Math.max(0, currentVm.posts.used + delta);
		firstBillingGatePresenter.pricingVm = {
			plansVm: pricingVm.plansVm,
			billingEnabled: pricingVm.billingEnabled,
			currentVm: {
				...currentVm,
				posts: { ...currentVm.posts, used: nextUsed }
			}
		};
	}

	setContext(postsLimitKey, {
		isPostsLimitFull: () => isPostsLimitFull,
		openUpgradeDialog,
		tryCreatePost,
		adjustPostsUsedThisMonth
	} satisfies PostsLimitContext);
</script>

{@render children()}

<PostsLimitUpgradeDialog bind:open={postsUpgradeDialogOpen} upgradeHref={billingHref} />
