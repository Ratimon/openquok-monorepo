<script lang="ts">
	import VideoOrImage from '$lib/ui/media-files/VideoOrImage.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
</script>

<div class="bg-base-100" aria-hidden="true">
	<VideoOrImage
		src="/landing/analytics.mp4"
		autoplay={true}
		fit="none"
		imageClass={landingHeroTheme.imageClass}
		videoClass={landingHeroTheme.imageClass}
		alt="Analytics dashboard across social channels"
		loading="lazy"
		decoding="async"
	/>
</div>
