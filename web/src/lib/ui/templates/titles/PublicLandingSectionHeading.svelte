<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';
	import { splitPublicLandingTitleParts } from '$lib/ui/templates/titles/splitPublicLandingTitleParts';

	type HeadingLevel = 'h1' | 'h2' | 'h3';
	type GradientMode = 'segment' | 'part';
	type TitleScale = 'section' | 'main';

	const SECTION_TITLE_CLASS =
		'text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
		/** `main` matches home `HeroMain` (`text-4xl`–`lg:text-6xl`). */
		titleScale?: TitleScale;
		headingLevel?: HeadingLevel;
		/** When false, keep the title on one line (commas stay in copy). Default: split on newlines or commas. */
		commaSeparated?: boolean;
		/** `part` — per-clause gradients (feature rows with commas, FAQ, audience). `segment` — per-word gradients inside each clause when the title has no commas. */
		gradientMode?: GradientMode;
	};

	let {
		title,
		headingId,
		heroTheme = landingHeroTheme,
		class: className = '',
		titleScale = 'section',
		headingLevel = 'h2',
		commaSeparated,
		gradientMode = 'segment'
	}: Props = $props();

	const titleParts = $derived(splitPublicLandingTitleParts(title, commaSeparated));

	const headingClass = $derived(
		cn(
			titleScale === 'main' ? PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS : SECTION_TITLE_CLASS,
			titleParts.length === 1 ? 'text-balance' : '',
			className
		)
	);
</script>

<svelte:element
	this={headingLevel}
	id={headingId}
	class={headingClass}
>
	{#each titleParts as part, partIndex (partIndex)}
		{#if partIndex > 0}<br aria-hidden="true" />{/if}
		{#if gradientMode === 'part'}
			{@const partClass = heroTheme.titlePartClass(partIndex, titleParts.length)}
			{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
			{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
				<span>
					{#each segments as seg, segmentIndex (segmentIndex)}
						{#if seg.highlight}
							<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
						{:else}
							<span class={partClass}>{seg.text}</span>
						{/if}
					{/each}
				</span>
			{:else}
				<span class={partClass}>{part}</span>
			{/if}
		{:else}
			{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
			<span>
				{#each segments as seg, segmentIndex (segmentIndex)}
					{#if seg.highlight}
						<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
					{:else}
						<span class={heroTheme.titleSegmentClass(segmentIndex, segments)}>{seg.text}</span>
					{/if}
				{/each}
			</span>
		{/if}
	{/each}
</svelte:element>
