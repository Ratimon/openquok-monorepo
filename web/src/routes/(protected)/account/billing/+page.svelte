<script lang="ts">
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import { icons } from '$data/icons';
	import { ConversionTrackEvent, trackConversion } from '$lib/product-analytics';
	import { getRootPathAccount, protectedBillingPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { formatSubscriptionCancelDate } from '$lib/ui/helpers/formatters';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		BillingCancelFeedbackDialog,
		BillingCancelRetentionDialog,
		BillingFaq,
		BillingPeriodToggle,
		BillingPlansSection,
		BillingWorkspaceSelect,
		FinishTrial
	} from '$lib/ui/components/billing';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';

	const pagePresenter = protectedBillingPagePresenter;

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const organizationId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const ownedWorkspaces = $derived(
		workspaceSettingsPresenter.workspacesVm.filter((w) => w.workspaceRole === 'owner')
	);
	const canManageBilling = $derived(workspaceSettingsPresenter.canManageSentInvitesInCurrentWorkspace);
	const currentWorkspaceName = $derived(
		workspaceSettingsPresenter.workspacesVm.find((w) => w.id === organizationId)?.name ?? null
	);
	const planHeadingWorkspaceName = $derived(currentWorkspaceName ?? 'this workspace');
	const showBillingWorkspaceSelect = $derived(
		!canManageBilling
			? ownedWorkspaces.length > 0
			: ownedWorkspaces.length > 1
	);
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const finishTrialQuery = $derived(page.url.searchParams.get('finishTrial'));

	let period = $state<'MONTHLY' | 'YEARLY'>('MONTHLY');
	let showFinishTrial = $state(false);
	let showCancelConfirmDialog = $state(false);
	let showRetentionDialog = $state(false);
	let showFeedbackDialog = $state(false);
	let showSubscribeConfirmDialog = $state(false);
	let showPaymentPortalDialog = $state(false);
	let pendingSubscribeTier = $state<PaidSubscriptionTier | null>(null);
	let paymentPortalUrl = $state<string | null>(null);
	let subscriptionUpdatedNotified = false;

	function notifySubscriptionUpdated(): void {
		if (subscriptionUpdatedNotified) return;
		subscriptionUpdatedNotified = true;
		toast.success('Subscription updated.');
	}

	const subscription = $derived(pagePresenter.currentVm?.subscription ?? null);
	const currentTier = $derived(subscription?.tier ?? pagePresenter.currentVm?.tier ?? null);
	const cancelAt = $derived(subscription?.cancelAt ?? null);
	const subscriptionPeriod = $derived(subscription?.period ?? null);
	const hasActiveSubscription = $derived(
		Boolean(subscription?.id) || (currentTier !== null && currentTier !== 'FREE')
	);
	const userOnFreeTier = $derived((currentTier ?? 'FREE') === 'FREE');
	const allowTrial = $derived(pagePresenter.currentVm?.billing?.allowTrial ?? false);
	const checkoutBusy = $derived(pagePresenter.billingPresenter.checkoutBusy);
	const hasSubscriptionRecord = $derived(Boolean(subscription?.id));
	const checkoutEnabled = $derived(pagePresenter.billingEnabled);
	const billingActionsEnabled = $derived(checkoutEnabled && canManageBilling);
	const canCancelSubscription = $derived(
		billingActionsEnabled && hasActiveSubscription && !cancelAt
	);

	function handleSwitchWorkspace(workspaceId: string): void {
		void workspaceSettingsPresenter.switchWorkspace(workspaceId);
	}

	const cancelConfirmDescription = $derived.by(() => {
		const base = 'Are you sure you want to cancel your subscription?';
		const warning = pagePresenter.cancelTeamMemberDowngradeWarning();
		return warning ? `${base} ${warning}` : base;
	});

	const subscribeConfirmDescription = $derived.by(() => {
		const tier = pendingSubscribeTier;
		if (!tier) return '';
		const warning = pagePresenter.teamMemberDowngradeWarningForTier(tier);
		return warning ?? 'Continue with this plan change?';
	});

	function startCancelSubscription(): void {
		if (!canCancelSubscription) return;
		showCancelConfirmDialog = true;
	}

	function requestSubscribe(tier: PaidSubscriptionTier): void {
		if (!billingActionsEnabled || checkoutBusy) return;
		const warning = pagePresenter.teamMemberDowngradeWarningForTier(tier);
		if (warning) {
			pendingSubscribeTier = tier;
			showSubscribeConfirmDialog = true;
			return;
		}
		void runSubscribe(tier);
	}

	async function runSubscribe(tier: PaidSubscriptionTier): Promise<void> {
		const result = await pagePresenter.subscribeWithTracking(tier, period);
		if (result.type === 'portal') {
			paymentPortalUrl = result.url;
			showPaymentPortalDialog = true;
			return;
		}
		if (result.type === 'updated') {
			notifySubscriptionUpdated();
			if (checkoutId) {
				replaceState('/account/billing', {});
			}
		}
	}

	async function confirmSubscribe(): Promise<void> {
		const tier = pendingSubscribeTier;
		showSubscribeConfirmDialog = false;
		pendingSubscribeTier = null;
		if (!tier) return;
		await runSubscribe(tier);
	}

	function openPaymentPortal(): void {
		if (paymentPortalUrl) {
			window.open(paymentPortalUrl, '_blank', 'noopener,noreferrer');
		}
		showPaymentPortalDialog = false;
		paymentPortalUrl = null;
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

	async function handleCheckoutReturn(): Promise<void> {
		await workspaceSettingsPresenter.load({ includeTeam: false });
		await pagePresenter.alignWorkspaceForCheckoutReturn(checkoutId!);
		await pagePresenter.load();

		const loadedPeriod = pagePresenter.currentVm?.subscription?.period;
		if (loadedPeriod) {
			period = loadedPeriod;
		}
		if (!workspaceSettingsPresenter.canManageSentInvitesInCurrentWorkspace) {
			toast.error('Only the workspace owner can complete checkout for this workspace.');
			replaceState('/account/billing', {});
			return;
		}
		const tierAfterLoad = pagePresenter.currentVm?.tier ?? 'FREE';
		const alreadyActive =
			Boolean(pagePresenter.currentVm?.subscription?.id) ||
			(tierAfterLoad !== 'FREE' && tierAfterLoad !== null);
		if (alreadyActive) {
			pagePresenter.onPurchaseComplete();
			void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
			notifySubscriptionUpdated();
			replaceState('/account/billing', {});
			return;
		}
		const confirmed = await pagePresenter.pollCheckout(checkoutId!);
		const periodAfterPoll = pagePresenter.currentVm?.subscription?.period;
		if (periodAfterPoll) {
			period = periodAfterPoll;
		}
		if (confirmed) {
			pagePresenter.onPurchaseComplete();
			void trackConversion(ConversionTrackEvent.Purchase, { authenticated: true });
			notifySubscriptionUpdated();
			replaceState('/account/billing', {});
		} else {
			toast.error('We could not confirm your subscription yet. Refresh the page in a moment.');
		}
	}

	onMount(() => {
		if (finishTrialQuery) {
			showFinishTrial = true;
		}
		if (checkoutId) {
			void handleCheckoutReturn();
			return;
		}
		void pagePresenter.load().then(() => {
			const loadedPeriod = pagePresenter.currentVm?.subscription?.period;
			if (loadedPeriod) {
				period = loadedPeriod;
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
	<div class="space-y-6 rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="min-w-0 space-y-1">
				<div class="flex flex-wrap items-center gap-3">
					<AbstractIcon
						name={icons.CreditCard.name}
						class="text-primary size-8 shrink-0"
						width="32"
						height="32"
					/>
					<h1 class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl font-bold text-base-content">
						<span class="shrink-0">Plan for</span>
						{#if showBillingWorkspaceSelect}
							<BillingWorkspaceSelect
								workspaces={ownedWorkspaces}
								currentWorkspaceId={organizationId}
								displayName={planHeadingWorkspaceName}
								onSwitchWorkspace={handleSwitchWorkspace}
							/>
						{:else}
							<span class="text-primary">{planHeadingWorkspaceName}</span> workspace
						{/if}
					</h1>
				</div>
				<p class="text-sm text-base-content/70">
					{#if canManageBilling}
						Compare plans, manage your subscription, and update billing for this workspace.
					{:else}
						View plans for this workspace. Only the workspace owner can purchase or change billing.
						{#if ownedWorkspaces.length > 0}
							Use the workspace menu in the title to switch to one you own.
						{/if}
					{/if}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button type="button" variant="outline" href={accountPath}>
					<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
					Back to home
				</Button>
			</div>
		</div>

		{#if pagePresenter.loading}
			<div class="flex justify-center py-16">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else if !organizationId}
			<div
				class="flex flex-col gap-2 rounded-lg border border-base-300 bg-base-200/30 p-4 text-sm text-base-content/80"
				role="status"
			>
				<p class="font-medium text-base-content">Select a workspace</p>
				<p>
					Choose a workspace from the header switcher to view plans, manage billing, and checkout.
				</p>
			</div>
		{:else}
			{#if !canManageBilling}
				<HomeAccountNoticeBanner iconName={icons.Info.name} tone="neutral" dismissible={false}>
					<p class="text-base-content/90">
						{#if currentWorkspaceName}
							Billing for <span class="font-medium">{currentWorkspaceName}</span> is managed by the
							workspace owner.
						{:else}
							Billing for this workspace is managed by the workspace owner.
						{/if}
						Ask them to change the plan or payment method.
					</p>
				</HomeAccountNoticeBanner>
			{/if}

			{#if !checkoutEnabled}
				<div class="alert alert-info">
					<span>
						Stripe billing is not configured for this environment. Set backend <code>STRIPE_*</code>
						keys and web <code>VITE_PUBLIC_STRIPE_PRICE_ID_*</code> variables to enable checkout.
						Plans below are shown for reference only.
					</span>
				</div>
			{/if}

			<div class="flex flex-col gap-4">
				<div class="flex justify-end max-lg:justify-stretch">
					<BillingPeriodToggle
						{period}
						onPeriodChange={(next: SubscriptionPeriod) => {
							period = next;
						}}
					/>
				</div>

				<BillingPlansSection
					plansVm={pagePresenter.plansVm}
					bind:period
					{currentTier}
					{subscriptionPeriod}
					{cancelAt}
					{hasActiveSubscription}
					{hasSubscriptionRecord}
					checkoutEnabled={billingActionsEnabled}
					{checkoutBusy}
					{allowTrial}
					{userOnFreeTier}
					previewProrate={(tier, billingPeriod) =>
						pagePresenter.previewProration(tier, billingPeriod)}
					onSubscribe={requestSubscribe}
					onReactivate={() => void pagePresenter.reactivateSubscription()}
					onCancelSubscription={startCancelSubscription}
				/>
			</div>

			{#if billingActionsEnabled && hasSubscriptionRecord}
				<div class="flex flex-wrap justify-center gap-2.5">
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
					Your subscription will be canceled at {formatSubscriptionCancelDate(cancelAt)}.
					<br />
					You will not be charged again after that date.
				</p>
			{/if}

			<BillingFaq {allowTrial} />
		{/if}
	</div>

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
		description={cancelConfirmDescription}
		confirmLabel="Yes, cancel"
		cancelLabel="Cancel"
		loading={checkoutBusy}
		onConfirm={() => void proceedAfterCancelConfirm()}
		onCancel={() => {
			showCancelConfirmDialog = false;
		}}
	/>

	<DeleteModal
		bind:open={showSubscribeConfirmDialog}
		title="Change plan"
		description={subscribeConfirmDescription}
		confirmLabel="Yes, continue"
		cancelLabel="Cancel"
		confirmVariant="primary"
		loading={checkoutBusy}
		onConfirm={() => void confirmSubscribe()}
		onCancel={() => {
			showSubscribeConfirmDialog = false;
			pendingSubscribeTier = null;
		}}
	/>

	<DeleteModal
		bind:open={showPaymentPortalDialog}
		title="Payment method required"
		description="We could not charge your card for this plan change. Update your payment method in the billing portal, then try again."
		confirmLabel="Update"
		cancelLabel="Cancel"
		confirmVariant="primary"
		loading={checkoutBusy}
		onConfirm={openPaymentPortal}
		onCancel={() => {
			showPaymentPortalDialog = false;
			paymentPortalUrl = null;
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
