<script lang="ts">
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import { PUBLIC_LANDING_COMPACT_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import BentoLandingTeam from '$lib/ui/templates/bento/minor-templates/landing/BentoLandingTeam.svelte';

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;
		ctaText?: string;
		ctaHref?: string;
		showCta?: boolean;
		bgColorClass?: string;
		isLoggedIn?: boolean;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		ctaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA,
		ctaHref = '/pricing',
		showCta = true,
		bgColorClass = 'bg-base-200',
		isLoggedIn
	}: Props = $props();
</script>

<HeroWithLeftMedia
	{heroTheme}
	{landingSubtitle}
	{landingTitle}
	{landingDescription}
	{ctaText}
	{ctaHref}
	{showCta}
	{bgColorClass}
>
	{#snippet leftMedia()}
		<BentoLandingTeam {isLoggedIn} />
	{/snippet}
</HeroWithLeftMedia>
