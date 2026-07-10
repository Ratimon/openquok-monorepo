<script lang="ts">
	import type { PageData } from './$types';
	import type { SubscriptionPeriod } from 'openquok-common';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_COMPARE_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';


	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicPricingCompareSection from '$lib/ui/components/pricing/PublicPricingCompareSection.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicPricingHero from '$lib/ui/components/pricing/PublicPricingHero.svelte';
	import PublicPricingPlanCards from '$lib/ui/components/pricing/PublicPricingPlanCards.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	

	type Props = { data: PageData };

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn ?? false);
	let pageVmMonthly = $derived(data.pageVmMonthly);
	let pageVmYearly = $derived(data.pageVmYearly);
	let publicFaqItemsVm = $derived(data.publicFaqItemsVm ?? []);
	let schemaData = $derived(data.schemaData);

	let initialPeriod = $derived.by((): SubscriptionPeriod => data.defaultPeriod ?? 'MONTHLY');
	let period = $state<SubscriptionPeriod>('MONTHLY');
	let hasUserChosenPeriod = $state(false);
	let effectivePeriod = $derived.by(() => (hasUserChosenPeriod ? period : initialPeriod));

	let pageVm = $derived.by(() => (effectivePeriod === 'YEARLY' ? pageVmYearly : pageVmMonthly));
	let ctaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	let ctaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const pricingHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.pricing;
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicPricingHero
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
	/>

	<PublicPricingPlanCards
		plans={pageVm.plans}
		{ctaHref}
		{ctaLabel}
	/>

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

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={faqHeroTheme}
			faqConfigVm={data.publicFaqConfigPm}
			faqItems={publicFaqItemsVm}
		/>

		<AccentSplitCtaBanner
			title={pricingHubDocsBanner.title}
			description={pricingHubDocsBanner.description}
			ctaText={PUBLIC_COMPARE_BANNER_CTA_TEXT}
			ctaHref={pricingHubDocsBanner.docsPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
