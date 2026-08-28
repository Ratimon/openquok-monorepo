<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';
	import FirstBilling from '$lib/ui/components/billing/FirstBilling.svelte';
	import PostsLimitProvider from '$lib/ui/components/posts/PostsLimitProvider.svelte';
	import ChannelCapProvider from '$lib/ui/components/channels/ChannelCapProvider.svelte';
	import AcquisitionSurveyModal from '$lib/ui/components/onboarding/AcquisitionSurveyModal.svelte';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { acquisitionSurveyPresenter } from '$lib/acquisition';
	import { firstBillingGatePresenter, ownedAccountBillingPresenter, preloadStripe } from '$lib/billing';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { authenticationRepository } from '$lib/user-auth/index';

	type ProtectedLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: ProtectedLayoutProps = $props();

	const companyName = $derived((data as App.LayoutData)?.companyNameVm ?? 'OpenQuok');
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
	const acquisitionUserId = $derived(currentUser?.id ?? null);
	const acquisitionGateResolved = $derived(
		firstBillingGatePresenter.hasResolvedGate(currentWorkspaceId)
	);
	const acquisitionGateContext = $derived({
		isPlatformAdmin,
		gateResolved: acquisitionGateResolved,
		restrictFreeUser: firstBillingGatePresenter.restrictFreeUser,
		workspaceId: currentWorkspaceId,
		userId: acquisitionUserId
	});

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

	const showAppShell = $derived(!gatePending && !showFirstBilling);

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
				if (subscriptionReady) {
					await acquisitionSurveyPresenter.evaluateEligibility(acquisitionGateContext, { force: true });
				}
			} finally {
				firstBillingGatePresenter.endCheckoutReturn();
			}
		})();
	});

	$effect(() => {
		if (!browser || !showAppShell) return;
		void acquisitionSurveyPresenter.evaluateEligibility(acquisitionGateContext);
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
		<ChannelCapProvider>
			{@render children?.()}
		</ChannelCapProvider>
	</PostsLimitProvider>
	<AcquisitionSurveyModal
		bind:open={acquisitionSurveyPresenter.acquisitionOpen}
		isSubmitting={acquisitionSurveyPresenter.isSubmitting}
		gateContext={acquisitionGateContext}
		onSubmit={(source, otherDetail) =>
			acquisitionSurveyPresenter.submit(acquisitionGateContext, source, otherDetail)}
	/>
{/if}
