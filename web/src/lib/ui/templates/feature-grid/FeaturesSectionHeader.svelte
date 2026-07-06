<script lang="ts">
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleSegmentClass?: (segmentIndex: number, segments: LandingHeroTitleSegment[]) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		title: string;
		description?: string;
		subtitle?: string;
		headingLevel?: 'h1' | 'h2';
		titleClass?: string;
	};

	let {
		heroTheme,
		headingId,
		title,
		description = '',
		subtitle = '',
		headingLevel = 'h2',
		titleClass = 'text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl'
	}: Props = $props();

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(title));
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	{#if subtitle}
		<p class={heroTheme.subtitleClass}>
			{subtitle}
		</p>
	{/if}
	<svelte:element
		this={headingLevel}
		id={headingId}
		class={titleClass}
	>
		{#each titleSegments as seg, segmentIndex (segmentIndex)}
			{#if seg.highlight}
				<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
			{:else if heroTheme.titleSegmentClass}
				<span class={heroTheme.titleSegmentClass(segmentIndex, titleSegments)}>{seg.text}</span>
			{:else}
				{seg.text}
			{/if}
		{/each}
	</svelte:element>
	{#if description}
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
	{/if}
</div>
