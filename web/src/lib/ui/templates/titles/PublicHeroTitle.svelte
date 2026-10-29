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
	import { buildLandingHeroDictionaryTitleLines } from '$lib/ui/templates/titles/buildLandingHeroDictionaryTitleLines';

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

	const highlightMappedStyledSegments = $derived(
		(styledSegments ?? []).map((seg) => ({
			text: seg.text,
			highlight: seg.style === 'sticker'
		}))
	);

	const useStyledSegments = $derived((styledSegments?.length ?? 0) > 0);

	const dictionaryTitleRender = $derived.by(() => {
		if (useStyledSegments) {
			return { lines: [] as string[], linePieces: [] as ReturnType<
				typeof buildLandingHeroDictionaryTitleLines
			>['linePieces'] };
		}
		return buildLandingHeroDictionaryTitleLines(title, heroTheme);
	});
</script>

<svelte:element
	this={headingLevel}
	id={headingId}
	class={cn(
		'text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl',
		dictionaryTitleRender.lines.length === 1 ? 'text-balance' : '',
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
		{#each dictionaryTitleRender.linePieces as pieces, lineIndex (lineIndex)}
			{#if lineIndex > 0}<br aria-hidden="true" />{/if}
			{#each pieces as piece, pieceIndex (pieceIndex)}
				{#if piece.kind === 'highlight'}
					<LandingHeroHighlightedText>
						{piece.text}
					</LandingHeroHighlightedText>
				{:else}
					<span class={piece.class}>{piece.text}</span>
				{/if}
			{/each}
		{/each}
	{/if}
</svelte:element>
