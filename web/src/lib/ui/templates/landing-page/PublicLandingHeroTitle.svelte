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
	};

	let {
		title,
		headingId,
		heroTheme = landingHeroTheme,
		class: className = ''
	}: Props = $props();

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(title));
</script>

<h1
	id={headingId}
	class={cn(
		'text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl',
		className
	)}
>
	{#each titleSegments as seg, segmentIndex (segmentIndex)}
		{#if seg.highlight}
			<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
		{:else}
			<span class={heroTheme.titleSegmentClass(segmentIndex, titleSegments)}>{seg.text}</span>
		{/if}
	{/each}
</h1>
