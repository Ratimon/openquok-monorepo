<script lang="ts">
	import {
		FEATURES_GRID_SOCIAL_ROWS,
		featuresGridPlatformsForRow
	} from '$data/landing-social-platforms';

	import SocialChannelHoverCard from '$lib/ui/templates/SocialChannelHoverCard.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingTitle?: string;
		landingDescription?: string;
	};

	let {
		heroTheme,
		landingTitle = '',
		landingDescription = '',
	}: Props = $props();

	const headingId = 'landing-features-grid-heading';

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(landingTitle));
</script>

<section
	class="relative isolate overflow-hidden bg-base-100 py-16 sm:py-20"
	aria-labelledby={headingId}
>
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<h2
				id={headingId}
				class="text-2xl font-black tracking-tight text-balance text-base-content sm:text-3xl lg:text-4xl"
			>
				{#each titleSegments as seg (seg.text + String(seg.highlight))}
					{#if seg.highlight}
						<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
					{:else}
						{seg.text}
					{/if}
				{/each}
			</h2>
			{#if landingDescription}
				<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
					{landingDescription}
				</p>
			{/if}
		</div>

		<div
			class="relative mx-auto mt-12 max-w-6xl space-y-4 sm:mt-14 sm:space-y-5"
			aria-label="Supported social channels"
		>
			<div
				class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-100 to-transparent sm:w-24"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-100 to-transparent sm:w-24"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-base-100 to-transparent sm:h-16"
				aria-hidden="true"
			></div>

			{#each FEATURES_GRID_SOCIAL_ROWS as row, rowIndex (rowIndex)}
				{@const platforms = featuresGridPlatformsForRow(row.platformIds)}
				<div
					class="flex justify-center gap-3 transition-transform duration-500 sm:gap-4 {row.offsetClass}"
				>
					{#each platforms as platform (platform.id)}
						<SocialChannelHoverCard {platform} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>
