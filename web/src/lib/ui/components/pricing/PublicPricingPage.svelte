<script lang="ts">
	import type { PublicPricingPageHeroCopy } from '$lib/billing/constants/publicPricingPageSeo';
	import type { PublicPricingProductLine } from '$lib/billing/constants/publicPricingProductLines';
	import type { PublicFaqItem } from '$lib/content/constants/faq';
	import type { SubscriptionPeriod } from 'openquok-common';

	import { goto } from '$app/navigation';

	import { getPublicPricingPresenter } from '$lib/billing';
	import { publicPricingPathForProductLine } from '$lib/billing/constants/publicPricingPageSeo';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import PublicPricingCompareSection from '$lib/ui/components/pricing/PublicPricingCompareSection.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import PublicPricingHero from '$lib/ui/components/pricing/PublicPricingHero.svelte';
	import PublicPricingPlanCards from '$lib/ui/components/pricing/PublicPricingPlanCards.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	type Props = {
		isLoggedIn: boolean;
		productLine: PublicPricingProductLine;
		pricingHero: PublicPricingPageHeroCopy;
		pricingBreadcrumbLabel: string;
		defaultPeriod?: SubscriptionPeriod;
		publicFaqConfigPm: Record<string, string>;
		publicFaqItemsVm: PublicFaqItem[];
	};

	let {
		isLoggedIn,
		productLine,
		pricingHero,
		pricingBreadcrumbLabel,
		defaultPeriod = 'MONTHLY',
		publicFaqConfigPm,
		publicFaqItemsVm
	}: Props = $props();

	let initialPeriod = $derived.by((): SubscriptionPeriod => defaultPeriod);
	let period = $state<SubscriptionPeriod>('MONTHLY');
	let hasUserChosenPeriod = $state(false);
	let effectivePeriod = $derived.by(() => (hasUserChosenPeriod ? period : initialPeriod));

	let pageVm = $derived.by(() =>
		getPublicPricingPresenter.buildPageVm(effectivePeriod, productLine)
	);

	function navigateToProductLine(line: PublicPricingProductLine) {
		const targetPath = publicPricingPathForProductLine(line);
		void goto(targetPath, { keepFocus: true, noScroll: true });
	}

	let ctaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	let ctaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');

	const faqHeroTheme: LandingHeroTheme = {
		...landingHeroTheme,
		subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
		descriptionClass:
			'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg'
	};

	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);
	const pricingHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.pricing;
</script>

<SectionOuterContainer class="py-10 md:py-16">
	<PublicPricingHero
		period={effectivePeriod}
		onPeriodChange={(next) => {
			period = next;
			hasUserChosenPeriod = true;
		}}
		{productLine}
		onProductLineChange={navigateToProductLine}
		hero={pricingHero}
		breadcrumbLabel={pricingBreadcrumbLabel}
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

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={faqHeroTheme}
			faqConfigVm={publicFaqConfigPm}
			faqItems={publicFaqItemsVm}
		/>

		<AccentSplitCtaBanner
			title={pricingHubDocsBanner.title}
			description={pricingHubDocsBanner.description}
			ctaText={pricingHubDocsBanner.ctaText}
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
