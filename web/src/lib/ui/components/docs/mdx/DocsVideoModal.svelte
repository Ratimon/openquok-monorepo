<script lang="ts">
	import type { DocsYoutubeVideoPreset } from '$lib/docs/constants/docsYoutubeVideos';
	import { DOCS_YOUTUBE_VIDEOS } from '$lib/docs/constants/docsYoutubeVideos';

	import HeroVideoModal from '$lib/ui/modals/HeroVideoModal.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';

	type AnimationStyle =
		| 'from-bottom'
		| 'from-center'
		| 'from-top'
		| 'from-left'
		| 'from-right'
		| 'fade'
		| 'top-in-bottom-out'
		| 'left-in-right-out';

	let {
		youtubeVideoId,
		thumbnailAlt = 'OpenQuok video tutorial',
		animationStyle = 'from-center',
		/** Drives SSR `VideoObject` in `DocsSeoHead` — must match a key in `DOCS_YOUTUBE_VIDEOS`. */
		videoObjectPreset
	}: {
		youtubeVideoId: string;
		thumbnailAlt?: string;
		animationStyle?: AnimationStyle;
		videoObjectPreset?: DocsYoutubeVideoPreset;
	} = $props();

	const videoSrc = $derived(
		`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`
	);
	const thumbnailSrc = $derived(`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`);
	const watchUrl = $derived(`https://www.youtube.com/watch?v=${youtubeVideoId}`);

	const presetConfig = $derived(
		videoObjectPreset ? DOCS_YOUTUBE_VIDEOS[videoObjectPreset] : undefined
	);
</script>

<div class="not-prose my-8">
	<HeroVideoModal
		{animationStyle}
		{videoSrc}
		{thumbnailSrc}
		thumbnailAlt={presetConfig?.thumbnailAlt ?? thumbnailAlt}
	/>
	<p class="mt-3 text-center text-sm text-base-content/60">
		<ExternalLink href={watchUrl}>Watch on YouTube</ExternalLink>
	</p>
</div>
