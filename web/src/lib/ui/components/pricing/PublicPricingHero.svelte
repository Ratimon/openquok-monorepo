<script lang="ts">
	import type { SubscriptionPeriod } from 'openquok-common';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';

	type Props = {
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
	};

	let { period, onPeriodChange }: Props = $props();
</script>

<header class="mx-auto max-w-4xl px-4 text-center">
	<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">
		Pricing
	</p>
	<h1 class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl md:text-5xl">
		<span class="block text-base-content">Find your</span>
		<span class="mt-2 block">
			<LandingHeroHighlightedText>perfect plan</LandingHeroHighlightedText>
		</span>
		<span
			class="mt-2 block bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent"
		>
			that match your needs
		</span>
	</h1>
	<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
		Whether you are a solopreneur, a creator team, or AI practitioner using agent at a scale, we have options that scale
        with you.
	</p>

	<div class="mt-8 flex w-full justify-center [&_[data-slot=tabs]]:!w-auto">
		<BillingPeriodToggle {period} {onPeriodChange} />
	</div>
</header>