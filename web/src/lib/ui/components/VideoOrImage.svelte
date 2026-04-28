<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	let {
		src,
		autoplay,
		isContain = false,
		imageClass = '',
		videoClass = ''
	}: {
		src: string;
		autoplay: boolean;
		isContain?: boolean;
		imageClass?: string;
		videoClass?: string;
	} = $props();

	const isVideo = $derived(typeof src === 'string' && src.toLowerCase().includes('mp4'));
</script>

{#if isVideo}
	<video
		{src}
		autoplay={autoplay}
		muted
		loop
		playsinline
		class={cn('h-full w-full', videoClass)}
	></video>
{:else}
	<img
		{src}
		alt=""
		class={cn(isContain ? 'object-contain' : 'object-cover', 'h-full w-full', imageClass)}
	/>
{/if}

