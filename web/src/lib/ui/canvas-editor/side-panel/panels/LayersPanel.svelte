<script lang="ts" module>
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	export type LayersPanelProps = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		selection: CanvasSelectionState;
		refreshKey: number;
	};
</script>

<script lang="ts">
	import type { CanvasLayerItem } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { icons } from '$data/icons';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { ScrollArea } from '$lib/ui/scroll-area';

	let { disabled = false, canvasApi, selection, refreshKey }: LayersPanelProps = $props();

	let layers = $state<CanvasLayerItem[]>([]);
	let editingId = $state<string | null>(null);
	let editDraft = $state('');
	let dragId = $state<string | null>(null);
	let dragOverId = $state<string | null>(null);

	$effect(() => {
		refreshKey;
		layers = canvasApi?.getLayerList() ?? [];
	});

	const selectedIds = $derived(selection.selectedIds ?? []);

	function isSelected(id: string) {
		return selectedIds.includes(id);
	}

	function onRowPointerDown(id: string, e: PointerEvent) {
		if (disabled || !canvasApi) return;
		const additive = e.ctrlKey || e.metaKey || e.shiftKey;
		e.preventDefault();
		canvasApi.selectLayers([id], { additive });
	}

	function startEdit(layer: CanvasLayerItem) {
		if (disabled) return;
		editingId = layer.id;
		editDraft = layer.displayName;
	}

	function commitEdit() {
		if (!canvasApi || !editingId) return;
		canvasApi.setLayerDisplayName(editingId, editDraft);
		editingId = null;
	}

	function cancelEdit() {
		editingId = null;
	}

	function onDragStart(id: string, e: DragEvent) {
		if (disabled) return;
		dragId = id;
		e.dataTransfer?.setData('text/plain', id);
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
	}

	function onDragEnd() {
		dragId = null;
		dragOverId = null;
	}

	function onDragOverRow(id: string, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dragOverId = id;
	}

	function onDragLeaveRow(id: string) {
		if (dragOverId === id) dragOverId = null;
	}

	function onDropRow(targetId: string) {
		if (!canvasApi || !dragId || dragId === targetId) {
			dragId = null;
			dragOverId = null;
			return;
		}
		const order = layers.map((l) => l.id);
		const from = order.indexOf(dragId);
		const to = order.indexOf(targetId);
		if (from < 0 || to < 0) return;
		const next = [...order];
		const [removed] = next.splice(from, 1);
		next.splice(to, 0, removed);
		canvasApi.setLayerOrderTopFirst(next);
		dragId = null;
		dragOverId = null;
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
	<p class="text-base-content/75 shrink-0 text-xs font-medium">
		Elements on your active page:</p>
	{#if layers.length === 0}
		<p class="text-base-content/50 text-sm">
			No elements yet.</p>
	{:else}
		<ScrollArea class="min-h-0 flex-1" orientation="vertical">
			{#snippet children()}
				<ul class="flex flex-col gap-1.5 pb-2 pr-1" role="list">
					{#each layers as layer (layer.id)}
						<li>
							<div
								class={cn(
									'border-base-300 bg-base-200/40 flex min-w-0 items-center gap-1 rounded-lg border px-1.5 py-1.5 transition-colors',
									isSelected(layer.id) && 'border-primary bg-primary/20 ring-primary/35 ring-1',
									dragOverId === layer.id && 'ring-primary/50 ring-1'
								)}
								onpointerdown={(e) => onRowPointerDown(layer.id, e)}
								role="group"
								ondragover={(e) => onDragOverRow(layer.id, e)}
								ondragleave={() => onDragLeaveRow(layer.id)}
								ondrop={() => onDropRow(layer.id)}
							>
								<button
									type="button"
									class="drag-handle text-base-content/45 hover:text-base-content/70 flex size-8 shrink-0 cursor-grab touch-manipulation items-center justify-center rounded p-0 active:cursor-grabbing"
									draggable={!disabled}
									ondragstart={(e) => onDragStart(layer.id, e)}
									ondragend={onDragEnd}
									onpointerdown={(e) => e.stopPropagation()}
									aria-label="Reorder layer"
								>
									<AbstractIcon
										name={icons.MenuLine.name}
										class="size-4"
										width="16"
										height="16"
									/>
								</button>
								<span class="text-base-content/45 w-[3.75rem] shrink-0 text-[11px]">{layer.typeLabel}</span>
								<div class="min-w-0 flex-1">
									{#if editingId === layer.id}
										<input
											class="border-base-300 bg-base-100 focus:ring-primary w-full rounded border px-1.5 py-0.5 text-xs outline-none focus:ring-1"
											bind:value={editDraft}
											onkeydown={(e) => {
												if (e.key === 'Enter') commitEdit();
												if (e.key === 'Escape') cancelEdit();
											}}
											onblur={commitEdit}
											onpointerdown={(e) => e.stopPropagation()}
											autocomplete="off"
										/>
									{:else}
										<button
											type="button"
											class="text-base-content/90 hover:text-base-content truncate text-left text-xs font-medium"
											disabled={disabled}
											onclick={(e) => {
												e.stopPropagation();
												if (!disabled) canvasApi?.selectLayers([layer.id]);
											}}
											ondblclick={(e) => {
												e.stopPropagation();
												startEdit(layer);
											}}
											onpointerdown={(e) => e.stopPropagation()}
										>
											{layer.displayName}
										</button>
									{/if}
								</div>
								<div
									class="flex shrink-0 items-center gap-0.5"
									role="group"
									onpointerdown={(e) => e.stopPropagation()}
								>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="size-8 shrink-0"
										disabled={disabled}
										title={layer.visible ? 'Hide' : 'Show'}
										onclick={() => canvasApi?.setLayerVisible(layer.id, !layer.visible)}
									>
										<AbstractIcon
											name={icons.Eye.name}
											class={cn('size-4', !layer.visible && 'opacity-35')}
											width="16"
											height="16"
										/>
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="size-8 shrink-0"
										disabled={disabled}
										title={layer.locked ? 'Unlock' : 'Lock'}
										onclick={() => canvasApi?.setLayerLocked(layer.id, !layer.locked)}
									>
										<AbstractIcon
											name={icons.Lock.name}
											class={cn('size-4', !layer.locked && 'opacity-35')}
											width="16"
											height="16"
										/>
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="size-8 shrink-0"
										disabled={disabled}
										title="Remove"
										onclick={() => canvasApi?.removeLayersByIds([layer.id])}
									>
										<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
									</Button>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/snippet}
		</ScrollArea>
	{/if}
</div>
