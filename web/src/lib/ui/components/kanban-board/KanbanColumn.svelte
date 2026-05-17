<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type {
		PostKanbanColumnCountViewModel,
		PostKanbanColumnId
	} from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { KanbanCardDragPayload } from './kanbanDnd';

	import KanbanColumnDropZone from './KanbanColumnDropZone.svelte';
	import KanbanPostCard from './KanbanPostCard.svelte';

	const KANBAN_COLUMN_PAGE_SIZE = 24;

	type Props = {
		columnId: PostKanbanColumnId;
		title: string;
		cardsVm: PostKanbanCardViewModel[];
		countVm: PostKanbanColumnCountViewModel;
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
		cardsVm,
		countVm,
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

	let visibleCount = $state(KANBAN_COLUMN_PAGE_SIZE);
	let scrollViewport = $state<HTMLDivElement | null>(null);
	let loadSentinel = $state<HTMLDivElement | null>(null);

	const visibleCardsVm = $derived(cardsVm.slice(0, visibleCount));
	const hasMoreCards = $derived(visibleCount < cardsVm.length);

	const countLabel = $derived(
		countVm.visible === countVm.total
			? String(countVm.visible)
			: `${countVm.visible} / ${countVm.total}`
	);

	const dropHint = $derived(
		columnId === 'published'
			? 'Published posts stay in this column'
			: columnId === 'draft'
				? 'Drop here to move back to draft'
				: 'Drop here to schedule'
	);

	$effect(() => {
		cardsVm;
		visibleCount = KANBAN_COLUMN_PAGE_SIZE;
	});

	$effect(() => {
		const el = loadSentinel;
		const root = scrollViewport;
		if (!el || !root || !hasMoreCards) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					visibleCount = Math.min(visibleCount + KANBAN_COLUMN_PAGE_SIZE, cardsVm.length);
				}
			},
			{ root, rootMargin: '120px', threshold: 0 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<section
	class="flex max-h-[min(70vh,720px)] min-h-[280px] min-w-[220px] flex-1 flex-col rounded-lg border border-base-300 bg-base-200/60 p-3"
>
	<header class="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-base-300 pb-2">
		<h3 class="text-sm font-semibold text-base-content">{title}</h3>
		<span class="badge badge-ghost badge-sm tabular-nums" title="Visible posts / total in column">
			{countLabel}
		</span>
	</header>

	<KanbanColumnDropZone
		{columnId}
		{isDragOver}
		{activeDrag}
		bind:viewportRef={scrollViewport}
		{onDragOverColumn}
		{onDropOnColumn}
	>
		{#if cardsVm.length === 0}
			<p class="py-6 text-center text-xs text-base-content/50">
				{dropHint}
			</p>
		{:else}
			{#each visibleCardsVm as cardVm (cardVm.postGroup)}
				<KanbanPostCard
					{cardVm}
					isMoving={movingPostGroup === cardVm.postGroup}
					{onDragStart}
					{onDragEnd}
					{onToggleReviewed}
					{onNoteChange}
					onOpenActions={onOpenPostActions}
				/>
			{/each}
			{#if hasMoreCards}
				<div bind:this={loadSentinel} class="h-1 shrink-0" aria-hidden="true"></div>
				<p class="py-2 text-center text-xs text-base-content/50">Scroll for more posts…</p>
			{/if}
		{/if}
	</KanbanColumnDropZone>
</section>
