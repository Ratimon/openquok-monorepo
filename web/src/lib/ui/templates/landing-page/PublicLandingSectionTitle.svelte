<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		title: string;
		headingId?: string;
		heroTheme?: LandingHeroTheme;
		class?: string;
		/** Split on commas for multi-clause feature-row titles. */
		commaSeparated?: boolean;
	};

	let {
		title,
		headingId,
		heroTheme = landingHeroTheme,
		class: className = '',
		commaSeparated = false
	}: Props = $props();

	const titleParts = $derived(
		commaSeparated
			? title
					.split(',')
					.map((part) => part.trim())
					.filter((part) => part.length > 0)
			: [title]
	);
</script>

<h2
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
		<span class={layoutClass}>
			{#each segments as seg, segmentIndex (segmentIndex)}
				{#if seg.highlight}
					<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
				{:else}
					<span class={heroTheme.titleSegmentClass(segmentIndex, segments)}>{seg.text}</span>
				{/if}
			{/each}{#if commaSeparated && titleParts.length < 3 && partIndex < titleParts.length - 1},{/if}
		</span>
	{/each}
</h2>
