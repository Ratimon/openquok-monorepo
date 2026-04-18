<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/canvas-editor/canvas/konvaCanvasApi';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		canUndo: boolean;
		canRedo: boolean;
	};

	let { disabled = false, canvasApi, canUndo, canRedo }: Props = $props();

	const undoDisabled = $derived(disabled || !canvasApi || !canUndo);
	const redoDisabled = $derived(disabled || !canvasApi || !canRedo);
</script>

<div class="flex items-center gap-0 pe-2 sm:pe-2.5" role="group" aria-label="History">
	<button
		type="button"
		class="btn btn-ghost btn-xs btn-square"
		disabled={undoDisabled}
		title="Undo"
		aria-label="Undo"
		onclick={() => canvasApi?.undo()}
	>
		<AbstractIcon name={icons.Undo2.name} class="size-4" width="16" height="16" />
	</button>
	<button
		type="button"
		class="btn btn-ghost btn-xs btn-square"
		disabled={redoDisabled}
		title="Redo"
		aria-label="Redo"
		onclick={() => canvasApi?.redo()}
	>
		<AbstractIcon name={icons.Undo2.name} class="size-4 -scale-x-100" width="16" height="16" />
	</button>
</div>
