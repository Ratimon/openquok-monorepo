<script lang="ts">
	import { isVideoPreviewSource } from '$lib/medias/utils/mediaDisplay';
	import { cn } from '$lib/ui/helpers/common';

	type MediaFit = 'cover' | 'contain' | 'none';

	const VIDEO_URL_RE = /\.(mp4|webm|mov|m4v|mpeg)(\?|#|$)/i;

	function siblingVideoSrc(url: string, fromExt: string, toExt: string): string {
		const match = url.match(new RegExp(`\\.${fromExt}(\\?|#|$)`, 'i'));
		if (!match) return url;
		const suffix = match[1] ?? '';
		return url.replace(new RegExp(`\\.${fromExt}(\\?|#|$)`, 'i'), `.${toExt}${suffix}`);
	}

	let {
		src,
		storagePath,
		autoplay,
		isContain = false,
		fit,
		imageClass = '',
		videoClass = '',
		webmSrc: webmSrcProp,
		alt = '',
		loading,
		decoding
	}: {
		src: string;
		/** Composer storage path (or local filename) when `src` is an extension-less `blob:` URL. */
		storagePath?: string;
		autoplay: boolean;
		isContain?: boolean;
		fit?: MediaFit;
		imageClass?: string;
		videoClass?: string;
		webmSrc?: string;
		alt?: string;
		loading?: 'lazy' | 'eager';
		decoding?: 'async' | 'sync' | 'auto';
	} = $props();

	const isVideo = $derived(isVideoPreviewSource(src, storagePath));
	const extensionlessVideo = $derived(isVideo && !VIDEO_URL_RE.test(src));

	const mp4Src = $derived(
		!isVideo
			? ''
			: /\.mp4(\?|#|$)/i.test(src)
				? src
				: siblingVideoSrc(src, 'webm', 'mp4')
	);

	const webmSrc = $derived(
		!isVideo
			? ''
			: (webmSrcProp ??
				(/\.webm(\?|#|$)/i.test(src) ? src : siblingVideoSrc(src, 'mp4', 'webm')))
	);

	const resolvedFit = $derived<MediaFit>(fit ?? (isContain ? 'contain' : 'cover'));

	const imgClass = $derived(
		resolvedFit === 'none'
			? cn(imageClass)
			: resolvedFit === 'contain'
				? cn('max-h-full max-w-full object-contain', imageClass)
				: cn('h-full w-full object-cover', imageClass)
	);

	const videoClassResolved = $derived(
		resolvedFit === 'none'
			? cn(videoClass)
			: resolvedFit === 'contain'
				? cn('max-h-full max-w-full object-contain', videoClass)
				: cn('h-full w-full object-cover', videoClass)
	);
</script>

{#key src}
	{#if isVideo}
		<video
			autoplay={autoplay}
			muted
			loop
			playsinline
			class={videoClassResolved}
			aria-label={alt || undefined}
		>
			{#if extensionlessVideo}
				<source {src} />
			{:else}
				{#if webmSrc}
					<source src={webmSrc} type="video/webm" />
				{/if}
				{#if mp4Src}
					<source src={mp4Src} type="video/mp4" />
				{/if}
			{/if}
		</video>
	{:else}
		<img {src} {alt} class={imgClass} {loading} {decoding} />
	{/if}
{/key}
