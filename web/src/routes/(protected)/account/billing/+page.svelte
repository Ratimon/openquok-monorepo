<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import { ConversionTrackEvent, trackConversion } from '$lib/product-analytics';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { BillingFaq, BillingPlansSection, FinishTrial } from '$lib/ui/components/billing';

	const pagePresenter = protectedBillingPagePresenter;

	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const finishTrialQuery = $derived(page.url.searchParams.get('finishTrial'));

	let period = $state<'MONTHLY' | 'YEARLY'>('MONTHLY');
	let showFinishTrial = $state(false);

	const subscription = $derived(pagePresenter.currentVm?.subscription ?? null);
	const currentTier = $derived(subscription?.tier ?? pagePresenter.currentVm?.tier ?? null);
	const cancelAt = $derived(subscription?.cancelAt ?? null);
	const subscriptionPeriod = $derived(subscription?.period ?? null);
	const hasActiveSubscription = $derived(
		Boolean(subscription?.id) || (currentTier !== null && currentTier !== 'FREE')
	);
	const isFreeTier = $derived((currentTier ?? 'FREE') === 'FREE');
	const allowTrial = $derived(pagePresenter.currentVm?.billing?.allowTrial ?? false);

	onMount(() => {
		if (finishTrialQuery) {
			showFinishTrial = true;
		}
		void pagePresenter.load().then(() => {
			const loadedPeriod = pagePresenter.currentVm?.subscription?.period;
			if (loadedPeriod) {
				period = loadedPeriod;
			}
			if (checkoutId) {
				const tierAfterLoad = pagePresenter.currentVm?.tier ?? 'FREE';
				const alreadyActive =
					Boolean(pagePresenter.currentVm?.subscription?.id) ||
					(tierAfterLoad !== 'FREE' && tierAfterLoad !== null);
				if (alreadyActive) {
					pagePresenter.onPurchaseComplete();
					void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
					toast.success('Subscription updated.');
					replaceState('/account/billing', {});
					return;
				}
				void pagePresenter.pollCheckout(checkoutId).then((confirmed) => {
					const loadedPeriod = pagePresenter.currentVm?.subscription?.period;
					if (loadedPeriod) {
						period = loadedPeriod;
					}
					if (confirmed) {
						pagePresenter.onPurchaseComplete();
						void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
						toast.success('Subscription updated.');
						replaceState('/account/billing', {});
					} else {
						toast.error(
							'We could not confirm your subscription yet. Refresh the page in a moment.'
						);
					}
				});
			}
		});
	});

	$effect(() => {
		organizationId;
		void pagePresenter.load().then(() => {
			const loadedPeriod = pagePresenter.currentVm?.subscription?.period;
			if (loadedPeriod) {
				period = loadedPeriod;
			}
		});
	});
</script>

<div class="flex flex-1 flex-col gap-4 p-5">
	{#if pagePresenter.loading}
		<div class="flex justify-center py-16">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if !organizationId}
		<p class="text-base-content/70 text-sm">Select a workspace to view billing.</p>
	{:else}
		{#if !pagePresenter.billingEnabled}
			<div class="alert alert-info">
				<span>
					Stripe billing is not configured. Set backend <code>STRIPE_*</code> keys and price ids
					to enable checkout.
				</span>
			</div>
		{:else}
			<BillingPlansSection
				plansVm={pagePresenter.plansVm}
				bind:period
				{currentTier}
				{subscriptionPeriod}
				{cancelAt}
				{hasActiveSubscription}
				checkoutBusy={pagePresenter.billingPresenter.checkoutBusy}
				{allowTrial}
				{isFreeTier}
				previewProrate={(tier, billingPeriod) =>
					pagePresenter.previewProration(tier, billingPeriod)}
				onSubscribe={(tier) => void pagePresenter.subscribeWithTracking(tier, period)}
				onReactivate={() => void pagePresenter.reactivateSubscription()}
			/>

			{#if pagePresenter.currentVm?.billing?.hasStripeCustomer}
				<div class="mt-5 flex flex-wrap justify-center gap-2.5">
					<Button
						variant="primary"
						size="default"
						disabled={pagePresenter.billingPresenter.checkoutBusy}
						onclick={() => void pagePresenter.openPortal()}
					>
						Update payment method / invoices history
					</Button>
				</div>
			{/if}

			{#if cancelAt}
				<p class="text-center text-sm text-base-content/70">
					Your subscription will be canceled at
					{new Date(cancelAt).toLocaleDateString(undefined, {
						day: 'numeric',
						month: 'short',
						year: 'numeric'
					})}.
					You will not be charged again after that date.
				</p>
			{/if}

			<BillingFaq {allowTrial} />
		{/if}
	{/if}

	{#if showFinishTrial}
		<FinishTrial
			onClose={() => {
				showFinishTrial = false;
			}}
			onFinishTrial={() => pagePresenter.finishTrial()}
			onPollFinished={() => pagePresenter.pollTrialFinished()}
		/>
	{/if}
</div>
