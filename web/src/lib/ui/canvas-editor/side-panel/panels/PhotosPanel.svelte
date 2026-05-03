<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { StockPhotoViewModel } from '$lib/canvas';

	import PhotosImagesGrid from './PhotosImagesGrid.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import { icons } from '$data/icons';
	import * as InputGroup from '$lib/ui/input-group';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { ScrollArea } from '$lib/ui/scroll-area';

	interface Props {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		photosPm: readonly StockPhotoViewModel[];
	}

	let { disabled = false, canvasApi, photosPm }: Props = $props();

	let query = $state('');
	/** Must be `null` (not `undefined`) to match `Input`’s `ref = $bindable(null)` for two-way bind. */
	let searchInput = $state.raw<HTMLInputElement | null>(null);

	const filteredPhotos = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return photosPm;
		return photosPm.filter((p) => p.searchText.includes(q));
	});

	function onSearchInput(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		query = el.value;
	}

	function focusSearch() {
		searchInput?.focus();
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<label class="sr-only" for="design-photo-search">
		Search photos</label>
	<InputGroup.Root class="shrink-0 shadow-xs">
		<InputGroup.Addon align="inline-start" class="pl-2.5">
			<button
				type="button"
				tabindex="-1"
				class="text-base-content/50 hover:text-base-content/80 flex touch-manipulation items-center justify-center rounded p-0.5 transition-colors"
				aria-label="Search photos"
				onclick={focusSearch}
			>
				<AbstractIcon name={icons.Search.name} class="pointer-events-none size-4" width="16" height="16" />
			</button>
		</InputGroup.Addon>
		<InputGroup.Input
			bind:ref={searchInput}
			id="design-photo-search"
			type="search"
			bind:value={query}
			placeholder="Search..."
			autocomplete="off"
			oninput={onSearchInput}
		/>
	</InputGroup.Root>

	<p class="text-base-content/70 shrink-0 text-center text-xs">
		Photos from
		<ExternalLink
			href="https://picsum.photos/"
			class="text-primary font-medium hover:underline"
			ariaLabel="Lorem Picsum (opens in a new tab)"
		>
			Lorem Picsum
		</ExternalLink>
	</p>

	<ScrollArea class="min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-0.5">
		<PhotosImagesGrid {disabled} {canvasApi} photos={filteredPhotos} searchQuery={query} />
	</ScrollArea>
</div>
