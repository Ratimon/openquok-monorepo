<script lang="ts">
	import { browser } from '$app/environment';

	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import {
		ELEMENT_LINE_PRESETS,
		elementLinePresetPanelSvg
	} from '$lib/ui/canvas-editor/utils/elementLinePresets';
	import { figureToSvg, TYPES } from '$lib/ui/canvas-editor/utils/figureToSvg';
	import { svgToDataUrl } from '$lib/ui/canvas-editor/utils/svgToDataUrl';
	import { tableGridSvgString } from '$lib/ui/canvas-editor/utils/tableGridSvg';

	import { icons } from '$data/icons';
	import * as InputGroup from '$lib/ui/input-group';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { ScrollArea } from '$lib/ui/scroll-area';

	interface Props {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	}

	let { disabled = false, canvasApi }: Props = $props();

	let query = $state('');
	let searchInput = $state.raw<HTMLInputElement | null>(null);

	const TABLE_PRESETS = [
		{ rows: 2, cols: 2 },
		{ rows: 2, cols: 3 },
		{ rows: 3, cols: 3 },
		{ rows: 3, cols: 4 },
		{ rows: 4, cols: 4 },
		{ rows: 4, cols: 5 },
		{ rows: 5, cols: 5 },
		{ rows: 6, cols: 6 }
	] as const;

	/** Panel-only fill/stroke: fixed slate so icons stay visible on `bg-primary/20` in every theme (currentColor matched the tint on forest/dark). */
	const SHAPE_PREVIEW_FILL = '#cbd5e1';
	const SHAPE_PREVIEW_STROKE = '#475569';

	let shapeItems = $state<{ subType: string; previewSrc: string }[]>([]);

	$effect(() => {
		if (!browser) return;
		const width = 300;
		const height = 300;
		const strokeWidth = 0;
		shapeItems = Object.keys(TYPES).map((subType) => ({
			subType,
			previewSrc: svgToDataUrl(
				figureToSvg({
					subType,
					width,
					height,
					fill: SHAPE_PREVIEW_FILL,
					stroke: SHAPE_PREVIEW_STROKE,
					strokeWidth
				})
			)
		}));
	});

	const filteredShapes = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return shapeItems;
		return shapeItems.filter((s) => s.subType.toLowerCase().includes(q));
	});

	function focusSearch() {
		searchInput?.focus();
	}

	function addTable(rows: number, cols: number) {
		const url = svgToDataUrl(tableGridSvgString(rows, cols, 28));
		canvasApi?.addImageFromUrl(url);
	}

	function addLinePreset(id: string) {
		const preset = ELEMENT_LINE_PRESETS.find((p) => p.id === id);
		if (!preset) return;
		canvasApi?.addImageFromUrl(svgToDataUrl(preset.svg));
	}

	function addShape(subType: string) {
		const fill = '#bfbfbf';
		const stroke = '#0c0c0c';
		const strokeWidth = 0;
		const width = 300;
		const height = 300;
		const url = svgToDataUrl(
			figureToSvg({ subType, width, height, fill, stroke, strokeWidth })
		);
		canvasApi?.addImageFromUrl(url);
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
	<label class="sr-only" for="design-elements-search">
		Search elements</label>
	<InputGroup.Root class="shrink-0 shadow-xs">
		<InputGroup.Addon align="inline-start" class="pl-2.5">
			<button
				type="button"
				tabindex="-1"
				class="text-base-content/50 hover:text-base-content/80 flex touch-manipulation items-center justify-center rounded p-0.5 transition-colors"
				aria-label="Search elements"
				onclick={focusSearch}
			>
				<AbstractIcon name={icons.Search.name} class="pointer-events-none size-4" width="16" height="16" />
			</button>
		</InputGroup.Addon>
		<InputGroup.Input
			bind:ref={searchInput}
			id="design-elements-search"
			type="search"
			bind:value={query}
			placeholder="Search..."
			autocomplete="off"
		/>
	</InputGroup.Root>

	<ScrollArea class="min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-0.5">
		<div class="flex flex-col gap-5 pb-2">
			<section aria-labelledby="elements-tables-heading">
				<h3
					id="elements-tables-heading"
					class="text-base-content/90 mb-2 text-xs font-semibold tracking-wide uppercase"
				>
					Tables
				</h3>
				<div class="grid grid-cols-4 gap-2">
					{#each TABLE_PRESETS as t (`${t.rows}x${t.cols}`)}
						<button
							type="button"
							title="{t.rows}×{t.cols} table"
							class="border-primary/35 hover:border-primary/60 bg-primary/20 text-base-content flex aspect-square min-h-0 items-center justify-center rounded-lg border p-1.5 shadow-sm transition-colors disabled:opacity-40"
							disabled={disabled || !canvasApi}
							onclick={() => addTable(t.rows, t.cols)}
						>
							<span class="flex max-h-full max-w-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:object-contain">
								{@html tableGridSvgString(t.rows, t.cols, 8, 'currentColor', 1.75)}
							</span>
						</button>
					{/each}
				</div>
			</section>

			<section aria-labelledby="elements-lines-heading">
				<h3
					id="elements-lines-heading"
					class="text-base-content/90 mb-2 text-xs font-semibold tracking-wide uppercase"
				>
					Lines
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each ELEMENT_LINE_PRESETS as line (line.id)}
						<button
							type="button"
							title={line.label}
							class="border-primary/35 hover:border-primary/60 bg-primary/20 text-base-content flex h-12 min-w-[3.25rem] flex-1 basis-[22%] items-center justify-center rounded-lg border px-1.5 shadow-sm transition-colors disabled:opacity-40 sm:basis-auto"
							disabled={disabled || !canvasApi}
							onclick={() => addLinePreset(line.id)}
						>
							<span
								class="flex max-h-9 w-full max-w-[5.5rem] items-center justify-center [&>svg]:max-h-9 [&>svg]:w-full [&>svg]:object-contain"
							>
								{@html elementLinePresetPanelSvg(line.svg)}
							</span>
						</button>
					{/each}
				</div>
			</section>

			<section aria-labelledby="elements-shapes-heading">
				<h3
					id="elements-shapes-heading"
					class="text-base-content/90 mb-2 text-xs font-semibold tracking-wide uppercase"
				>
					Shapes
				</h3>
				{#if filteredShapes.length === 0}
					<p class="text-base-content/55 text-center text-sm">
						{#if query.trim()}
							No shapes match “{query.trim()}”. Try another search.
						{:else}
							Loading shapes…
						{/if}
					</p>
				{:else}
					<div class="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-4">
						{#each filteredShapes as s (s.subType)}
							<button
								type="button"
								title={s.subType}
								class="border-primary/35 hover:border-primary/60 bg-primary/20 group relative aspect-square w-full min-w-0 rounded-lg border p-1.5 shadow-sm transition-colors disabled:opacity-40"
								disabled={disabled || !canvasApi}
								onclick={() => addShape(s.subType)}
							>
								<img
									src={s.previewSrc}
									alt=""
									class="pointer-events-none mx-auto block h-auto max-h-full w-full max-w-full object-contain p-1 transition-transform group-hover:scale-[1.02]"
									draggable="false"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</ScrollArea>
</div>
