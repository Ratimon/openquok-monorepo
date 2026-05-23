<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import { ConversionTrackEvent, trackConversion } from '$lib/product-analytics';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { protectedBillingPagePresenter } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		BillingCancelFeedbackDialog,
		BillingCancelRetentionDialog,
		BillingFaq,
		BillingPlansSection,
		FinishTrial
	} from '$lib/ui/components/billing';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';

	const pagePresenter = protectedBillingPagePresenter;

	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const finishTrialQuery = $derived(page.url.searchParams.get('finishTrial'));

	let period = $state<'MONTHLY' | 'YEARLY'>('MONTHLY');
	let showFinishTrial = $state(false);
	let showCancelConfirmDialog = $state(false);
	let showRetentionDialog = $state(false);
	let showFeedbackDialog = $state(false);

	const subscription = $derived(pagePresenter.currentVm?.subscription ?? null);
	const currentTier = $derived(subscription?.tier ?? pagePresenter.currentVm?.tier ?? null);
	const cancelAt = $derived(subscription?.cancelAt ?? null);
	const subscriptionPeriod = $derived(subscription?.period ?? null);
	const hasActiveSubscription = $derived(
		Boolean(subscription?.id) || (currentTier !== null && currentTier !== 'FREE')
	);
	const isFreeTier = $derived((currentTier ?? 'FREE') === 'FREE');
	const allowTrial = $derived(pagePresenter.currentVm?.billing?.allowTrial ?? false);
	const checkoutBusy = $derived(pagePresenter.billingPresenter.checkoutBusy);
	const canCancelSubscription = $derived(
		hasActiveSubscription && !cancelAt && pagePresenter.billingEnabled
	);

	function startCancelSubscription(): void {
		if (!canCancelSubscription) return;
		showCancelConfirmDialog = true;
	}

	async function proceedAfterCancelConfirm(): Promise<void> {
		showCancelConfirmDialog = false;
		const hasOffer = await pagePresenter.checkRetentionOffer();
		if (hasOffer) {
			showRetentionDialog = true;
			return;
		}
		showFeedbackDialog = true;
	}

	async function onAcceptRetentionDiscount(): Promise<void> {
		const applied = await pagePresenter.applyRetentionDiscount();
		if (applied) {
			showRetentionDialog = false;
		}
	}

	function onContinueToCancelFeedback(): void {
		showRetentionDialog = false;
		showFeedbackDialog = true;
	}

	async function onSubmitCancelFeedback(feedback: string): Promise<void> {
		const canceled = await pagePresenter.cancelWithFeedback(feedback);
		if (canceled) {
			showFeedbackDialog = false;
		}
	}

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
				{checkoutBusy}
				{allowTrial}
				{isFreeTier}
				previewProrate={(tier, billingPeriod) =>
					pagePresenter.previewProration(tier, billingPeriod)}
				onSubscribe={(tier) => void pagePresenter.subscribeWithTracking(tier, period)}
				onReactivate={() => void pagePresenter.reactivateSubscription()}
			/>

			{#if subscription?.id}
				<div class="mt-5 flex flex-wrap justify-center gap-2.5">
					{#if pagePresenter.currentVm?.billing?.hasStripeCustomer}
						<Button
							variant="primary"
							size="default"
							disabled={checkoutBusy}
							onclick={() => void pagePresenter.openPortal()}
						>
							Update payment method / invoices history
						</Button>
					{/if}
					{#if canCancelSubscription}
						<Button
							variant="red"
							size="default"
							disabled={checkoutBusy}
							onclick={startCancelSubscription}
						>
							Cancel subscription
						</Button>
					{/if}
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

	<DeleteModal
		bind:open={showCancelConfirmDialog}
		title="Cancel subscription"
		description="Are you sure you want to cancel your subscription?"
		confirmLabel="Yes, cancel"
		cancelLabel="Cancel"
		loading={checkoutBusy}
		onConfirm={() => void proceedAfterCancelConfirm()}
		onCancel={() => {
			showCancelConfirmDialog = false;
		}}
	/>

	<BillingCancelRetentionDialog
		bind:open={showRetentionDialog}
		busy={checkoutBusy}
		onOpenChange={(open) => {
			showRetentionDialog = open;
		}}
		onAcceptDiscount={onAcceptRetentionDiscount}
		onContinueCancel={onContinueToCancelFeedback}
	/>

	<BillingCancelFeedbackDialog
		bind:open={showFeedbackDialog}
		busy={checkoutBusy}
		onOpenChange={(open) => {
			showFeedbackDialog = open;
		}}
		onSubmit={onSubmitCancelFeedback}
	/>
</div>
