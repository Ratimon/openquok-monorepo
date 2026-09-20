<script lang="ts">
	import type { SubscriptionPeriod } from 'openquok-common';
	import type {
		PublicPricingLandingPresetId,
		PublicPricingLandingSection
	} from '$lib/billing';

	import { page } from '$app/state';
	import {
		getPublicPricingLandingPlanOverrides,
		getPublicPricingLandingSection,
		getPublicPricingPresenter
	} from '$lib/billing';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import PublicPricingTabs from '$lib/ui/components/pricing/PublicPricingTabs.svelte';
	import PublicSelfHostPricingFootnote from '$lib/ui/components/pricing/PublicSelfHostPricingFootnote.svelte';

	type SectionCopyOverride = Partial<PublicPricingLandingSection>;

	type LandingHeroTheme = typeof landingHeroTheme;

	type Props = {
		presetId: PublicPricingLandingPresetId;
		platformLabel?: string;
		isLoggedIn?: boolean;
		sectionOverrides?: SectionCopyOverride;
		cmsSection?: SectionCopyOverride;
		heroTheme?: LandingHeroTheme;
	};

	let {
		presetId,
		platformLabel,
		isLoggedIn = false,
		sectionOverrides,
		cmsSection,
		heroTheme = landingHeroTheme
	}: Props = $props();

	function pickSectionField(
		cmsValue: string | undefined,
		overrideValue: string | undefined,
		presetValue: string
	): string {
		const cms = cmsValue?.trim();
		if (cms) return cms;
		const override = overrideValue?.trim();
		if (override) return override;
		return presetValue;
	}

	const presetSection = $derived(
		getPublicPricingLandingSection(presetId, { platformLabel })
	);

	const planMetaOverrides = $derived(
		getPublicPricingLandingPlanOverrides(presetId, { platformLabel })
	);

	const landingSubtitle = $derived(
		pickSectionField(cmsSection?.subtitle, sectionOverrides?.subtitle, presetSection.subtitle)
	);
	const landingTitle = $derived(
		pickSectionField(cmsSection?.title, sectionOverrides?.title, presetSection.title)
	);
	const landingDescription = $derived(
		pickSectionField(
			cmsSection?.description,
			sectionOverrides?.description,
			presetSection.description
		)
	);

	const pricingCompareHref = $derived(
		hostedMarketingHref('/pricing#pricing-compare', page.url.origin)
	);
	const pricingCtaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	const pricingCtaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');

	let period = $state<SubscriptionPeriod>('MONTHLY');

	const plans = $derived(
		getPublicPricingPresenter.buildLandingTabPlans(period, { planMetaOverrides })
	);

	function onPeriodChange(next: SubscriptionPeriod) {
		period = next;
	}
</script>

<PublicPricingTabs
	{heroTheme}
	{landingSubtitle}
	{landingTitle}
	{landingDescription}
	ctaHref={pricingCtaHref}
	ctaLabel={pricingCtaLabel}
	secondaryCtaHref={pricingCompareHref}
	secondaryCtaLabel="Compare all features"
	{plans}
	{period}
	{onPeriodChange}
/>

<PublicSelfHostPricingFootnote />
