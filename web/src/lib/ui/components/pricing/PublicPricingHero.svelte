<script lang="ts">
	import type { PublicPricingPageHeroCopy } from '$lib/billing/constants/publicPricingPageSeo';
	import type { PublicPricingProductLine } from '$lib/billing/constants/publicPricingProductLines';
	import type { SubscriptionPeriod } from 'openquok-common';

	import { PUBLIC_PRICING_PAGE_SEO } from '$lib/billing/constants/publicPricingPageSeo';
	import { PUBLIC_PRICING_FILTERED_PRODUCT_LINE_FOOTNOTE } from '$lib/billing/constants/publicPricingProductLines';

	import BillingPeriodToggle from '$lib/ui/components/billing/BillingPeriodToggle.svelte';
	import PublicPricingProductLineSwitcher from '$lib/ui/components/pricing/PublicPricingProductLineSwitcher.svelte';
	import PublicPricingLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicPricingLandingBreadcrumb.svelte';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';

	type Props = {
		period: SubscriptionPeriod;
		onPeriodChange: (period: SubscriptionPeriod) => void;
		productLine: PublicPricingProductLine;
		onProductLineChange: (line: PublicPricingProductLine) => void;
		hero?: PublicPricingPageHeroCopy;
		breadcrumbLabel?: string;
	};

	const defaultHero = PUBLIC_PRICING_PAGE_SEO.all.hero;

	let {
		period,
		onPeriodChange,
		productLine,
		onProductLineChange,
		hero = defaultHero,
		breadcrumbLabel = PUBLIC_PRICING_PAGE_SEO.all.breadcrumbLabel
	}: Props = $props();

	let showProductLineFootnote = $derived(productLine !== 'all');
</script>

<header class="mx-auto max-w-4xl px-4 text-center">
	<div class="flex justify-center">
		<PublicPricingLandingBreadcrumb {breadcrumbLabel} />
	</div>
	<h1 class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl md:text-5xl">
		<span class="block text-base-content">{hero.lead}</span>
		<span class="mt-2 block">
			<LandingHeroHighlightedText>{hero.highlight}</LandingHeroHighlightedText>
		</span>
		<span
			class="mt-2 block bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent"
		>
			{hero.gradient}
		</span>
	</h1>
	<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
		{hero.description}
	</p>
	<p
		class="mt-4 text-sm font-semibold tracking-wide text-pretty text-base-content/60 sm:text-base"
	>
		{hero.subnote}
	</p>

	<div class="mt-8 flex w-full flex-col items-center gap-4">
		<PublicPricingProductLineSwitcher value={productLine} onChange={onProductLineChange} />
		<div class="flex w-full justify-center [&_[data-slot=tabs]]:!w-auto">
			<BillingPeriodToggle {period} {onPeriodChange} />
		</div>
	</div>

	{#if showProductLineFootnote}
		<p class="mt-4 text-sm font-medium leading-relaxed text-pretty text-base-content/60">
			{PUBLIC_PRICING_FILTERED_PRODUCT_LINE_FOOTNOTE}
		</p>
	{/if}
</header>