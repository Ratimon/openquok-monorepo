<script lang="ts">
	import { page } from '$app/state';

	import type { PublicAgentFeatureSection as FeatureSectionConfig } from '$lib/content/constants/agents';
	import { CONFIG_SCHEMA_LANDING_PAGE } from '$lib/config/constants/config';
	import { PUBLIC_LANDING_COMPACT_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	import AnimatedBeamMultipleAgent from '$lib/ui/templates/landing-page/AnimatedBeamMultipleAgent.svelte';
	import BentoLandingComposeSettings from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingComposeSettings.svelte';
	import BentoLandingCrossAccountPlugs from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingCrossAccountPlugs.svelte';
	import Iphone15ProMock from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMock.svelte';
	import Iphone15ProMockContent from '$lib/ui/templates/device-mocks/iphone-15-pro/Iphone15ProMockContent.svelte';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import PublicAgentFeatureSection from '$lib/ui/templates/landing-page/PublicAgentFeatureSection.svelte';
	import PublicLandingTeamFeatureHero from '$lib/ui/templates/landing-page/PublicLandingTeamFeatureHero.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		landingPageConfigVm: Record<string, string>;
		isLoggedIn?: boolean;
	};

	let { landingPageConfigVm, isLoggedIn = false }: Props = $props();

	const featureCtaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA;
	const ctaHref = $derived(hostedMarketingHref('/pricing', page.url.origin));

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
	const feature8Subtitle = $derived(
		landingPageConfigVm.FEATURE_8_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_8_SUBTITLE.default)
	);
	const feature8Title = $derived(
		landingPageConfigVm.FEATURE_8_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_8_TITLE.default)
	);
	const feature8Description = $derived(
		landingPageConfigVm.FEATURE_8_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_8_DESCRIPTION.default)
	);
	const feature9Subtitle = $derived(
		landingPageConfigVm.FEATURE_9_SUBTITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_9_SUBTITLE.default)
	);
	const feature9Title = $derived(
		landingPageConfigVm.FEATURE_9_TITLE ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_9_TITLE.default)
	);
	const feature9Description = $derived(
		landingPageConfigVm.FEATURE_9_DESCRIPTION ||
			String(CONFIG_SCHEMA_LANDING_PAGE.FEATURE_9_DESCRIPTION.default)
	);

	const feature9Section = $derived<FeatureSectionConfig>({
		subtitle: feature9Subtitle,
		title: feature9Title,
		description: feature9Description,
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
</script>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature1Subtitle}
	landingTitle={feature1Title}
	landingDescription={feature1Description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
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

<PublicLandingTeamFeatureHero
	heroTheme={landingHeroTheme}
	landingSubtitle={feature2Subtitle}
	landingTitle={feature2Title}
	landingDescription={feature2Description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
	{isLoggedIn}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature3Subtitle}
	landingTitle={feature3Title}
	landingDescription={feature3Description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
>
	{#snippet rightMedia()}
		<BentoLandingComposeSettings {isLoggedIn} />
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature4Subtitle}
	landingTitle={feature4Title}
	landingDescription={feature4Description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
>
	{#snippet leftMedia()}
		<BentoLandingCrossAccountPlugs {isLoggedIn} />
	{/snippet}
</HeroWithLeftMedia>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature5Subtitle}
	landingTitle={feature5Title}
	landingDescription={feature5Description}
	imageSrc="/landing/calendar-filters-views.mp4"
	imageAlt="Calendar day, week, month, and list views with smart filters"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature6Subtitle}
	landingTitle={feature6Title}
	landingDescription={feature6Description}
	imageSrc="/landing/kanban-filters-drag-drop.mp4"
	imageAlt="Kanban board with drag-and-drop review workflow"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature7Subtitle}
	landingTitle={feature7Title}
	landingDescription={feature7Description}
	imageSrc="/landing/file-manager.mp4"
	imageAlt="Workspace-scoped file manager for media assets"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={feature8Subtitle}
	landingTitle={feature8Title}
	landingDescription={feature8Description}
	imageSrc="/landing/analytics.mp4"
	imageAlt="Analytics dashboard across social channels"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<PublicAgentFeatureSection
	section={feature9Section}
	index={8}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>
