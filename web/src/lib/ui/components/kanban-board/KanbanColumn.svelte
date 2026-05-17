<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { PostKanbanColumnId } from './kanbanTypes';
	import type { KanbanCardDragPayload } from './kanbanDnd';
	import KanbanColumnDropZone from './KanbanColumnDropZone.svelte';

	import KanbanPostCard from './KanbanPostCard.svelte';

	type Props = {
		columnId: PostKanbanColumnId;
		title: string;
		cards: PostKanbanCardViewModel[];
		movingPostGroup: string | null;
		isDragOver: boolean;
		activeDrag: KanbanCardDragPayload | null;
		onDragStart: (payload: KanbanCardDragPayload) => void;
		onDragEnd: () => void;
		onDragOverColumn: (columnId: PostKanbanColumnId | null) => void;
		onDropOnColumn: (columnId: PostKanbanColumnId, payload: KanbanCardDragPayload) => void;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
		onOpenPostActions?: (payload: { postGroup: string; postId: string }) => void;
	};

	let {
		columnId,
		title,
		cards,
		movingPostGroup,
		isDragOver,
		activeDrag,
		onDragStart,
		onDragEnd,
		onDragOverColumn,
		onDropOnColumn,
		onToggleReviewed,
		onNoteChange,
		onOpenPostActions
	}: Props = $props();

	const dropHint = $derived(
		columnId === 'published'
			? 'Published posts stay in this column'
			: columnId === 'draft'
				? 'Drop here to move back to draft'
				: 'Drop here to schedule'
	);
</script>

<section class="flex min-h-[280px] min-w-[220px] flex-1 flex-col rounded-lg border border-base-300 bg-base-200/60 p-3">
	<header class="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-base-300 pb-2">
		<h3 class="text-sm font-semibold text-base-content">{title}</h3>
		<span class="badge badge-ghost badge-sm">{cards.length}</span>
	</header>

	<KanbanColumnDropZone {columnId} {isDragOver} {activeDrag} {onDragOverColumn} {onDropOnColumn}>
		{#if cards.length === 0}
			<p class="py-6 text-center text-xs text-base-content/50">
				{dropHint}
			</p>
		{:else}
			{#each cards as card (card.postGroup)}
				<KanbanPostCard
					{card}
					isMoving={movingPostGroup === card.postGroup}
					{onDragStart}
					{onDragEnd}
					{onToggleReviewed}
					{onNoteChange}
					onOpenActions={onOpenPostActions}
				/>
			{/each}
		{/if}
	</KanbanColumnDropZone>
</section>
