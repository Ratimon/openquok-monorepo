<script lang="ts">
	import type { BillingPlanViewModel } from '$lib/billing';
	import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';

	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import BillingPlanCard from '$lib/ui/components/billing/BillingPlanCard.svelte';

	type Props = {
		plansVm: BillingPlanViewModel[];
		period: SubscriptionPeriod;
		currentTier: SubscriptionTier | null;
		subscriptionPeriod: SubscriptionPeriod | null;
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
		plansVm,
		period = $bindable(),
		currentTier,
		subscriptionPeriod,
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

	/** Highlighted plan when the toggle matches the subscription billing cadence. */
	const currentPackage = $derived.by((): PaidSubscriptionTier | '' => {
		if (!hasActiveSubscription || !currentTier || currentTier === 'FREE') {
			return '';
		}
		if (subscriptionPeriod && period !== subscriptionPeriod) return '';
		return currentTier as PaidSubscriptionTier;
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-row items-center gap-4 max-lg:flex-col max-lg:items-stretch">
		<div class="flex-1 text-xl font-semibold">Plans</div>
		<BillingPeriodToggle
			{period}
			onPeriodChange={(next: SubscriptionPeriod) => {
				period = next;
			}}
		/>
	</div>

	<div class="flex gap-4 max-lg:flex-col max-lg:text-center">
		{#each plansVm as planVm (planVm.tier)}
			<BillingPlanCard
				{planVm}
				{period}
				{currentTier}
				{currentPackage}
				{cancelAt}
				{hasActiveSubscription}
				{hasSubscriptionRecord}
				{checkoutEnabled}
				{checkoutBusy}
				{allowTrial}
				{userOnFreeTier}
				{previewProrate}
				{onSubscribe}
				{onReactivate}
				{onCancelSubscription}
			/>
		{/each}
	</div>
</div>
