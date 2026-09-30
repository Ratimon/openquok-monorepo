<script lang="ts">
	import { page } from '$app/state';

	import {
		PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS,
		type PublicApiMarketingFeatureSection
	} from '$lib/content/constants/channels/api/_shared/publicApiCapabilityHubFeatureConfig';
	import { PUBLIC_LANDING_COMPACT_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type Props = {
		sections?: readonly PublicApiMarketingFeatureSection[];
	};

	let { sections = PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS }: Props = $props();
</script>

{#each sections as section, index (section.subtitle)}
	{@const pricingHref = hostedMarketingHref('/pricing', page.url.origin)}
	{@const docsHref = hostedMarketingHref(section.docsPath, page.url.origin)}
	{#snippet terminalMedia()}
		<TerminalCommandMock
			code={section.terminalCode}
			ariaLabel={section.terminalAriaLabel}
			class="w-full"
		/>
	{/snippet}

	{#if section.mediaOnRight !== false}
		<HeroWithRightMedia
			heroTheme={landingHeroTheme}
			landingSubtitle={section.subtitle}
			landingTitle={section.title}
			landingDescription={section.description}
			primaryCtaText={PUBLIC_LANDING_COMPACT_TRIAL_CTA}
			primaryCtaHref={pricingHref}
			secondaryCtaText={section.docsCtaLabel}
			secondaryCtaHref={docsHref}
			showCta={true}
			rightMedia={terminalMedia}
			mediaContainerClass="max-w-3xl"
			mediaColumnClass="justify-center"
			bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
		/>
	{:else}
		<HeroWithLeftMedia
			heroTheme={landingHeroTheme}
			landingSubtitle={section.subtitle}
			landingTitle={section.title}
			landingDescription={section.description}
			primaryCtaText={PUBLIC_LANDING_COMPACT_TRIAL_CTA}
			primaryCtaHref={pricingHref}
			secondaryCtaText={section.docsCtaLabel}
			secondaryCtaHref={docsHref}
			showCta={true}
			leftMedia={terminalMedia}
			mediaContainerClass="max-w-3xl"
			mediaColumnClass="justify-center"
			bgColorClass={index % 2 === 0 ? 'bg-base-100' : 'bg-base-200'}
		/>
	{/if}
{/each}
