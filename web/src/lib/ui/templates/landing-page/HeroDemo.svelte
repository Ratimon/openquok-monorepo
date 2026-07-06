<script lang="ts">
	import HeroVideoModal from '$lib/ui/modals/HeroVideoModal.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
		ctaButtonClass: string;
		imageClass: string;
		titlePartClass: (index: number, total: number) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		landingHeroTitlePartHasHighlight: (segments: LandingHeroTitleSegment[]) => boolean;
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		landingDescription: string;

		youtubeVideoId: string;
		thumbnailAlt: string;
		headingId: string;
	};

	let {
		heroTheme,
		landingSubtitle,
		landingTitle,
		landingDescription,
		youtubeVideoId,
		thumbnailAlt,
		headingId
	}: Props = $props();

	const videoSrc = $derived(
		`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`
	);
	const thumbnailSrc = $derived(
		`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`
	);
	const watchUrl = $derived(`https://www.youtube.com/watch?v=${youtubeVideoId}`);

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<section
	id="landing-demo"
	class="container mx-auto px-4 pb-16 sm:pb-20"
	aria-labelledby={headingId}
>
	<div class="mx-auto max-w-5xl space-y-8 sm:space-y-10">
		<div class="space-y-6 text-center">
			{#if landingSubtitle}
				<p class={heroTheme.subtitleClass}>
					{landingSubtitle}
				</p>
			{/if}

			{#if landingTitle}
				<h2
					id={headingId}
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
										<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
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
		</div>
		<HeroVideoModal
			animationStyle="from-center"
			{videoSrc}
			{thumbnailSrc}
			{thumbnailAlt}
		/>
		<p class="text-center text-sm text-base-content/60">
			<ExternalLink href={watchUrl}>Watch on YouTube</ExternalLink>
		</p>
	</div>
</section>
