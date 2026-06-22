<script lang="ts">
	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		headingId: string;
		title: string;
		description?: string;
		subtitle?: string;
	};

	let { heroTheme, headingId, title, description = '', subtitle = '' }: Props = $props();

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(title));
</script>

<div class="mx-auto max-w-3xl space-y-4 text-center">
	{#if subtitle}
		<p class={heroTheme.subtitleClass}>
			{subtitle}
		</p>
	{/if}
	<h2
		id={headingId}
		class="text-2xl font-black tracking-tight text-balance text-base-content sm:text-3xl lg:text-4xl"
	>
		{#each titleSegments as seg, segmentIndex (segmentIndex)}
			{#if seg.highlight}
				<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
			{:else}
				{seg.text}
			{/if}
		{/each}
	</h2>
	{#if description}
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
			{description}
		</p>
	{/if}
</div>
