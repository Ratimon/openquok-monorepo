<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PostKanbanColumnId } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import { canMoveKanbanCard, parseKanbanCardDrag, type KanbanCardDragPayload } from './kanbanDnd';

	type Props = {
		columnId: PostKanbanColumnId;
		isDragOver: boolean;
		activeDrag: KanbanCardDragPayload | null;
		onDragOverColumn: (columnId: PostKanbanColumnId | null) => void;
		onDropOnColumn: (columnId: PostKanbanColumnId, payload: KanbanCardDragPayload) => void;
		/** Bind scroll viewport for column infinite scroll (`IntersectionObserver` root). */
		viewportRef?: HTMLDivElement | null;
		children: Snippet;
	};

	let {
		columnId,
		isDragOver,
		activeDrag,
		onDragOverColumn,
		onDropOnColumn,
		viewportRef = $bindable<HTMLDivElement | null>(null),
		children
	}: Props = $props();

	let dropActive = $state(false);

	const isHighlighted = $derived(dropActive || isDragOver);
	const highlightClasses =
		'ring-2 ring-primary ring-offset-2 ring-offset-base-200 bg-primary/5 border-2 border-dashed border-primary';

	function resolvePayload(dataTransfer: DataTransfer | null): KanbanCardDragPayload | null {
		return parseKanbanCardDrag(dataTransfer, activeDrag);
	}

	function handleDragOver(e: DragEvent) {
		const payload = resolvePayload(e.dataTransfer ?? null);
		if (!payload || !canMoveKanbanCard(payload.sourceColumn, columnId)) {
			dropActive = false;
			onDragOverColumn(null);
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		dropActive = true;
		onDragOverColumn(columnId);
	}

	function handleDragLeave(e: DragEvent) {
		const related = e.relatedTarget as Node | null;
		if (related && e.currentTarget instanceof Node && e.currentTarget.contains(related)) {
			return;
		}
		dropActive = false;
		onDragOverColumn(null);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dropActive = false;
		onDragOverColumn(null);
		const payload = resolvePayload(e.dataTransfer ?? null);
		if (!payload || !canMoveKanbanCard(payload.sourceColumn, columnId)) return;
		onDropOnColumn(columnId, payload);
	}
</script>

<!-- capture so drops on cards still hit the column target -->
<div
	bind:this={viewportRef}
	class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-md transition-colors {isHighlighted
		? highlightClasses
		: ''}"
	ondragovercapture={handleDragOver}
	ondragleave={handleDragLeave}
	ondropcapture={handleDrop}
	role="list"
>
	{@render children()}
</div>
