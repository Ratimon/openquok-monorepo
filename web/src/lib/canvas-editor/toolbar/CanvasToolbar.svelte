<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/canvas-editor/konvaCanvasApi';
	import type { AspectRatioPreset } from '$lib/canvas-editor/utils/aspectRatioPresets';
	import { ASPECT_RATIO_PRESETS } from '$lib/canvas-editor/utils/aspectRatioPresets';
	import CopyStyleButton from './copyStyleButton.svelte';
	import DuplicateButton from './duplicateButton.svelte';
	// import GroupButton from './groupButton.svelte';
	import HelpToolbarButton from './helpToolbarButton.svelte';
	import HistoryButtons from './historyButtons.svelte';
	import LockButton from './lockButton.svelte';
	import OpacityPicker from './opacityPicker.svelte';
	import PositionPicker from './positionPicker.svelte';
	import RemoveButton from './removeButton.svelte';
	import TextToolbar from './textToolbar.svelte';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		canUndo: boolean;
		canRedo: boolean;
		selection: CanvasSelectionState;
		selectedAspect: AspectRatioPreset;
		aspectRatioId: string;
		onAspectChange?: (id: string) => void;
		onUseMedia?: () => void;
	};

	let {
		disabled = false,
		canvasApi,
		canUndo,
		canRedo,
		selection,
		selectedAspect,
		aspectRatioId,
		onAspectChange,
		onUseMedia
	}: Props = $props();
</script>

<div
	class="border-base-300 flex flex-wrap items-center gap-1 border-b px-2 py-1.5 sm:px-3"
	role="toolbar"
	aria-label="Canvas actions"
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
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			type="button"
			class="border-base-300 bg-base-200/70 text-base-content hover:bg-base-300/80 inline-flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:max-w-none sm:gap-2 sm:px-3 sm:text-sm"
			aria-label="Aspect ratio"
		>
			<AbstractIcon name={icons.LayoutTemplate.name} class="size-3.5 shrink-0 opacity-80 sm:size-4" width="16" height="16" />
			<span class="truncate">{selectedAspect.label}</span>
			<AbstractIcon name={icons.ChevronDown.name} class="size-3.5 shrink-0 opacity-60 sm:size-4" width="16" height="16" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-[13.5rem] p-1" align="end" sideOffset={6}>
			<DropdownMenu.Label>Aspect ratio</DropdownMenu.Label>
			{#each ASPECT_RATIO_PRESETS as p (p.id)}
				<DropdownMenu.Item
					class="flex cursor-pointer items-center justify-between gap-2 pr-2 {aspectRatioId === p.id
						? 'bg-base-200'
						: ''}"
					onclick={() => onAspectChange?.(p.id)}
				>
					<span>{p.label}</span>
					{#if aspectRatioId === p.id}
						<AbstractIcon name={icons.Check.name} class="size-4 shrink-0" width="16" height="16" />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Button
		type="button"
		variant="primary"
		size="sm"
		class="gap-1.5"
		disabled={disabled || !canvasApi}
		onclick={() => onUseMedia?.()}
	>
		<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
		Use this media
	</Button>
</div>
