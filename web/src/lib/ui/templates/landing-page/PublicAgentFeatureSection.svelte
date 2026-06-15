<script lang="ts">
	import type { PublicAgentFeatureSection } from '$lib/content/constants/publicAgentConfig';

	import HeroWithLeftMedia from '$lib/ui/templates/HeroWithLeftMedia.svelte';
	import HeroWithRightMedia from '$lib/ui/templates/HeroWithRightMedia.svelte';
	import PublicAgentFeatureMedia from '$lib/ui/templates/landing-page/PublicAgentFeatureMedia.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		section: PublicAgentFeatureSection;
		index: number;
		ctaText: string;
		ctaHref: string;
	};

	let { section, index, ctaText, ctaHref }: Props = $props();

	const bgColorClass = $derived(index % 2 === 0 ? 'bg-base-100' : 'bg-base-200');
	const sharedHeroProps = $derived({
		heroTheme: landingHeroTheme,
		landingSubtitle: section.subtitle,
		landingTitle: section.title,
		landingDescription: section.description,
		imageSrc: section.imageSrc,
		imageAlt: section.imageAlt,
		showCta: false,
		ctaText,
		ctaHref,
		bgColorClass
	});
</script>

{#if section.mediaOnRight !== false}
	{#if section.deviceMock}
		<HeroWithRightMedia
			{...sharedHeroProps}
			imageSrc={undefined}
			mediaContainerClass="max-w-[320px]"
			mediaColumnClass="justify-center"
		>
			{#snippet rightMedia()}
				<PublicAgentFeatureMedia {section} />
			{/snippet}
		</HeroWithRightMedia>
	{:else}
		<HeroWithRightMedia {...sharedHeroProps} />
	{/if}
{:else if section.deviceMock}
	<HeroWithLeftMedia
		{...sharedHeroProps}
		imageSrc={undefined}
		mediaContainerClass="max-w-[320px]"
		mediaColumnClass="justify-center"
	>
		{#snippet leftMedia()}
			<PublicAgentFeatureMedia {section} />
		{/snippet}
	</HeroWithLeftMedia>
{:else}
	<HeroWithLeftMedia {...sharedHeroProps} />
{/if}
