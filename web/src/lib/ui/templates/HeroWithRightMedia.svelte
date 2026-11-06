<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import type { PublicHeroTitleHeadingLevel } from '$lib/ui/templates/titles/publicHeroTitle.types';

	import Background from '$lib/ui/background/Background.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import { PUBLIC_LANDING_COMPACT_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
	import PublicLandingSectionHeading from '$lib/ui/templates/titles/PublicLandingSectionHeading.svelte';
	import { landingTitleHasMultipleParts } from '$lib/ui/templates/titles/splitPublicLandingTitleParts';
	import { externalLinkAnchorAttrs } from '$lib/utils/externalLinkRel';

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;
		/** `main` = home-page hero title scale. */
		landingTitleScale?: 'section' | 'main';
		/** When false, use per-word gradient segments (main marketing heroes). Default: split on commas when present. */
		landingTitleCommaSeparated?: boolean;
		landingTitleClass?: string;
		landingTitleHeadingLevel?: PublicHeroTitleHeadingLevel;

		imageSrc?: string;
		imageAlt?: string;
		rightMedia?: Snippet;
		/** Overrides default media column width when `rightMedia` is set (`max-w-2xl`). */
		mediaContainerClass?: string;
		/** Overrides default flex alignment on the media column. */
		mediaColumnClass?: string;

		ctaText?: string;
		ctaHref?: string;
		primaryCtaText?: string;
		primaryCtaHref?: string;
		secondaryCtaText?: string;
		secondaryCtaHref?: string;
		tertiaryCtaText?: string;
		tertiaryCtaHref?: string;
		showCta?: boolean;

		bgColorClass?: string;
		children?: Snippet;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		landingTitleScale = 'section',
		landingTitleCommaSeparated,
		landingTitleClass,
		landingTitleHeadingLevel,

		imageSrc,
		imageAlt = '',
		rightMedia,
		mediaContainerClass,
		mediaColumnClass,

		ctaText = PUBLIC_LANDING_COMPACT_TRIAL_CTA,
		ctaHref = '/pricing',
		primaryCtaText,
		primaryCtaHref,
		secondaryCtaText,
		secondaryCtaHref,
		tertiaryCtaText,
		tertiaryCtaHref,
		showCta = true,

		bgColorClass = 'bg-base-100',
		children
	}: Props = $props();

	const commaSeparatedTitle = $derived(landingTitleHasMultipleParts(landingTitle));

	const resolvedMediaContainerClass = $derived(
		mediaContainerClass ?? (rightMedia ? 'max-w-2xl' : 'max-w-lg')
	);

	const showTertiaryCta = $derived(
		Boolean(tertiaryCtaText?.trim() && tertiaryCtaHref?.trim())
	);
	const tertiaryExternalAnchor = $derived(
		tertiaryCtaHref && /^https?:\/\//i.test(tertiaryCtaHref)
			? externalLinkAnchorAttrs(tertiaryCtaHref)
			: null
	);
	const resolvedMediaColumnClass = $derived(
		mediaColumnClass ?? (rightMedia ? 'justify-center lg:justify-end' : 'justify-center lg:justify-end')
	);
	const stretchGrid = $derived(rightMedia && mediaContainerClass === undefined);
	const placeCtaBelowTwoColumnGrid = $derived(Boolean(rightMedia && showCta));
	const dualCtaRowPlacementClass = $derived(
		placeCtaBelowTwoColumnGrid
			? `${heroTheme.dualCtaRowClass} lg:col-span-2`
			: heroTheme.dualCtaRowClass
	);
</script>

{#snippet heroCtaButtons()}
	{#if secondaryCtaText && secondaryCtaHref}
		<ButtonGlitchBrightness
			class={heroTheme.compactCtaButtonClass}
			variant="primary"
			size="lg"
			href={primaryCtaHref ?? ctaHref}
			preload="off"
		>
			{primaryCtaText ?? ctaText}
		</ButtonGlitchBrightness>
		<ButtonGlitchBrightness
			class={heroTheme.compactDocsCtaButtonClass}
			variant="ghost"
			size="lg"
			href={secondaryCtaHref}
			preload="off"
		>
			{secondaryCtaText}
		</ButtonGlitchBrightness>
		{#if showTertiaryCta}
			<ButtonGlitchBrightness
				class={heroTheme.compactDocsCtaButtonClass}
				variant="ghost"
				size="lg"
				href={tertiaryCtaHref}
				target={tertiaryExternalAnchor?.target}
				rel={tertiaryExternalAnchor?.rel}
				preload="off"
			>
				{tertiaryCtaText}
			</ButtonGlitchBrightness>
		{/if}
	{:else}
		<ButtonGlitchBrightness
			class={heroTheme.ctaButtonClass}
			variant="primary"
			size="lg"
			href={ctaHref}
			preload="off"
		>
			{ctaText}
		</ButtonGlitchBrightness>
	{/if}
{/snippet}

<Background color={bgColorClass}>
	<div class="relative isolate z-10 w-full overflow-hidden">
		<div class="relative z-10 w-full px-6 py-16 sm:py-20">
			<div class="mx-auto max-w-7xl">
				<div
					class="grid gap-10 lg:grid-cols-2 lg:gap-x-16 {placeCtaBelowTwoColumnGrid
						? 'items-start lg:gap-y-8'
						: stretchGrid
							? 'items-stretch'
							: 'items-center'}"
				>
					<div
						class="space-y-6 text-center lg:text-left {rightMedia && !placeCtaBelowTwoColumnGrid
							? 'flex h-full flex-col justify-center'
							: ''}"
					>
						{#if landingSubtitle}
							<p class={heroTheme.subtitleClass}>
								{landingSubtitle}
							</p>
						{/if}

						{#if landingTitle}
							<PublicLandingSectionHeading
								title={landingTitle}
								{heroTheme}
								titleScale={landingTitleScale}
								class={landingTitleClass ?? ''}
								headingLevel={landingTitleHeadingLevel ?? (landingTitleScale === 'main' ? 'h1' : 'h2')}
								commaSeparated={commaSeparatedTitle}
								gradientMode={commaSeparatedTitle ? 'part' : 'segment'}
							/>
						{/if}

						{#if landingDescription}
							<p class={heroTheme.descriptionClass}>
								{landingDescription}
							</p>
						{/if}

						{#if showCta && !placeCtaBelowTwoColumnGrid}
							<div
								class={secondaryCtaText && secondaryCtaHref ? heroTheme.dualCtaRowClass : 'pt-2'}
							>
								{@render heroCtaButtons()}
							</div>
						{/if}

						{#if children}
							<div class="pt-2">
								{@render children()}
							</div>
						{/if}
					</div>

					<div
						class="relative flex w-full {rightMedia
							? 'h-full'
							: ''} {resolvedMediaColumnClass}"
					>
						<div
							class="relative w-full {resolvedMediaContainerClass} {rightMedia &&
							mediaContainerClass === undefined
								? 'flex h-full items-stretch'
								: ''}"
						>
							{#if rightMedia}
								{@render rightMedia()}
							{:else if imageSrc}
								<VideoOrImage
									src={imageSrc}
									autoplay={true}
									fit="none"
									imageClass={heroTheme.imageClass}
									videoClass={heroTheme.imageClass}
									alt={imageAlt}
									loading="lazy"
									decoding="async"
								/>
							{/if}
						</div>
					</div>

					{#if showCta && placeCtaBelowTwoColumnGrid}
						<div class={dualCtaRowPlacementClass}>
							{@render heroCtaButtons()}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Background>
