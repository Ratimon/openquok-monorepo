<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type HeadingLevel = 'h1' | 'h2' | 'h3';
	type GradientMode = 'segment' | 'part';
	type TitleScale = 'section' | 'main';

	const SECTION_TITLE_CLASS =
		'text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
		/** `main` matches home `HeroMain` (`text-4xl`–`lg:text-6xl`). */
		titleScale?: TitleScale;
		headingLevel?: HeadingLevel;
		/** Split on commas for multi-clause titles. Defaults to true when the title contains a comma. */
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

	const headingClass = $derived(
		cn(
			titleScale === 'main' ? PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS : SECTION_TITLE_CLASS,
			className
		)
	);

	const splitOnCommas = $derived(commaSeparated ?? title.includes(','));

	const titleParts = $derived(
		splitOnCommas
			? title
					.split(',')
					.map((part) => part.trim())
					.filter((part) => part.length > 0)
			: [title]
	);
</script>

<svelte:element
	this={headingLevel}
	id={headingId}
	class={headingClass}
>
	{#each titleParts as part, partIndex (partIndex)}
		{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
		{@const layoutClass =
			titleScale === 'main' || titleParts.length >= 3
				? 'block'
				: partIndex > 0
					? 'block sm:inline'
					: ''}
		{#if gradientMode === 'part'}
			{@const partClass = heroTheme.titlePartClass(partIndex, titleParts.length)}
			{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
				<span class={layoutClass}>
					{#each segments as seg, segmentIndex (segmentIndex)}
						{#if seg.highlight}
							<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
						{:else}
							<span class={partClass}>{seg.text}</span>
						{/if}
					{/each}{#if titleParts.length < 3 && partIndex < titleParts.length - 1},{/if}
				</span>
			{:else}
				<span class="{partClass} {layoutClass}">
					{part}{#if titleParts.length < 3 && partIndex < titleParts.length - 1},{/if}
				</span>
			{/if}
		{:else}
			<span class={layoutClass}>
				{#each segments as seg, segmentIndex (segmentIndex)}
					{#if seg.highlight}
						<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
					{:else}
						<span class={heroTheme.titleSegmentClass(segmentIndex, segments)}>{seg.text}</span>
					{/if}
				{/each}{#if splitOnCommas && titleParts.length < 3 && partIndex < titleParts.length - 1},{/if}
			</span>
		{/if}
	{/each}
</svelte:element>
