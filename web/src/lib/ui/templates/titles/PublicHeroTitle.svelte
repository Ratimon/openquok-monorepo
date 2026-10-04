<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import type {
		PublicHeroStyledSegment,
		PublicHeroTitleHeadingLevel
	} from '$lib/ui/templates/titles/publicHeroTitle.types';

	type Props = {
		/** Dictionary-driven gradient + highlight chips (marketing / account / listing names). */
		title?: string;
		/** Explicit plain / sticker / underline segments (creator listing hero). */
		styledSegments?: PublicHeroStyledSegment[];
		headingId?: string;
		headingLevel?: PublicHeroTitleHeadingLevel;
		heroTheme?: LandingHeroTheme;
		class?: string;
	};

	let {
		title = '',
		styledSegments,
		headingId,
		headingLevel = 'h1',
		heroTheme = landingHeroTheme,
		class: className = ''
	}: Props = $props();

	const dictionarySegments = $derived(
		title.trim() ? heroTheme.parseLandingHeroTitlePartSegments(title) : []
	);

	const highlightMappedStyledSegments = $derived(
		(styledSegments ?? []).map((seg) => ({
			text: seg.text,
			highlight: seg.style === 'sticker'
		}))
	);

	const useStyledSegments = $derived((styledSegments?.length ?? 0) > 0);
</script>

<svelte:element
	this={headingLevel}
	id={headingId}
	class={cn(
		'text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl',
		className
	)}
>
	{#if useStyledSegments && styledSegments}
		{#each styledSegments as seg, segmentIndex (segmentIndex)}
			{#if seg.style === 'sticker'}
				<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
			{:else if seg.style === 'underline'}
				<span
					class="underline decoration-2 underline-offset-[0.2em] decoration-primary text-base-content"
				>
					{seg.text}
				</span>
			{:else}
				<span
					class={heroTheme.titleSegmentClass(segmentIndex, highlightMappedStyledSegments)}
					>{seg.text}</span
				>
			{/if}
		{/each}
	{:else}
		{#each dictionarySegments as seg, segmentIndex (segmentIndex)}
			{#if seg.highlight}
				<LandingHeroHighlightedText>
					{seg.text}
				</LandingHeroHighlightedText>
			{:else}
				<span class={heroTheme.titleSegmentClass(segmentIndex, dictionarySegments)}>{seg.text}</span>
			{/if}
		{/each}
	{/if}
</svelte:element>
