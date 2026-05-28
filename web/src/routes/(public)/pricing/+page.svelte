<script lang="ts">
	import type { PageData } from './$types';

	import type { SubscriptionPeriod } from 'openquok-common';

	import PublicPricingCompareSection from '$lib/ui/components/pricing/PublicPricingCompareSection.svelte';
	import PublicPricingFaq from '$lib/ui/components/pricing/PublicPricingFaq.svelte';
	import PublicPricingHero from '$lib/ui/components/pricing/PublicPricingHero.svelte';
	import PublicPricingPlanCards from '$lib/ui/components/pricing/PublicPricingPlanCards.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let pageVmMonthly = $derived(data.pageVmMonthly);
	let pageVmYearly = $derived(data.pageVmYearly);
	let schemaData = $derived(data.schemaData);

	let initialPeriod = $derived.by((): SubscriptionPeriod => data.defaultPeriod ?? 'MONTHLY');
	let period = $state<SubscriptionPeriod>('MONTHLY');
	let hasUserChosenPeriod = $state(false);
	let effectivePeriod = $derived.by(() => (hasUserChosenPeriod ? period : initialPeriod));

	let pageVm = $derived.by(() => (effectivePeriod === 'YEARLY' ? pageVmYearly : pageVmMonthly));
	let ctaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	let ctaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');
</script>

<svelte:head>
	{#if schemaData}
		<script type="application/ld+json">{JSON.stringify(schemaData)}</script>
	{/if}
</svelte:head>

<SectionOuterContainer class="py-10 md:py-16">
	<PublicPricingHero
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
	/>

	<PublicPricingPlanCards plans={pageVm.plans} {ctaHref} {ctaLabel} />

	<PublicPricingCompareSection
		plans={pageVm.plans}
		compareRows={pageVm.compareRows}
		featuredTier={pageVm.featuredTier}
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
		{ctaHref}
	/>

	<PublicPricingFaq />
</SectionOuterContainer>
