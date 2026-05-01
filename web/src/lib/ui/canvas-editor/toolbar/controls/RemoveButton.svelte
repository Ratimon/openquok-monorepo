<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		selection: CanvasSelectionState;
	};

	let { disabled = false, canvasApi, selection }: Props = $props();
</script>

<button
	type="button"
	class="btn btn-ghost btn-xs btn-square"
	disabled={disabled || !canvasApi || !selection.hasSelection}
	title="Remove"
	aria-label="Remove"
	onclick={() => canvasApi?.removeSelected()}
>
	<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
</button>
