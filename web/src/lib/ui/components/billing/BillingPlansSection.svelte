<script lang="ts">
	import type { BillingPlanDto } from '$lib/billing';
	import type { PaidSubscriptionTier, SubscriptionPeriod, SubscriptionTier } from 'openquok-common';

	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import BillingPlanCard from '$lib/ui/components/billing/BillingPlanCard.svelte';

	type Props = {
		plans: BillingPlanDto[];
		period: SubscriptionPeriod;
		currentTier: SubscriptionTier | null;
		subscriptionPeriod: SubscriptionPeriod | null;
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
		plans,
		period = $bindable(),
		currentTier,
		subscriptionPeriod,
		cancelAt,
		hasActiveSubscription,
		checkoutBusy,
		allowTrial,
		isFreeTier,
		previewProrate,
		onSubscribe,
		onReactivate
	}: Props = $props();

	const paidPlans = $derived(plans.filter((plan) => plan.tier !== 'FREE'));

	/** Highlighted plan when the toggle matches the subscription billing cadence. */
	const currentPackage = $derived.by((): PaidSubscriptionTier | '' => {
		if (!hasActiveSubscription || !subscriptionPeriod || !currentTier || currentTier === 'FREE') {
			return '';
		}
		if (period !== subscriptionPeriod) return '';
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
		{#each paidPlans as plan (plan.tier)}
			<BillingPlanCard
				{plan}
				{period}
				{currentPackage}
				{cancelAt}
				{hasActiveSubscription}
				{checkoutBusy}
				{allowTrial}
				{isFreeTier}
				{previewProrate}
				{onSubscribe}
				{onReactivate}
			/>
		{/each}
	</div>
</div>
