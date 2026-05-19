<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import CopyStyleButton from './controls/CopyStyleButton.svelte';
	import DuplicateButton from './controls/DuplicateButton.svelte';
	import HelpToolbarButton from './controls/HelpToolbarButton.svelte';
	import HistoryButtons from './controls/HistoryButtons.svelte';
	import LockButton from './controls/LockButton.svelte';
	import OpacityPicker from './controls/OpacityPicker.svelte';
	import PositionPicker from './controls/PositionPicker.svelte';
	import RemoveButton from './controls/RemoveButton.svelte';
	import TextToolbar from './controls/TextToolbar.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		canUndo: boolean;
		canRedo: boolean;
		selection: CanvasSelectionState;
	};

	let {
		disabled = false,
		canvasApi,
		canUndo,
		canRedo,
		selection
	}: Props = $props();
</script>

<div
	class="border-base-300 flex flex-wrap items-center gap-1 border-b px-2 py-1.5 sm:px-3"
	role="toolbar"
	aria-label="Canvas editing tools"
>
	<HistoryButtons {disabled} {canvasApi} {canUndo} {canRedo} />
	<div class="bg-base-300/60 mx-1 hidden h-5 w-px sm:block"></div>
	<!-- <GroupButton {disabled} {canvasApi} /> -->
	<PositionPicker {disabled} {canvasApi} {selection} />
	<OpacityPicker {disabled} {canvasApi} {selection} />
	<LockButton {disabled} {canvasApi} {selection} />
	<TextToolbar {disabled} {canvasApi} {selection} />
	<DuplicateButton {disabled} {canvasApi} {selection} />
	<RemoveButton {disabled} {canvasApi} {selection} />
	<CopyStyleButton {disabled} {canvasApi} />
	<HelpToolbarButton {disabled} {canvasApi} />
</div>
