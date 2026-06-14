<script lang="ts">
	import type { PublicChannelLandingPage } from '$lib/content/constants/publicChannelConfig';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		titleHighlightPillClass: string;
		titleSegmentClass: (segmentIndex: number, segments: LandingHeroTitleSegment[]) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
	};

	type Props = {
		channel: PublicChannelLandingPage;
		heroTheme: LandingHeroTheme;
		ctaText: string;
		ctaHref: string;
	};

	let { channel, heroTheme, ctaText, ctaHref }: Props = $props();

	const headingId = 'public-channel-hero-heading';

	const titleSegments = $derived(heroTheme.parseLandingHeroTitlePartSegments(channel.heroTitle));
</script>

<AuroraBackground class="relative isolate overflow-hidden">
	<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="mx-auto flex max-w-3xl flex-col items-center text-center">
			<div
				class="mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm"
				aria-hidden="true"
			>
				<AbstractIcon name={channel.icon} width="36" height="36" class="size-9" focusable="false" />
			</div>

			<p class="text-xs font-bold tracking-[0.2em] text-primary uppercase sm:text-sm">
				{channel.platformLabel}
			</p>

			<h1
				id={headingId}
				class="mt-4 text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl"
			>
				{#each titleSegments as seg, segmentIndex (seg.text + String(seg.highlight))}
					{#if seg.highlight}
						<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
					{:else}
						<span class={heroTheme.titleSegmentClass(segmentIndex, titleSegments)}>{seg.text}</span>
					{/if}
				{/each}
			</h1>

			<p class="mt-6 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg">
				{channel.heroDescription}
			</p>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
				<ButtonGlitchBrightness
					class="my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:w-auto sm:text-base"
					variant="primary"
					size="lg"
					href={ctaHref}
					preload="off"
				>
					{ctaText}
				</ButtonGlitchBrightness>
			</div>
		</div>
	</div>
</AuroraBackground>
