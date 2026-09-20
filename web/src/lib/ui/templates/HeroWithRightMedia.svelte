<script lang="ts">
	import type { Snippet } from 'svelte';

	import Background from '$lib/ui/background/Background.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import PublicLandingSectionTitle from '$lib/ui/templates/landing-page/PublicLandingSectionTitle.svelte';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;

		imageSrc?: string;
		imageAlt?: string;
		rightMedia?: Snippet;
		/** Overrides default media column width when `rightMedia` is set (`max-w-2xl`). */
		mediaContainerClass?: string;
		/** Overrides default flex alignment on the media column. */
		mediaColumnClass?: string;

		ctaText?: string;
		ctaHref?: string;
		showCta?: boolean;

		bgColorClass?: string;
		children?: Snippet;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,

		imageSrc,
		imageAlt = '',
		rightMedia,
		mediaContainerClass,
		mediaColumnClass,

		ctaText = 'Get Started For Free',
		ctaHref = '/pricing',
		showCta = true,

		bgColorClass = 'bg-base-100',
		children
	}: Props = $props();

	const commaSeparatedTitle = $derived(landingTitle.includes(','));

	const resolvedMediaContainerClass = $derived(
		mediaContainerClass ?? (rightMedia ? 'max-w-2xl' : 'max-w-lg')
	);
	const resolvedMediaColumnClass = $derived(
		mediaColumnClass ?? (rightMedia ? 'justify-center lg:justify-end' : 'justify-center lg:justify-end')
	);
	const stretchGrid = $derived(rightMedia && mediaContainerClass === undefined);
</script>

<Background color={bgColorClass}>
	<div class="relative isolate z-10 w-full overflow-hidden">
		<div class="relative z-10 w-full px-6 py-16 sm:py-20">
			<div class="mx-auto max-w-7xl">
				<div
					class="grid gap-10 lg:grid-cols-2 lg:gap-16 {stretchGrid
						? 'items-stretch'
						: 'items-center'}"
				>
					<div
						class="space-y-6 text-center lg:text-left {rightMedia
							? 'flex h-full flex-col justify-center'
							: ''}"
					>
						{#if landingSubtitle}
							<p class={heroTheme.subtitleClass}>
								{landingSubtitle}
							</p>
						{/if}

						{#if landingTitle}
							<PublicLandingSectionTitle
								title={landingTitle}
								{heroTheme}
								commaSeparated={commaSeparatedTitle}
							/>
						{/if}

						{#if landingDescription}
							<p class={heroTheme.descriptionClass}>
								{landingDescription}
							</p>
						{/if}

						{#if showCta}
							<div class="pt-2">
								<ButtonGlitchBrightness
									class={heroTheme.ctaButtonClass}
									variant="primary"
									size="lg"
									href={ctaHref}
									preload="off"
								>
									{ctaText}
								</ButtonGlitchBrightness>
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
				</div>
			</div>
		</div>
	</div>
</Background>
