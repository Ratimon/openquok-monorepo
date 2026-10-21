<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		CONFIG_SCHEMA_LANDING_PAGE,
		getLandingPageConfigDefaults,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG } from '$lib/content/constants/marketing/social-autopilot-landing';
	import { getPublicMarketingLandingFaqSection } from '$lib/content/constants/marketing/publicMarketingLandingFaqs';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicMarketingPricingSection from '$lib/ui/components/pricing/PublicMarketingPricingSection.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import IconTileGrid from '$lib/ui/templates/feature-grid/IconTileGrid.svelte';
	import HeroDemo from '$lib/ui/templates/landing-page/HeroDemo.svelte';
	import PublicSocialAutopilotHero from '$lib/ui/templates/landing-page/PublicSocialAutopilotHero.svelte';
	import PublicLandingHeroStatBadges from '$lib/ui/templates/landing-page/PublicLandingHeroStatBadges.svelte';
	import PublicSocialAutopilotProductFeatureSections from '$lib/ui/templates/landing-page/PublicSocialAutopilotProductFeatureSections.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import PublicOpportunitiesPreviewGrid from '$lib/ui/templates/opportunities-preview/PublicOpportunitiesPreviewGrid.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const landing = PUBLIC_SOCIAL_AUTOPILOT_LANDING_CONFIG;

	const landingPageConfigVm = $derived(
		data.landingPageConfigVm && Object.keys(data.landingPageConfigVm).length > 0
			? data.landingPageConfigVm
			: getLandingPageConfigDefaults()
	);
	const faqSection = getPublicMarketingLandingFaqSection('social-autopilot');

	let schemaData = $derived(data.schemaData);
	let isLoggedIn = $derived(data.isLoggedIn ?? false);

	const demoSubtitle = $derived(
		landingPageConfigVm.DEMO_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_SUBTITLE.default)
	);
	const demoTitle = $derived(
		landingPageConfigVm.DEMO_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_TITLE.default)
	);
	const demoDescription = $derived(
		landingPageConfigVm.DEMO_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_DESCRIPTION.default)
	);
	const demoYoutubeVideoId = $derived(
		landingPageConfigVm.DEMO_YOUTUBE_VIDEO_ID ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_YOUTUBE_VIDEO_ID.default)
	);
	const demoThumbnailAlt = $derived(
		landingPageConfigVm.DEMO_THUMBNAIL_ALT ||
			String(CONFIG_SCHEMA_LANDING_PAGE.DEMO_THUMBNAIL_ALT.default)
	);
	const demoHeadingId = 'social-autopilot-demo-heading';

	const pricingSubtitle = $derived(
		landingPageConfigVm.PRICING_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.PRICING_SUBTITLE.default)
	);
	const pricingTitle = $derived(
		landingPageConfigVm.PRICING_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.PRICING_TITLE.default)
	);
	const pricingDescription = $derived(
		landingPageConfigVm.PRICING_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.PRICING_DESCRIPTION.default)
	);

	const heroPrimaryCta = $derived({
		label: landing.hero.primaryCta.label,
		href: hostedMarketingHref(landing.hero.primaryCta.href, page.url.origin)
	});

	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const gettingStartedDocsBanner = PUBLIC_HUB_DOCS_BANNERS.gettingStarted;
	const landingDocsBanner = PUBLIC_HUB_DOCS_BANNERS.landing;
	const billingDocsBanner = PUBLIC_HUB_DOCS_BANNERS.pricing;
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-0 md:py-0">
	<PublicSocialAutopilotHero
		title={landing.hero.title}
		slogan={landing.hero.description}
		primaryCta={heroPrimaryCta}
		githubOwner="Ratimon"
		githubRepo="openquok-monorepo"
	/>

	<PublicLandingHeroStatBadges
		badges={landing.heroStatBadges}
		ariaLabel="Social scheduler highlights"
	/>

	<div class="mt-4 sm:mt-8">
		<WhoIsFor
			heroTheme={landingHeroTheme}
			landingSubtitle={landing.whoIsFor.audienceSubtitle}
			landingTitle={landing.whoIsFor.audienceTitle}
			cards={[...landing.whoIsFor.audienceCards]}
		/>
	</div>

	<HeroDemo
		heroTheme={landingHeroTheme}
		landingSubtitle={demoSubtitle}
		landingTitle={demoTitle}
		landingDescription={demoDescription}
		youtubeVideoId={demoYoutubeVideoId}
		thumbnailAlt={demoThumbnailAlt}
		headingId={demoHeadingId}
	/>

	<PublicSocialAutopilotProductFeatureSections
		sections={landing.productFeatureSections}
		{isLoggedIn}
	/>

	{#if data.opportunitiesPreviewVm}
		<PublicOpportunitiesPreviewGrid
			heroTheme={landingHeroTheme}
			previewVm={data.opportunitiesPreviewVm}
			showBacklinksBlock={false}
			seeAllScrollsToNavbar={true}
		/>
	{/if}

	<IconTileGrid
		heroTheme={landingHeroTheme}
		landingSubtitle={landing.featuresGridSection.subtitle}
		landingTitle={landing.featuresGridSection.title}
		landingDescription={landing.featuresGridSection.description}
		linkTiles={true}
		headingId="social-autopilot-features-grid-heading"
	/>

	<PublicMarketingPricingSection
		presetId="social-scheduler"
		productLine="social"
		{isLoggedIn}
		cmsSection={{ subtitle: pricingSubtitle, title: pricingTitle, description: pricingDescription }}
	/>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={faqSection.faqSubtitle}
			faqTitle={faqSection.faqTitle}
			faqDescription={faqSection.faqDescription}
			faqItems={[...faqSection.faqItems]}
			sectionClass="py-16 sm:py-20"
		/>

		<AccentSplitCtaBanner
			title={gettingStartedDocsBanner.title}
			description={gettingStartedDocsBanner.description}
			ctaText={gettingStartedDocsBanner.ctaText}
			ctaHref={gettingStartedDocsBanner.docsPath}
			sectionClass="mt-8"
		/>

		<AccentSplitCtaBanner
			title={landingDocsBanner.title}
			description={landingDocsBanner.description}
			ctaText={landingDocsBanner.ctaText}
			ctaHref={landingDocsBanner.docsPath}
			sectionClass="mt-8"
		/>

		<AccentSplitCtaBanner
			title={billingDocsBanner.title}
			description={billingDocsBanner.description}
			ctaText={billingDocsBanner.ctaText}
			ctaHref={billingDocsBanner.docsPath}
			sectionClass="mt-8"
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
