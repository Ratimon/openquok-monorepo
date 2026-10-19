<script lang="ts">
	import { page } from '$app/state';

	import type { PublicDirectorySubmissionProductFeatureSections } from '$lib/content/constants/marketing/directory-submission-landing';
	import { PUBLIC_LANDING_COMPACT_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	import AnimatedBeamDirectoryProfile from '$lib/ui/templates/landing-page/AnimatedBeamDirectoryProfile.svelte';
	import BentoLandingDirectoryProfileCases from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingDirectoryProfileCases.svelte';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import PublicLandingTeamFeatureHero from '$lib/ui/templates/landing-page/PublicLandingTeamFeatureHero.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		sections: PublicDirectorySubmissionProductFeatureSections;
		isLoggedIn?: boolean;
	};

	let { sections, isLoggedIn = false }: Props = $props();

	const featureCtaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA;
	const ctaHref = $derived(hostedMarketingHref(publicFaqHref.signUp, page.url.origin));
</script>

<HeroWithRightMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature1.subtitle}
	landingTitle={sections.feature1.title}
	landingDescription={sections.feature1.description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
	bgColorClass="bg-base-100"
	mediaContainerClass="max-w-4xl"
>
	{#snippet rightMedia()}
		<div class="flex h-full w-full items-stretch" aria-hidden="true">
			<AnimatedBeamDirectoryProfile />
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

<HeroWithLeftMedia
	heroTheme={landingHeroTheme}
	landingSubtitle={sections.feature3.subtitle}
	landingTitle={sections.feature3.title}
	landingDescription={sections.feature3.description}
	ctaText={featureCtaText}
	ctaHref={ctaHref}
	bgColorClass="bg-base-100"
>
	{#snippet leftMedia()}
		<BentoLandingDirectoryProfileCases />
	{/snippet}
</HeroWithLeftMedia>
