<script lang="ts">
	import type { SubscriptionPeriod } from 'openquok-common';

	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';

	type Props = {
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
	};

	let { period, onPeriodChange }: Props = $props();
</script>

<header class="mx-auto max-w-3xl px-4 text-center">
	<h1 class="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl md:text-5xl">
		Find the right
		<span class="relative inline-block">
			<span class="relative z-10">plan</span>
			<span
				class="pointer-events-none absolute -inset-x-2 -bottom-1 z-0 h-3 rounded-full bg-primary/30"
				aria-hidden="true"
			></span>
		</span>
		for your needs
	</h1>
	<p class="mt-4 text-base text-base-content/70 sm:text-lg">
		Whether you are an individual creator, a brand, a team, or an agency, we have options that scale
		with you.
	</p>
	<div class="mt-8 flex w-full justify-center [&_[data-slot=tabs]]:!w-auto">
		<BillingPeriodToggle {period} {onPeriodChange} />
	</div>
</header>
