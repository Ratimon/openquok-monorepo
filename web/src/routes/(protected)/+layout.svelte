<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';
	import FirstBilling from '$lib/ui/components/billing/FirstBilling.svelte';
	import PostsLimitProvider from '$lib/ui/components/posts/PostsLimitProvider.svelte';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { firstBillingGatePresenter, ownedAccountBillingPresenter } from '$lib/billing';
	import { workspaceSettingsPresenter } from '$lib/settings';

	type ProtectedLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: ProtectedLayoutProps = $props();

	const companyName = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const checkoutBypass = $derived(firstBillingGatePresenter.isCheckoutBypassed(checkoutId));
	const checkoutReturnInFlight = $derived(
		Boolean(checkoutId) &&
			firstBillingGatePresenter.checkoutReturnInFlightFor === checkoutId
	);

	const gateLoading = $derived(
		firstBillingGatePresenter.loading && !checkoutBypass && !checkoutReturnInFlight
	);
	const showFirstBilling = $derived(
		firstBillingGatePresenter.restrictFreeUser && !checkoutBypass && !checkoutReturnInFlight
	);

	$effect(() => {
		workspaceSettingsPresenter.currentWorkspaceId;
		page.url.pathname;
		void firstBillingGatePresenter.evaluate();
	});

	$effect(() => {
		if (!browser || !checkoutId) return;
		if (!firstBillingGatePresenter.tryBeginCheckoutReturn(checkoutId)) return;

		void (async () => {
			try {
				const result =
					await protectedBillingPagePresenter.completeHostedCheckoutReturn(checkoutId);
				await firstBillingGatePresenter.evaluate({ blocking: true });
				void ownedAccountBillingPresenter.load();
				const subscriptionReady = !firstBillingGatePresenter.restrictFreeUser;
				if (result !== 'pending_confirmation' && subscriptionReady) {
					firstBillingGatePresenter.markCheckoutResolved(checkoutId);
				}
			} finally {
				firstBillingGatePresenter.endCheckoutReturn();
			}
		})();
	});
</script>

<SetPostingScheduleTimezone />

{#if gateLoading}
	<div class="flex min-h-screen items-center justify-center bg-base-200">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if showFirstBilling}
	<FirstBilling {companyName} />
{:else}
	<PostsLimitProvider>
		{@render children?.()}
	</PostsLimitProvider>
{/if}
