<script lang="ts">
	import type { PageData } from './$types';

	import { publicPricingPagePresenter } from '$lib/area-public/index';
	import PublicPricingCompareSection from '$lib/ui/components/pricing/PublicPricingCompareSection.svelte';
	import PublicPricingFaq from '$lib/ui/components/pricing/PublicPricingFaq.svelte';
	import PublicPricingHero from '$lib/ui/components/pricing/PublicPricingHero.svelte';
	import PublicPricingPlanCards from '$lib/ui/components/pricing/PublicPricingPlanCards.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		data: PageData;
	} & PageData;

	let { data }: Props = $props();

	const pagePresenter = publicPricingPagePresenter;

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let pageVm = $derived(pagePresenter.pageVm);
	let ctaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	let ctaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');
</script>

<svelte:head>
	<title>Pricing</title>
	<meta
		name="description"
		content="Compare OpenQuok plans for individuals, teams, and agencies. Flexible monthly or yearly billing."
	/>
</svelte:head>

<SectionOuterContainer class="py-10 md:py-16">
	<PublicPricingHero
		period={pagePresenter.billingPeriod}
		onPeriodChange={(next) => pagePresenter.setBillingPeriod(next)}
	/>

	<PublicPricingPlanCards plans={pageVm.plans} {ctaHref} {ctaLabel} />

	<PublicPricingCompareSection
		plans={pageVm.plans}
		compareRows={pageVm.compareRows}
		featuredTier={pageVm.featuredTier}
		period={pagePresenter.billingPeriod}
		onPeriodChange={(next) => pagePresenter.setBillingPeriod(next)}
		{ctaHref}
	/>

	<PublicPricingFaq />
</SectionOuterContainer>
