<script lang="ts">
	import type {
		CanvasDrawBrushType,
		CanvasDrawSettings,
		CanvasEditorMode,
		KonvaCanvasApi
	} from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { icons } from '$data/icon';
	import * as ButtonGroup from '$lib/ui/button-group';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ColorPicker from '$lib/ui/color-picker/ColorPicker.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import * as Popover from '$lib/ui/popover';
	import { ScrollArea } from '$lib/ui/scroll-area';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	};

	let { disabled = false, canvasApi }: Props = $props();

	let editorMode = $state<CanvasEditorMode>('selection');
	let brushType = $state<CanvasDrawBrushType>('brush');
	let strokeWidth = $state(5);
	let strokeColor = $state('#475569');
	let brushOpacityPercent = $state(100);

	let colorPopoverOpen = $state(false);

	let lastApi: KonvaCanvasApi | null = null;

	$effect(() => {
		if (!canvasApi) {
			lastApi = null;
			return;
		}
		if (canvasApi === lastApi) return;
		lastApi = canvasApi;
		applySettings(canvasApi.getDrawSettings());
	});

	function applySettings(s: CanvasDrawSettings) {
		editorMode = s.editorMode;
		brushType = s.brushType;
		strokeWidth = s.strokeWidth;
		strokeColor = s.strokeColor;
		brushOpacityPercent = s.brushOpacityPercent;
	}

	const isDrawMode = $derived(editorMode === 'draw');
	const showBrushOpacity = $derived(brushType === 'brush');

	function setTool(mode: CanvasEditorMode, brush?: CanvasDrawBrushType) {
		if (!canvasApi) return;
		if (mode === 'selection') {
			canvasApi.setCanvasEditorMode('selection');
			applySettings(canvasApi.getDrawSettings());
			return;
		}
		canvasApi.setCanvasEditorMode('draw');
		if (brush) {
			canvasApi.setDrawBrushType(brush);
			if (brush === 'highlighter') {
				canvasApi.setDrawBrushOpacityPercent(50);
			}
		}
		applySettings(canvasApi.getDrawSettings());
	}

	function onStrokeWidthInput(v: number) {
		if (!canvasApi || Number.isNaN(v)) return;
		const n = Math.max(1, Math.min(50, Math.round(v)));
		strokeWidth = n;
		canvasApi.setDrawStrokeWidth(n);
	}

	function onOpacityInput(v: number) {
		if (!canvasApi || Number.isNaN(v)) return;
		const n = Math.max(0, Math.min(100, Math.round(v)));
		brushOpacityPercent = n;
		canvasApi.setDrawBrushOpacityPercent(n);
	}

	function segmentedBtnClass(active: boolean) {
		return cn(
			'flex min-h-10 flex-1 flex-col items-center justify-center gap-0.5 rounded-none border-0 px-1 py-1.5 text-[11px] font-medium shadow-none sm:text-xs',
			active
				? 'bg-primary/25 text-primary'
				: 'text-base-content/80 hover:bg-base-300/50'
		);
	}
</script>

<ScrollArea class="flex min-h-0 min-w-0 flex-1 basis-0" viewportClass="pr-0.5">
	<div class="flex flex-col gap-5 pb-1">
		<section class="flex flex-col gap-2" aria-labelledby="draw-tool-heading">
			<h3
				id="draw-tool-heading"
				class="text-base-content/70 text-xs font-semibold tracking-wide uppercase"
			>
				Tool
			</h3>
			<ButtonGroup.Root class="bg-base-100/50">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled || !canvasApi}
					class={segmentedBtnClass(editorMode === 'selection')}
					aria-pressed={editorMode === 'selection'}
					onclick={() => setTool('selection')}
				>
					<AbstractIcon name={icons.MousePointerClickIcon.name} class="size-4" width="16" height="16" />
					<span class="leading-tight">Selection</span>
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled || !canvasApi}
					class={segmentedBtnClass(editorMode === 'draw' && brushType === 'brush')}
					aria-pressed={editorMode === 'draw' && brushType === 'brush'}
					onclick={() => setTool('draw', 'brush')}
				>
					<AbstractIcon name={icons.Pencil.name} class="size-4" width="16" height="16" />
					<span class="leading-tight">Brush</span>
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled || !canvasApi}
					class={segmentedBtnClass(editorMode === 'draw' && brushType === 'highlighter')}
					aria-pressed={editorMode === 'draw' && brushType === 'highlighter'}
					onclick={() => setTool('draw', 'highlighter')}
				>
					<AbstractIcon name={icons.PaintRoller.name} class="size-4" width="16" height="16" />
					<span class="leading-tight">Highlighter</span>
				</Button>
			</ButtonGroup.Root>
		</section>

		<section
			class="flex flex-col gap-2 transition-opacity"
			class:opacity-50={!isDrawMode}
			class:pointer-events-none={!isDrawMode}
		>
			<div class="flex items-center justify-between gap-2">
				<span class="text-base-content/85 text-sm">Stroke Width</span>
				<label class="sr-only" for="draw-stroke-width-num">Stroke width</label>
				<input
					id="draw-stroke-width-num"
					type="number"
					min="1"
					max="50"
					bind:value={strokeWidth}
					disabled={disabled || !canvasApi || !isDrawMode}
					class="border-base-300 bg-base-200/80 w-14 shrink-0 rounded-md border px-1 py-0.5 text-center text-sm"
					onchange={() => onStrokeWidthInput(strokeWidth)}
				/>
			</div>
			<input
				type="range"
				min="1"
				max="50"
				step="1"
				bind:value={strokeWidth}
				disabled={disabled || !canvasApi || !isDrawMode}
				class="range range-primary range-xs w-full"
				aria-label="Stroke width"
				oninput={() => onStrokeWidthInput(strokeWidth)}
			/>
		</section>

		<section
			class="flex flex-col gap-2 transition-opacity"
			class:opacity-50={!isDrawMode}
			class:pointer-events-none={!isDrawMode}
		>
			<div class="flex items-center justify-between gap-2">
				<span class="text-base-content/85 self-start pt-1 text-sm">Color</span>
				<Popover.Root bind:open={colorPopoverOpen}>
					<Popover.Trigger
						type="button"
						class="border-base-300 shrink-0 rounded-md border shadow-sm disabled:opacity-40"
						style={`width:30px;height:30px;background:${strokeColor}`}
						disabled={disabled || !canvasApi || !isDrawMode}
						aria-label="Stroke color"
					></Popover.Trigger>
					<Popover.Content class="w-auto max-w-[min(100vw-2rem,320px)] p-3" align="end" sideOffset={6}>
						<ColorPicker bind:value={strokeColor} />
						<button
							type="button"
							class="btn btn-primary btn-sm mt-3 w-full"
							onclick={() => {
								canvasApi?.setDrawStrokeColor(strokeColor);
								colorPopoverOpen = false;
							}}
						>
							Apply
						</button>
					</Popover.Content>
				</Popover.Root>
			</div>
		</section>

		{#if showBrushOpacity}
			<section
				class="flex flex-col gap-2 transition-opacity"
				class:opacity-50={!isDrawMode}
				class:pointer-events-none={!isDrawMode}
			>
				<div class="flex items-center justify-between gap-2">
					<span class="text-base-content/85 text-sm">Opacity</span>
					<label class="sr-only" for="draw-opacity-num">Brush opacity percent</label>
					<input
						id="draw-opacity-num"
						type="number"
						min="0"
						max="100"
						bind:value={brushOpacityPercent}
						disabled={disabled || !canvasApi || !isDrawMode}
						class="border-base-300 bg-base-200/80 w-14 shrink-0 rounded-md border px-1 py-0.5 text-center text-sm"
						onchange={() => onOpacityInput(brushOpacityPercent)}
					/>
				</div>
				<input
					type="range"
					min="0"
					max="100"
					step="1"
					bind:value={brushOpacityPercent}
					disabled={disabled || !canvasApi || !isDrawMode}
					class="range range-primary range-xs w-full"
					aria-label="Brush opacity"
					oninput={() => onOpacityInput(brushOpacityPercent)}
				/>
			</section>
		{/if}
	</div>
</ScrollArea>
