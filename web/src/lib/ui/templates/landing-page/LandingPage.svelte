<script lang="ts">
	import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
	import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
	import type { PublicAgentFeatureSection as FeatureSectionConfig } from '$lib/content/constants/publicAgentConfig';
	import type { PublicListingsPreviewVm } from '$lib/listings/server/loadAgentListingsPreview.server';

	import { icons } from '$data/icons';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		CONFIG_SCHEMA_LANDING_PAGE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import AnimatedBeamMultipleAgent from '$lib/ui/templates/landing-page/AnimatedBeamMultipleAgent.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import HeroDemo from '$lib/ui/templates/landing-page/HeroDemo.svelte';
	import HeroMain from '$lib/ui/templates/landing-page/HeroMain.svelte';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import BentoLandingComposeSettings from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingComposeSettings.svelte';
	import PublicAgentFeatureSection from '$lib/ui/templates/landing-page/PublicAgentFeatureSection.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import IconTileGrid from '$lib/ui/templates/feature-grid/IconTileGrid.svelte';
	import PublicListingsPreviewDualGrid from '$lib/ui/components/listings/PublicListingsPreviewDualGrid.svelte';
	import PublicPricingTabs from '$lib/ui/components/pricing/PublicPricingTabs.svelte';
	import WhoIsFor from '$lib/ui/templates/WhoIsFor.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		landingPageConfigVm?: Record<string, string>;
		publicFaqConfigVm?: Record<string, string>;
		publicFaqItemsVm?: PublicFaqItem[];
		listingsPreviewVm: PublicListingsPreviewVm;
		isLoggedIn?: boolean;
	};

	let {
		landingPageConfigVm = {},
		publicFaqConfigVm = {},
		publicFaqItemsVm = [],
		listingsPreviewVm,
		isLoggedIn = false
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

	const featuresGridTitle = $derived(
		landingPageConfigVm.FEATURES_GRID_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURES_GRID_TITLE.default)
	);
	const featuresGridDescription = $derived(
		landingPageConfigVm.FEATURES_GRID_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURES_GRID_DESCRIPTION.default)
	);

	const feature1Subtitle = $derived(
		landingPageConfigVm.FEATURE_1_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_SUBTITLE.default)
	);
	const feature1Title = $derived(
		landingPageConfigVm.FEATURE_1_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_TITLE.default)
	);
	const feature1Description = $derived(
		landingPageConfigVm.FEATURE_1_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_1_DESCRIPTION.default)
	);

	const feature2Subtitle = $derived(
		landingPageConfigVm.FEATURE_2_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_SUBTITLE.default)
	);
	const feature2Title = $derived(
		landingPageConfigVm.FEATURE_2_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_TITLE.default)
	);
	const feature2Description = $derived(
		landingPageConfigVm.FEATURE_2_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_2_DESCRIPTION.default)
	);

	const feature3Subtitle = $derived(
		landingPageConfigVm.FEATURE_3_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_SUBTITLE.default)
	);
	const feature3Title = $derived(
		landingPageConfigVm.FEATURE_3_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_TITLE.default)
	);
	const feature3Description = $derived(
		landingPageConfigVm.FEATURE_3_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_3_DESCRIPTION.default)
	);

	const feature4Subtitle = $derived(
		landingPageConfigVm.FEATURE_4_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_SUBTITLE.default)
	);
	const feature4Title = $derived(
		landingPageConfigVm.FEATURE_4_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_TITLE.default)
	);
	const feature4Description = $derived(
		landingPageConfigVm.FEATURE_4_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_4_DESCRIPTION.default)
	);

	const feature5Subtitle = $derived(
		landingPageConfigVm.FEATURE_5_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_SUBTITLE.default)
	);
	const feature5Title = $derived(
		landingPageConfigVm.FEATURE_5_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_TITLE.default)
	);
	const feature5Description = $derived(
		landingPageConfigVm.FEATURE_5_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_5_DESCRIPTION.default)
	);

	const feature6Subtitle = $derived(
		landingPageConfigVm.FEATURE_6_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_6_SUBTITLE.default)
	);
	const feature6Title = $derived(
		landingPageConfigVm.FEATURE_6_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_6_TITLE.default)
	);
	const feature6Description = $derived(
		landingPageConfigVm.FEATURE_6_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_6_DESCRIPTION.default)
	);

	const feature7Subtitle = $derived(
		landingPageConfigVm.FEATURE_7_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_7_SUBTITLE.default)
	);
	const feature7Title = $derived(
		landingPageConfigVm.FEATURE_7_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_7_TITLE.default)
	);
	const feature7Description = $derived(
		landingPageConfigVm.FEATURE_7_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_7_DESCRIPTION.default)
	);

	const feature7Section = $derived<FeatureSectionConfig>({
		subtitle: feature7Subtitle,
		title: feature7Title,
		description: feature7Description,
		parallelMocks: [
			{
				deviceMock: 'desktop',
				deviceMockContent: 'agent-parallel-schedule',
				imageAlt: 'Desktop agent session scheduling posts in parallel'
			},
			{
				deviceMock: 'iphone-15-pro',
				deviceMockContent: 'telegram-analytics',
				imageAlt: 'Mobile agent chat pulling post analytics while desktop sessions run'
			}
		],
		imageAlt: 'Parallel OpenQuok agent sessions on desktop and mobile',
		mediaOnRight: true,
		cliCommandsTitle: 'Parallel CLI sessions',
		cliCommands: `# Session A — draft + schedule
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:status <post-id> -s schedule

# Session B — metrics (runs at the same time)
openquok analytics:platform <integration-uuid> -d 7
openquok analytics:post <post-id> -d 30`
	});

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

	const secondaryCtaText = 'Get Started For Free';
	const secondaryCtaHref = '/pricing';
	const pricingCtaHref = $derived(isLoggedIn ? '/account/billing' : '/sign-up');
	const pricingCtaLabel = $derived(isLoggedIn ? 'Manage billing' : 'Start for $0');

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const landingDocsBanner = PUBLIC_HUB_DOCS_BANNERS.landing;

	const whoIsForCards: AudienceCard[] = [
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agentic',
			description:
				'Model-agnostic: use the assistant agents and models that work best for you. Our CLI lets them draft and schedule posts from the AI tools you already use.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Developers',
			description:
				'Fully open source: use OAuth, our SDK, and API to build your own content OS without have to write your own APIs. Connect once, publish everywhere.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Scaling Team',
			description:
				'Reuse the viral formats that already work for you. Connect more social channels, and scale — automate, approve, and publish everywhere.',
			containerClass: 'h-full min-h-[18rem]'
		}
	];


</script>

<HeroMain
	{heroTitle}
	{heroSlogan}
	ctaTextPrimary={secondaryCtaText}
	ctaHrefPrimary={secondaryCtaHref}
	githubOwner="Ratimon"
	githubRepo="openquok-monorepo"
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

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature1Subtitle}
	landingTitle={feature1Title}
	landingDescription={feature1Description}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
	mediaContainerClass="max-w-4xl"
>
	{#snippet rightMedia()}
		<div
			class="flex h-full w-full flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:gap-4"
			aria-hidden="true"
		>
			<div class="flex min-h-72 min-w-0 flex-1 items-stretch">
				<AnimatedBeamMultipleAgent />
			</div>
			<div
				class="mx-auto flex h-[360px] w-full max-w-[200px] shrink-0 items-center justify-center overflow-hidden sm:h-full sm:max-w-[220px] lg:max-w-[240px]"
			>
				<Iphone15ProMock class="h-full w-auto max-w-full">
					<Iphone15ProMockContent content="telegram-connect" />
				</Iphone15ProMock>
			</div>
		</div>
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature2Subtitle}
	landingTitle={feature2Title}
	landingDescription={feature2Description}
	imageSrc="/landing/2-calendar-filters.mp4"
	imageAlt="Calendar with smart filters for scheduled posts"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature3Subtitle}
	landingTitle={feature3Title}
	landingDescription={feature3Description}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
>
	{#snippet rightMedia()}
		<BentoLandingComposeSettings />
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature4Subtitle}
	landingTitle={feature4Title}
	landingDescription={feature4Description}
	imageSrc="/landing/3-kanban-filters.mp4"
	imageAlt="Kanban board for reviewing AI-generated drafts"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature5Subtitle}
	landingTitle={feature5Title}
	landingDescription={feature5Description}
	imageSrc="/landing/4-file-manager.mp4"
	imageAlt="Workspace-scoped file manager for media assets"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature6Subtitle}
	landingTitle={feature6Title}
	landingDescription={feature6Description}
	imageSrc="/landing/5-analytics.mp4"
	imageAlt="Analytics dashboard across social channels"
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<PublicAgentFeatureSection
	section={feature7Section}
	index={6}
	ctaText={secondaryCtaText}
	ctaHref={secondaryCtaHref}
/>

<PublicListingsPreviewDualGrid
	heroTheme={landingHeroTheme}
	previewVm={listingsPreviewVm}
	seeAllScrollsToNavbar={true}
/>

<IconTileGrid
	heroTheme={landingHeroTheme}
	landingTitle={featuresGridTitle}
	landingDescription={featuresGridDescription}
/>

<PublicPricingTabs
	heroTheme={landingHeroTheme}
	landingSubtitle={pricingSubtitle}
	landingTitle={pricingTitle}
	landingDescription={pricingDescription}
	ctaHref={pricingCtaHref}
	ctaLabel={pricingCtaLabel}
	secondaryCtaHref="/pricing#pricing-compare"
	secondaryCtaLabel="Compare all features"
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
		title={landingDocsBanner.title}
		description={landingDocsBanner.description}
		ctaText={landingDocsBanner.ctaText}
		ctaHref={landingDocsBanner.docsPath}
	/>

	<CenteredDarkCtaBanner
		title={CENTERED_DARK_CTA_BANNER_TITLE}
		description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
		ctaText={PUBLIC_BANNER_CTA_TEXT}
		ctaHref={signUpPath}
		sectionClass="pb-16 sm:pb-20"
	/>
</div>

