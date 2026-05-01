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

	const locked = $derived(selection.hasSelection && selection.locked);
	const btnDisabled = $derived(disabled || !canvasApi || !selection.hasSelection);
</script>

<button
	type="button"
	class="btn btn-ghost btn-xs btn-square {locked && selection.hasSelection
		? 'ring-1 ring-primary ring-opacity-50'
		: ''}"
	disabled={btnDisabled}
	title={locked ? 'Unlock — allow moving' : 'Lock — prevent moving'}
	aria-label={locked ? 'Unlock' : 'Lock'}
	aria-pressed={locked}
	onclick={() => canvasApi?.setSelectedLocked(!locked)}
>
	<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
</button>
