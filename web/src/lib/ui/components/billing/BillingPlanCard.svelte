<script lang="ts">
	import type { BillingPlanViewModel } from '$lib/billing';
	import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';

	import { tierDisplayName } from '$lib/billing';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BillingPlanFeatures from '$lib/ui/components/billing/BillingPlanFeatures.svelte';
	import BillingProrateHint from '$lib/ui/components/billing/BillingProrateHint.svelte';
	import { formatSubscriptionCancelDate } from '$lib/ui/helpers/formatters';

	type Props = {
		planVm: BillingPlanViewModel;
		period: SubscriptionPeriod;
		currentTier: SubscriptionTier | null;
		currentPackage: PaidSubscriptionTier | '';
		cancelAt: string | null;
		hasActiveSubscription: boolean;
		hasSubscriptionRecord: boolean;
		checkoutEnabled: boolean;
		checkoutBusy: boolean;
		allowTrial: boolean;
		userOnFreeTier: boolean;
		previewProrate: (tier: PaidSubscriptionTier, period: SubscriptionPeriod) => Promise<number>;
		onSubscribe: (tier: PaidSubscriptionTier) => void;
		onReactivate: () => void;
		onCancelSubscription?: () => void;
	};

	let {
		planVm,
		period,
		currentTier,
		currentPackage,
		cancelAt,
		hasActiveSubscription,
		hasSubscriptionRecord,
		checkoutEnabled,
		checkoutBusy,
		allowTrial,
		userOnFreeTier,
		previewProrate,
		onSubscribe,
		onReactivate,
		onCancelSubscription
	}: Props = $props();

	const tier = $derived(planVm.tier);
	const isPlanFree = $derived(tier === 'FREE');
	const isCurrent = $derived(
		isPlanFree ? currentTier === 'FREE' : currentPackage === tier
	);
	const showReactivate = $derived(isCurrent && Boolean(cancelAt) && !isPlanFree);
	const scheduledDowngrade = $derived(isPlanFree && Boolean(cancelAt) && hasActiveSubscription);
	const price = $derived(period === 'YEARLY' ? planVm.yearPrice : planVm.monthPrice);
	const periodLabel = $derived(period === 'YEARLY' ? '/year' : '/month');
	const showProrate = $derived(
		checkoutEnabled &&
			hasSubscriptionRecord &&
			!isPlanFree &&
			!isCurrent &&
			!showReactivate
	);
	const buttonDisabled = $derived(
		!checkoutEnabled || checkoutBusy || scheduledDowngrade || (isCurrent && !showReactivate)
	);
	const cancelFromFreeCard = $derived(
		checkoutEnabled && isPlanFree && hasActiveSubscription && !cancelAt && !isCurrent
	);

	const buttonLabel = $derived.by(() => {
		if (showReactivate) return 'Reactivate subscription';
		if (isCurrent) return 'Current Plan';
		if (scheduledDowngrade && cancelAt) {
			return `Downgrade on ${formatSubscriptionCancelDate(cancelAt)}`;
		}
		if (isPlanFree && hasActiveSubscription) return 'Downgrade to free plan';
		if (userOnFreeTier && allowTrial) return 'Start 7 days free trial';
		return 'Purchase';
	});

	function onPrimaryClick(): void {
		if (showReactivate) {
			onReactivate();
			return;
		}
		if (cancelFromFreeCard) {
			onCancelSubscription?.();
			return;
		}
		if (!isPlanFree) {
			onSubscribe(tier as PaidSubscriptionTier);
		}
	}
</script>

<div
	class="flex flex-1 flex-col gap-4 rounded border border-base-300 bg-base-100 p-6 max-lg:items-stretch max-lg:text-left"
>
	<div class="text-lg font-medium uppercase tracking-wide">
		{tierDisplayName(tier)}
	</div>

	<div class="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
		<span class="text-4xl font-semibold">${price}</span>
		<span class="text-sm font-normal text-base-content/60">{periodLabel}</span>
		{#if showProrate}
			<BillingProrateHint tier={tier as PaidSubscriptionTier} {period} {previewProrate} />
		{/if}
	</div>

	<div class="text-sm">
		<Button
			variant={cancelFromFreeCard ? 'red' : 'primary'}
			disabled={buttonDisabled}
			onclick={onPrimaryClick}
		>
			{buttonLabel}
		</Button>
	</div>

	<BillingPlanFeatures {planVm} />
</div>
