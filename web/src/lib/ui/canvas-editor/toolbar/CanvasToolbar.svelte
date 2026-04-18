<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import CopyStyleButton from './controls/CopyStyleButton.svelte';
	import DuplicateButton from './controls/DuplicateButton.svelte';
	// import GroupButton from './controls/GroupButton.svelte';
	import HelpToolbarButton from './controls/HelpToolbarButton.svelte';
	import HistoryButtons from './controls/HistoryButtons.svelte';
	import LockButton from './controls/LockButton.svelte';
	import OpacityPicker from './controls/OpacityPicker.svelte';
	import PositionPicker from './controls/PositionPicker.svelte';
	import RemoveButton from './controls/RemoveButton.svelte';
	import TextToolbar from './controls/TextToolbar.svelte';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		canUndo: boolean;
		canRedo: boolean;
		selection: CanvasSelectionState;
		onUseMedia?: () => void;
		/** Label for the primary export / attach action (e.g. composer vs. media library). */
		useMediaLabel?: string;
	};

	let {
		disabled = false,
		canvasApi,
		canUndo,
		canRedo,
		selection,
		onUseMedia,
		useMediaLabel = 'Use this media'
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
	<span class="flex-1"></span>
	<Button
		type="button"
		variant="primary"
		size="sm"
		class="gap-1.5"
		disabled={disabled || !canvasApi}
		onclick={() => onUseMedia?.()}
	>
		<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
		{useMediaLabel}
	</Button>
</div>
