<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
	import type { PublicFaqItem } from '$lib/content/constants/faq';
	import type { PublicOpportunitiesPreviewVm } from '$lib/opportunities/server/loadAgentOpportunitiesPreview.server';

	import { page } from '$app/state';
	import { PUBLIC_LANDING_WHO_IS_FOR_CARDS } from '$lib/content/constants/landing/who-is-for';
	import { PUBLIC_LANDING_HERO_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		CONFIG_SCHEMA_LANDING_PAGE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import HeroDemo from '$lib/ui/templates/landing-page/HeroDemo.svelte';
	import HeroMain from '$lib/ui/templates/landing-page/HeroMain.svelte';
	import PublicLandingCmsFeatureSections from '$lib/ui/templates/landing-page/PublicLandingCmsFeatureSections.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import IconTileGrid from '$lib/ui/templates/feature-grid/IconTileGrid.svelte';
	import PublicOpportunitiesPreviewGrid from '$lib/ui/templates/opportunities-preview/PublicOpportunitiesPreviewGrid.svelte';
	import PublicMarketingPricingSection from '$lib/ui/components/pricing/PublicMarketingPricingSection.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		landingPageConfigVm?: Record<string, string>;
		publicFaqConfigVm?: Record<string, string>;
		publicFaqItemsVm?: PublicFaqItem[];
		opportunitiesPreviewVm: PublicOpportunitiesPreviewVm;
		isLoggedIn?: boolean;
		heroBreadcrumb?: Snippet;
	};

	let {
		landingPageConfigVm = {},
		publicFaqConfigVm = {},
		publicFaqItemsVm = [],
		opportunitiesPreviewVm,
		isLoggedIn = false,
		heroBreadcrumb
	}: Props = $props();

	const heroTitle = $derived(
		landingPageConfigVm.HERO_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_TITLE.default)
	);
	const heroSlogan = $derived(
		landingPageConfigVm.HERO_SLOGAN || String(CONFIG_SCHEMA_LANDING_PAGE.HERO_SLOGAN.default)
	);

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

	const demoHeadingId = 'landing-demo-heading';

	const audienceSubtitle = $derived(
		landingPageConfigVm.AUDIENCE_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.AUDIENCE_SUBTITLE.default)
	);
	const audienceTitle = $derived(
		landingPageConfigVm.AUDIENCE_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.AUDIENCE_TITLE.default)
	);

	const featuresGridSubtitle = $derived(
		landingPageConfigVm.FEATURES_GRID_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURES_GRID_SUBTITLE.default)
	);
	const featuresGridTitle = $derived(
		landingPageConfigVm.FEATURES_GRID_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURES_GRID_TITLE.default)
	);
	const featuresGridDescription = $derived(
		landingPageConfigVm.FEATURES_GRID_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURES_GRID_DESCRIPTION.default)
	);

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

	const faqSubtitle = $derived(
		landingPageConfigVm.FAQ_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FAQ_SUBTITLE.default)
	);
	const faqTitle = $derived(
		landingPageConfigVm.FAQ_TITLE || String(CONFIG_SCHEMA_LANDING_PAGE.FAQ_TITLE.default)
	);
	const faqDescription = $derived(
		landingPageConfigVm.FAQ_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FAQ_DESCRIPTION.default)
	);

	const heroCtaText = PUBLIC_LANDING_HERO_TRIAL_CTA;
	const secondaryCtaHref = $derived(hostedMarketingHref('/pricing', page.url.origin));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const gettingStartedDocsBanner = PUBLIC_HUB_DOCS_BANNERS.gettingStarted;
	const landingDocsBanner = PUBLIC_HUB_DOCS_BANNERS.landing;
	const billingDocsBanner = PUBLIC_HUB_DOCS_BANNERS.pricing;

	const whoIsForCards: AudienceCard[] = [...PUBLIC_LANDING_WHO_IS_FOR_CARDS];


</script>

<HeroMain
	{heroTitle}
	{heroSlogan}
	ctaTextPrimary={heroCtaText}
	ctaHrefPrimary={secondaryCtaHref}
	githubOwner="Ratimon"
	githubRepo="openquok-monorepo"
	breadcrumb={heroBreadcrumb}
/>

<HeroDemo
	heroTheme={landingHeroTheme}
	landingSubtitle={demoSubtitle}
	landingTitle={demoTitle}
	landingDescription={demoDescription}
	youtubeVideoId={demoYoutubeVideoId}
	thumbnailAlt={demoThumbnailAlt}
	headingId={demoHeadingId}
/>

<WhoIsFor
	heroTheme={landingHeroTheme}
	landingSubtitle={audienceSubtitle}
	landingTitle={audienceTitle}
	cards={whoIsForCards}
/>

<PublicLandingCmsFeatureSections
	{landingPageConfigVm}
	{isLoggedIn}
	/>

<PublicOpportunitiesPreviewGrid
	heroTheme={landingHeroTheme}
	previewVm={opportunitiesPreviewVm}
	seeAllScrollsToNavbar={true}
/>

<IconTileGrid
	heroTheme={landingHeroTheme}
	variant="home"
	landingSubtitle={featuresGridSubtitle}
	landingTitle={featuresGridTitle}
	landingDescription={featuresGridDescription}
/>

<PublicMarketingPricingSection
	presetId="home"
	{isLoggedIn}
	cmsSection={{ subtitle: pricingSubtitle, title: pricingTitle, description: pricingDescription }}
/>

<div class="container mx-auto px-4">
	<PublicFaq
		heroTheme={landingHeroTheme}
		{faqSubtitle}
		{faqTitle}
		{faqDescription}
		faqConfigVm={publicFaqConfigVm}
		faqItems={publicFaqItemsVm}
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

