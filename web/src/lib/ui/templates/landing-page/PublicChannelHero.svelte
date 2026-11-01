<script lang="ts">
	import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AuroraBackground from '$lib/ui/background/AuroraBackground.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import PublicChannelsLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicChannelsLandingBreadcrumb.svelte';
	import PublicHeroTitle from '$lib/ui/templates/titles/PublicHeroTitle.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		titleSegmentClass: (segmentIndex: number, segments: LandingHeroTitleSegment[]) => string;
		titleSegmentClassWithOffset: (
			segmentIndex: number,
			segments: LandingHeroTitleSegment[],
			nonHighlightOffset: number
		) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		dualCtaRowClass: string;
		docsCtaButtonClass: string;
		ctaButtonClass: string;
	};

	type Props = {
		channelVm: PublicChannelLandingPageViewModel;
		heroTheme: LandingHeroTheme;
		ctaText: string;
		ctaHref: string;
		docsCtaText?: string;
		docsCtaHref?: string;
	};

	let { channelVm, heroTheme, ctaText, ctaHref, docsCtaText, docsCtaHref }: Props = $props();

	const showDocsCta = $derived(Boolean(docsCtaText?.trim() && docsCtaHref?.trim()));

	const headingId = 'public-channel-hero-heading';
</script>

<AuroraBackground class="relative isolate overflow-x-clip">
	<div class="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		<div class="mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center text-center">
			<div
				class="mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-base-100/10 shadow-lg backdrop-blur-sm"
				aria-hidden="true"
			>
				<AbstractIcon name={channelVm.icon} width="36" height="36" class="size-9" focusable="false" />
			</div>

			<div class="mb-6 flex w-full min-w-0 justify-center">
				<PublicChannelsLandingBreadcrumb
					platformLabel={channelVm.platformLabel}
					channelKind={channelVm.channelKind ?? 'social'}
				/>
			</div>

			<PublicHeroTitle
				title={channelVm.heroTitle}
				{headingId}
				{heroTheme}
				class="mt-4 text-3xl sm:text-4xl lg:text-5xl"
			/>

			<p
				class="mt-6 w-full max-w-full break-words text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg"
			>
				{channelVm.heroDescription}
			</p>

			<div class="{heroTheme.dualCtaRowClass} lg:justify-center">
				{#if showDocsCta}
					<ButtonGlitchBrightness
						class="{heroTheme.docsCtaButtonClass} rounded-full border-white/40 bg-transparent text-white shadow-none hover:bg-white/10"
						variant="ghost"
						size="lg"
						href={docsCtaHref}
						preload="off"
					>
						{docsCtaText}
					</ButtonGlitchBrightness>
				{/if}
				<ButtonGlitchBrightness
					class="{heroTheme.ctaButtonClass} rounded-full"
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
