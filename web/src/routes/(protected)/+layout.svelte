<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';
	import FirstBilling from '$lib/ui/components/billing/FirstBilling.svelte';
	import PostsLimitProvider from '$lib/ui/components/posts/PostsLimitProvider.svelte';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { firstBillingGatePresenter, ownedAccountBillingPresenter, preloadStripe } from '$lib/billing';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { authenticationRepository } from '$lib/user-auth/index';

	type ProtectedLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: ProtectedLayoutProps = $props();

	const companyName = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');
	const currentUser = $derived(
		(data as App.LayoutData)?.currentUser ?? authenticationRepository.currentUser ?? null
	);
	const isPlatformAdmin = $derived(
		(currentUser as { isPlatformAdmin?: boolean } | null)?.isPlatformAdmin === true
	);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const checkoutBypass = $derived(firstBillingGatePresenter.isCheckoutBypassed(checkoutId));
	const checkoutReturnInFlight = $derived(
		Boolean(checkoutId) &&
			firstBillingGatePresenter.checkoutReturnInFlightFor === checkoutId
	);
	const currentWorkspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	/** Hold the shell until billing gate is known — avoids flashing the free dashboard. */
	const gatePending = $derived(
		!isPlatformAdmin &&
			!checkoutBypass &&
			!checkoutReturnInFlight &&
			!firstBillingGatePresenter.hasResolvedGate(currentWorkspaceId)
	);

	const showFirstBilling = $derived(
		!isPlatformAdmin &&
			firstBillingGatePresenter.restrictFreeUser &&
			!checkoutBypass &&
			!checkoutReturnInFlight
	);

	$effect(() => {
		workspaceSettingsPresenter.currentWorkspaceId;
		void firstBillingGatePresenter.evaluate();
	});

	$effect(() => {
		if (!browser || (!showFirstBilling && !gatePending)) return;
		// Begin Stripe.js while the gate resolves / FirstBilling mounts.
		void preloadStripe();
	});

	$effect(() => {
		if (!browser || !checkoutId) return;
		if (!firstBillingGatePresenter.tryBeginCheckoutReturn(checkoutId)) return;

		void (async () => {
			try {
				const result =
					await protectedBillingPagePresenter.completeHostedCheckoutReturn(checkoutId);
				await firstBillingGatePresenter.evaluate({ force: true });
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

{#if gatePending}
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
