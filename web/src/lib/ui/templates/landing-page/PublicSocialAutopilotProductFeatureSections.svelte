<script lang="ts">
	import { page } from '$app/state';

	import type { PublicAgentFeatureSection as FeatureSectionConfig } from '$lib/content/constants/agents';
	import type { PublicSocialAutopilotProductFeatureSections } from '$lib/content/constants/marketing/social-autopilot-landing';
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
		sections: PublicSocialAutopilotProductFeatureSections;
		isLoggedIn?: boolean;
	};

	let { sections, isLoggedIn = false }: Props = $props();

	const featureCtaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA;
	const ctaHref = $derived(hostedMarketingHref('/pricing', page.url.origin));

	const feature9Section = $derived<FeatureSectionConfig>({
		subtitle: sections.feature9ParallelScale.subtitle,
		title: sections.feature9ParallelScale.title,
		description: sections.feature9ParallelScale.description,
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
		cliCommandsTitle: sections.feature9ParallelScale.cliCommandsTitle,
		cliCommands: sections.feature9ParallelScale.cliCommands
	});
</script>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature1.subtitle}
	landingTitle={sections.feature1.title}
	landingDescription={sections.feature1.description}
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
	landingSubtitle={sections.feature2.subtitle}
	landingTitle={sections.feature2.title}
	landingDescription={sections.feature2.description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
	{isLoggedIn}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature3.subtitle}
	landingTitle={sections.feature3.title}
	landingDescription={sections.feature3.description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
>
	{#snippet rightMedia()}
		<BentoLandingComposeSettings {isLoggedIn} />
	{/snippet}
</HeroWithRightMedia>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature4.subtitle}
	landingTitle={sections.feature4.title}
	landingDescription={sections.feature4.description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
>
	{#snippet leftMedia()}
		<BentoLandingCrossAccountPlugs {isLoggedIn} />
	{/snippet}
</HeroWithLeftMedia>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature5.subtitle}
	landingTitle={sections.feature5.title}
	landingDescription={sections.feature5.description}
	imageSrc="/landing/5-calendar-filters-views.mp4"
	imageAlt="Calendar day, week, month, and list views with smart filters"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature6.subtitle}
	landingTitle={sections.feature6.title}
	landingDescription={sections.feature6.description}
	imageSrc="/landing/6-kanban-filters-drag-drop.mp4"
	imageAlt="Kanban board with drag-and-drop review workflow"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature7.subtitle}
	landingTitle={sections.feature7.title}
	landingDescription={sections.feature7.description}
	imageSrc="/landing/7-file-manager.mp4"
	imageAlt="Workspace-scoped file manager for media assets"
	ctaText={featureCtaText}
	ctaHref={ctaHref}
/>

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature8.subtitle}
	landingTitle={sections.feature8.title}
	landingDescription={sections.feature8.description}
	imageSrc="/landing/8-analytics.mp4"
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
