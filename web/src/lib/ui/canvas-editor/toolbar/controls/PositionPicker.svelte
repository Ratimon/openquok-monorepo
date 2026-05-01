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

	const hasSelection = $derived(selection.hasSelection);
	const canFwd = $derived(!!canvasApi?.canMoveSelectedForward());
	const canBack = $derived(!!canvasApi?.canMoveSelectedBackward());
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		type="button"
		class="btn btn-ghost btn-xs gap-1 px-2 sm:min-w-0"
		disabled={disabled || !canvasApi || !hasSelection}
		title="Position and layer order"
		aria-label="Position and layer order"
		aria-haspopup="dialog"
	>
		<AbstractIcon name={icons.PanelLeft.name} class="size-4" width="16" height="16" />
		<span class="hidden sm:inline">Position</span>
	</Popover.Trigger>
	<Popover.Content class="w-[min(20rem,calc(100vw-2rem))] p-3" align="start" sideOffset={6}>
		<p class="text-base-content/60 mb-2 text-xs font-medium tracking-wide uppercase">Layer</p>
		<div class="grid grid-cols-2 gap-1">
			<button
				type="button"
				class="btn btn-ghost btn-xs justify-start"
				disabled={!canvasApi || !canBack}
				onclick={() => {
					canvasApi?.moveSelectedBackward();
					open = false;
				}}
			>
				Backward
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs justify-start"
				disabled={!canvasApi || !canFwd}
				onclick={() => {
					canvasApi?.moveSelectedForward();
					open = false;
				}}
			>
				Forward
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs justify-start"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.moveSelectedToBack();
					open = false;
				}}
			>
				To back
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs justify-start"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.moveSelectedToFront();
					open = false;
				}}
			>
				To front
			</button>
		</div>
		<p class="text-base-content/60 mt-3 mb-2 text-xs font-medium tracking-wide uppercase">Align to page</p>
		<div class="grid grid-cols-3 gap-1">
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('left');
					open = false;
				}}>Left</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('centerH');
					open = false;
				}}>Center</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('right');
					open = false;
				}}>Right</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('top');
					open = false;
				}}>Top</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('centerV');
					open = false;
				}}>Middle</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canvasApi || !hasSelection}
				onclick={() => {
					canvasApi?.alignSelected('bottom');
					open = false;
				}}>Bottom</button>
		</div>
	</Popover.Content>
</Popover.Root>
