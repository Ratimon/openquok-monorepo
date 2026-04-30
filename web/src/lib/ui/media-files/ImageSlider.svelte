<script lang="ts">
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BlobOrHrefImg from './BlobOrHrefImg.svelte';

	type Props = {
		class?: string;
		urls: string[];
		alt?: string;
	};

	let { class: className = '', urls, alt = '' }: Props = $props();

	let show = $state(0);

	const canGoPrevious = $derived(show > 0);
	const canGoNext = $derived(show < urls.length - 1);

	function goToPrevious() {
		if (!canGoPrevious) return;
		show = show - 1;
	}

	function goToNext() {
		if (!canGoNext) return;
		show = show + 1;
	}
</script>

<div class={`relative ${className}`}>
	<BlobOrHrefImg href={urls[show]} {alt} class="h-full w-full object-cover" draggable={false} />

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
