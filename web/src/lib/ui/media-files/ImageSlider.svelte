<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import VideoOrImage from './VideoOrImage.svelte';

	type Props = {
		class?: string;
		urls: string[];
		alt?: string;
		/** Instagram-style `1/N` badge in the top-right corner. */
		showSlideCounter?: boolean;
	};

	let { class: className = '', urls, alt = '', showSlideCounter = false }: Props = $props();

	let show = $state(0);

	const canGoPrevious = $derived(show > 0);
	const canGoNext = $derived(show < urls.length - 1);
	const currentUrl = $derived(urls[show] ?? '');

	function goToPrevious() {
		if (!canGoPrevious) return;
		show = show - 1;
	}

	function goToNext() {
		if (!canGoNext) return;
		show = show + 1;
	}

	$effect(() => {
		urls.length;
		show = 0;
	});
</script>

<div class={`relative overflow-hidden ${className}`}>
	{#if currentUrl}
		<div class="absolute inset-0">
			<VideoOrImage src={currentUrl} {alt} autoplay={true} fit="cover" />
		</div>
	{/if}

	{#if showSlideCounter && urls.length > 1}
		<div
			class="pointer-events-none absolute top-3 right-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-white"
			aria-hidden="true"
		>
			{show + 1}/{urls.length}
		</div>
	{/if}

	{#if canGoPrevious}
		<button
			type="button"
			onclick={goToPrevious}
			class="absolute top-1/2 left-[10px] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
			aria-label="Previous slide"
		>
			<AbstractIcon name={icons.ChevronLeft.name} class="size-4" width="16" height="16" />
		</button>
	{/if}

	{#if canGoNext}
		<button
			type="button"
			onclick={goToNext}
			class="absolute top-1/2 right-[10px] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
			aria-label="Next slide"
		>
			<AbstractIcon name={icons.ChevronRight.name} class="size-4" width="16" height="16" />
		</button>
	{/if}

	{#if urls.length > 1}
		<div class="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-2">
			{#each urls as _, index (index)}
				<button
					type="button"
					onclick={() => (show = index)}
					class="h-2 w-2 rounded-full transition-colors {index === show
						? 'bg-white'
						: 'border border-white bg-transparent'}"
					aria-label={`Go to slide ${index + 1}`}
				></button>
			{/each}
		</div>
	{/if}
</div>
