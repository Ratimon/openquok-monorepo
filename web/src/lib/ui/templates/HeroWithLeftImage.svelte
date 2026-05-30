<script lang="ts">
	import type { Snippet } from 'svelte';

	import Background from '$lib/ui/background/Background.svelte';
	import ButtonGlitchBrightness from '$lib/ui/buttons/ButtonGlitchBrightness.svelte';

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

		imageSrc: string;
		imageAlt?: string;

		ctaText?: string;
		ctaHref?: string;

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

		ctaText = 'Get Started For Free',
		ctaHref = '/pricing',

		bgColorClass = 'bg-base-200',
		children
	}: Props = $props();

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<Background color={bgColorClass}>
	<div class="relative isolate z-10 w-full overflow-hidden">
		<div class="relative z-10 w-full px-6 py-16 sm:py-20">
			<div class="mx-auto max-w-7xl">
				<div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
					<div class="relative order-2 flex justify-center lg:order-1 lg:justify-start">
						<div class="relative w-full max-w-lg">
							<img
								src={imageSrc}
								alt={imageAlt}
								class={heroTheme.imageClass}
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>

					<div class="order-1 space-y-6 text-center lg:order-2 lg:text-left">
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
											{#each segments as seg (seg.text + String(seg.highlight))}
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
