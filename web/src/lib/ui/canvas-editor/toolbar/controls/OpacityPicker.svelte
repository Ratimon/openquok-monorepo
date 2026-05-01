<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Popover from '$lib/ui/popover';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		selection: CanvasSelectionState;
	};

	let { disabled = false, canvasApi, selection }: Props = $props();

	let open = $state(false);
	let localOpacity = $state(100);

	$effect(() => {
		if (open && selection.hasSelection) {
			localOpacity = selection.opacity;
		}
	});

	const hasSelection = $derived(selection.hasSelection);
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		class="btn btn-ghost btn-xs btn-square"
		disabled={disabled || !canvasApi || !hasSelection}
		title="Opacity"
		aria-label="Opacity"
		aria-haspopup="dialog"
	>
		<AbstractIcon name={icons.Eye.name} class="size-4" width="16" height="16" />
	</Popover.Trigger>
	<Popover.Content class="w-64 p-3" align="start" sideOffset={6}>
		<p class="text-base-content/80 mb-3 text-center text-sm font-medium">Transparency</p>
		<div class="flex items-center gap-3">
			<input
				type="range"
				min="0"
				max="100"
				bind:value={localOpacity}
				class="range range-primary range-xs flex-1"
				oninput={() => canvasApi?.setSelectedOpacity(localOpacity)}
				onpointerup={() => canvasApi?.commitEdit()}
			/>
			<label class="sr-only" for="opacity-num">Opacity percent</label>
			<input
				id="opacity-num"
				type="number"
				min="0"
				max="100"
				bind:value={localOpacity}
				class="border-base-300 bg-base-200/80 w-14 rounded border px-1 py-0.5 text-center text-sm"
				onchange={() => {
					canvasApi?.setSelectedOpacity(localOpacity);
					canvasApi?.commitEdit();
				}}
			/>
		</div>
	</Popover.Content>
</Popover.Root>
