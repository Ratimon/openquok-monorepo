<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { StockPhotoEntry } from '$lib/ui/canvas-editor/side-panel/data/stockPhotos';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		photos: readonly StockPhotoEntry[];
		/** Current search string (for empty state copy). */
		searchQuery?: string;
	};

	let { disabled = false, canvasApi, photos, searchQuery = '' }: Props = $props();
</script>

{#if photos.length === 0}
	<p class="text-base-content/60 px-1 py-6 text-center text-sm">
		{#if searchQuery.trim()}
			No photos match “{searchQuery.trim()}”. Try another word (e.g. nature, city, ocean).
		{:else}
			No photos to show.
		{/if}
	</p>
{:else}
	<div class="grid min-w-0 grid-cols-2 gap-2">
		{#each photos as p (p.id)}
			<button
				type="button"
				class="border-base-300 hover:border-primary/50 group relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-lg border transition-colors disabled:opacity-40"
				disabled={disabled || !canvasApi}
				onclick={() => canvasApi?.addImageFromUrl(p.fullUrl)}
			>
				<img
					src={p.thumbUrl}
					alt=""
					class="pointer-events-none h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
					loading="lazy"
					draggable="false"
				/>
			</button>
		{/each}
	</div>
{/if}
