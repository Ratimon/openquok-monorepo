<script lang="ts">
	import type { BillingPlanViewModel } from '$lib/billing';
	import type { PaidSubscriptionTier, SubscriptionPeriod } from 'openquok-common';

	import { tierDisplayName } from '$lib/billing';
	import Button from '$lib/ui/buttons/Button.svelte';
	import BillingPlanFeatures from '$lib/ui/components/billing/BillingPlanFeatures.svelte';
	import BillingProrateHint from '$lib/ui/components/billing/BillingProrateHint.svelte';

	type Props = {
		planVm: BillingPlanViewModel;
		period: SubscriptionPeriod;
		currentPackage: PaidSubscriptionTier | '';
		cancelAt: string | null;
		hasActiveSubscription: boolean;
		checkoutBusy: boolean;
		allowTrial: boolean;
		isFreeTier: boolean;
		previewProrate: (tier: PaidSubscriptionTier, period: SubscriptionPeriod) => Promise<number>;
		onSubscribe: (tier: PaidSubscriptionTier) => void;
		onReactivate: () => void;
	};

	let {
		planVm,
		period,
		currentPackage,
		cancelAt,
		hasActiveSubscription,
		checkoutBusy,
		allowTrial,
		isFreeTier,
		previewProrate,
		onSubscribe,
		onReactivate
	}: Props = $props();

	const tier = $derived(planVm.tier as PaidSubscriptionTier);
	const isCurrent = $derived(currentPackage === tier);
	const showReactivate = $derived(isCurrent && Boolean(cancelAt));
	const price = $derived(period === 'YEARLY' ? planVm.yearPrice : planVm.monthPrice);
	const periodLabel = $derived(period === 'YEARLY' ? '/year' : '/month');
	const showProrate = $derived(hasActiveSubscription && !isCurrent && !showReactivate);

	const buttonLabel = $derived.by(() => {
		if (showReactivate) return 'Reactivate subscription';
		if (isCurrent) return 'Current Plan';
		if (isFreeTier && allowTrial) return 'Start 7 days free trial';
		return 'Purchase';
	});
</script>

<div
	class="flex flex-1 flex-col gap-4 rounded border border-base-300 bg-base-100 p-6 max-lg:items-center max-lg:text-center"
>
	<div class="text-lg font-medium uppercase tracking-wide">{tierDisplayName(tier)}</div>

	<div class="flex items-center gap-0.5 text-4xl font-semibold">
		<span>${price}</span>
		<span class="text-sm font-normal text-base-content/60">{periodLabel}</span>
	</div>

	<div class="flex flex-wrap items-start gap-2.5 text-sm max-lg:justify-center">
		{#if showReactivate}
			<Button variant="primary" disabled={checkoutBusy} onclick={onReactivate}>
				{buttonLabel}
			</Button>
		{:else}
			<Button
				variant="primary"
				disabled={checkoutBusy || isCurrent}
				onclick={() => onSubscribe(tier)}
			>
				{buttonLabel}
			</Button>
		{/if}
		{#if showProrate}
			<BillingProrateHint {tier} {period} {previewProrate} />
		{/if}
	</div>

	<BillingPlanFeatures {planVm} />
</div>
