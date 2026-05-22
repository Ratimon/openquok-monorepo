<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import { ConversionTrackEvent, trackConversion } from '$lib/product-analytics';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { BillingFaq, BillingPlansSection, FinishTrial } from '$lib/ui/components/billing';

	const pagePresenter = protectedBillingPagePresenter;
	const p = pagePresenter.billing;

	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const finishTrialQuery = $derived(page.url.searchParams.get('finishTrial'));

	let period = $state<'MONTHLY' | 'YEARLY'>('MONTHLY');
	let showFinishTrial = $state(false);

	const subscription = $derived(p.current?.subscription ?? null);
	const cancelAt = $derived(subscription?.cancelAt ?? null);
	const subscriptionPeriod = $derived(subscription?.period ?? null);
	const isFreeTier = $derived((p.current?.tier ?? 'FREE') === 'FREE');
	const allowTrial = $derived(p.current?.billing?.allowTrial ?? false);

	onMount(() => {
		if (finishTrialQuery) {
			showFinishTrial = true;
		}
		void pagePresenter.load().then(() => {
			const loadedPeriod = p.current?.subscription?.period;
			if (loadedPeriod) {
				period = loadedPeriod;
			}
			if (checkoutId) {
				void pagePresenter.pollCheckout(checkoutId).then(() => {
					pagePresenter.onPurchaseComplete();
					void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
					toast.success('Subscription updated.');
				});
			}
		});
	});

	$effect(() => {
		organizationId;
		void pagePresenter.load().then(() => {
			const loadedPeriod = p.current?.subscription?.period;
			if (loadedPeriod) {
				period = loadedPeriod;
			}
		});
	});
</script>

<div class="flex flex-1 flex-col gap-4 p-5">
	{#if p.loading}
		<div class="flex justify-center py-16">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if !organizationId}
		<p class="text-base-content/70 text-sm">Select a workspace to view billing.</p>
	{:else}
		{#if !p.billingEnabled}
			<div class="alert alert-info">
				<span>
					Stripe billing is not configured. Set backend <code>STRIPE_*</code> keys and price ids
					to enable checkout.
				</span>
			</div>
		{:else}
			<BillingPlansSection
				plans={p.plans}
				bind:period
				currentTier={subscription?.tier ?? p.current?.tier ?? null}
				{subscriptionPeriod}
				{cancelAt}
				hasActiveSubscription={Boolean(subscription?.id)}
				checkoutBusy={p.checkoutBusy}
				{allowTrial}
				{isFreeTier}
				previewProrate={(tier, billingPeriod) =>
					pagePresenter.previewProration(tier, billingPeriod)}
				onSubscribe={(tier) => void pagePresenter.subscribeWithTracking(tier, period)}
				onReactivate={() => void pagePresenter.reactivateSubscription()}
			/>

			{#if p.current?.billing?.hasStripeCustomer}
				<div class="mt-5 flex flex-wrap justify-center gap-2.5">
					<Button
						variant="primary"
						size="default"
						disabled={p.checkoutBusy}
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
