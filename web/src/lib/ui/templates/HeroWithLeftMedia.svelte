<script lang="ts">
	import type { Snippet } from 'svelte';

	import Background from '$lib/ui/background/Background.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
		ctaButtonClass: string;
		imageClass: string;
		titlePartClass: (index: number, total: number) => string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		landingHeroTitlePartHasHighlight: (segments: LandingHeroTitleSegment[]) => boolean;
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;

		imageSrc?: string;
		imageAlt?: string;
		leftMedia?: Snippet;
		/** Overrides default media column width when `leftMedia` is set (`max-w-2xl`). */
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
		leftMedia,
		mediaContainerClass,
		mediaColumnClass,

		ctaText = 'Get Started For Free',
		ctaHref = '/pricing',
		showCta = true,

		bgColorClass = 'bg-base-200',
		children
	}: Props = $props();

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);

	const resolvedMediaContainerClass = $derived(
		mediaContainerClass ?? (leftMedia ? 'max-w-2xl' : 'max-w-lg')
	);
	const resolvedMediaColumnClass = $derived(
		mediaColumnClass ?? (leftMedia ? 'justify-center lg:justify-start' : 'justify-center')
	);
	const stretchGrid = $derived(leftMedia && mediaContainerClass === undefined);
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
						class="relative order-2 flex {resolvedMediaColumnClass} lg:order-1 {leftMedia
							? 'h-full'
							: ''}"
					>
						<div
							class="relative w-full {resolvedMediaContainerClass} {leftMedia &&
							mediaContainerClass === undefined
								? 'h-full'
								: ''}"
						>
							{#if leftMedia}
								{@render leftMedia()}
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

					<div
						class="order-1 space-y-6 text-center lg:order-2 lg:text-left {leftMedia
							? 'flex h-full flex-col justify-center'
							: ''}"
					>
						{#if landingSubtitle}
							<p class={heroTheme.subtitleClass}>
								{landingSubtitle}
							</p>
						{/if}

						{#if landingTitle}
							<h2
								class="text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl"
							>
								{#each titleParts as part, index (index)}
									{@const partClass = heroTheme.titlePartClass(index, titleParts.length)}
									{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
									{@const layoutClass =
										titleParts.length >= 3 ? 'block' : index > 0 ? 'block sm:inline' : ''}
									{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
										<span class={layoutClass}>
											{#each segments as seg, segmentIndex (segmentIndex)}
												{#if seg.highlight}
													<span class={heroTheme.titleHighlightPillClass}>{seg.text}</span>
												{:else}
													<span class={partClass}>{seg.text}</span>
												{/if}
											{/each}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
										</span>
									{:else}
										<span class="{partClass} {layoutClass}">
											{part}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
										</span>
									{/if}
								{/each}
							</h2>
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
				</div>
			</div>
		</div>
	</div>
</Background>
