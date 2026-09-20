<script lang="ts">
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import HeroVideoModal from '$lib/ui/modals/HeroVideoModal.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/landing-page/PublicLandingSectionHeading.svelte';

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
				<PublicLandingSectionHeading
					{headingId}
					title={landingTitle}
					{heroTheme}
					commaSeparated={true}
					gradientMode="part"
				/>
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
