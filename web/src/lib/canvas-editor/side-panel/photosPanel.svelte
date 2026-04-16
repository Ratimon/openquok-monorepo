<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/canvas-editor/konvaCanvasApi';
	import { STOCK_PHOTOS } from '$lib/canvas-editor/side-panel/stockPhotos';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	};

	let { disabled = false, canvasApi }: Props = $props();

	let query = $state('');

	const filteredPhotos = $derived(
		!query.trim()
			? STOCK_PHOTOS
			: STOCK_PHOTOS.filter((p) => p.id.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<label class="sr-only" for="design-photo-search">Search photos</label>
	<div class="relative">
		<AbstractIcon
			name={icons.Search.name}
			class="text-base-content/40 pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
			width="16"
			height="16"
		/>
		<input
			id="design-photo-search"
			type="search"
			bind:value={query}
			placeholder="Search…"
			class="border-base-300 bg-base-200/80 focus:border-primary focus:ring-primary/25 w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
		/>
	</div>
	<p class="text-base-content/55 shrink-0 text-xs">Preview tiles use a public image CDN (no account).</p>
	<div class="custom-scrollbar grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1">
		{#each filteredPhotos as p (p.id)}
			<button
				type="button"
				class="border-base-300 hover:border-primary/50 group relative aspect-[4/5] w-full overflow-hidden rounded-md border transition-colors disabled:opacity-40"
				disabled={disabled || !canvasApi}
				onclick={() => canvasApi?.addImageFromUrl(p.fullUrl)}
			>
				<img
					src={p.thumbUrl}
					alt=""
					class="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
					loading="lazy"
				/>
			</button>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
	}
</style>
