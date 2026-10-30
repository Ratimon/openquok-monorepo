<script lang="ts">
	import type { Snippet } from 'svelte';

	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { buildLandingHeroDictionaryTitleLines } from '$lib/ui/templates/titles/buildLandingHeroDictionaryTitleLines';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleSegmentClass?: (segmentIndex: number, segments: LandingHeroTitleSegment[]) => string;
		titleSegmentClassWithOffset: (
			segmentIndex: number,
			segments: LandingHeroTitleSegment[],
			nonHighlightOffset: number
		) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		title: string;
		description?: string;
		subtitle?: string;
		breadcrumb?: Snippet;
		headingLevel?: 'h1' | 'h2';
		titleClass?: string;
	};

	let {
		heroTheme,
		headingId,
		title,
		description = '',
		subtitle = '',
		breadcrumb,
		headingLevel = 'h2',
		titleClass = 'text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl'
	}: Props = $props();

	const titleRender = $derived(buildLandingHeroDictionaryTitleLines(title, heroTheme));
	const useGradientSegments = $derived(Boolean(heroTheme.titleSegmentClass));
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	{#if breadcrumb}
		<div class="flex justify-center">
			{@render breadcrumb()}
		</div>
	{:else if subtitle}
		<p class={heroTheme.subtitleClass}>
			{subtitle}
		</p>
	{/if}
	<svelte:element
		this={headingLevel}
		id={headingId}
		class={cn(titleClass, titleRender.lines.length === 1 ? 'text-balance' : '')}
	>
		{#if useGradientSegments}
			{#each titleRender.linePieces as pieces, lineIndex (lineIndex)}
				{#if lineIndex > 0}<br aria-hidden="true" />{/if}
				{#each pieces as piece, pieceIndex (pieceIndex)}
					{#if piece.kind === 'highlight'}
						<LandingHeroHighlightedText>{piece.text}</LandingHeroHighlightedText>
					{:else}
						<span class={piece.class}>{piece.text}</span>
					{/if}
				{/each}
			{/each}
		{:else}
			{title}
		{/if}
	</svelte:element>
	{#if description}
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
	{/if}
</div>
