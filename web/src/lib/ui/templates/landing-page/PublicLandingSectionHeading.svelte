<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type HeadingLevel = 'h1' | 'h2' | 'h3';
	type GradientMode = 'segment' | 'part';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
		headingLevel?: HeadingLevel;
		/** Split on commas for multi-clause titles. Defaults to true when the title contains a comma. */
		commaSeparated?: boolean;
		/** `segment` — per-word gradients inside each clause (feature rows). `part` — per-clause gradients (FAQ, audience). */
		gradientMode?: GradientMode;
	};

	let {
		title,
		headingId,
		heroTheme = landingHeroTheme,
		class: className = '',
		headingLevel = 'h2',
		commaSeparated,
		gradientMode = 'segment'
	}: Props = $props();

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
	class={cn(
		'text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl',
		className
	)}
>
	{#each titleParts as part, partIndex (partIndex)}
		{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
		{@const layoutClass =
			titleParts.length >= 3 ? 'block' : partIndex > 0 ? 'block sm:inline' : ''}
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
