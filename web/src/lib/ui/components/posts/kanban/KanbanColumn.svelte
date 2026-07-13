<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type {
		PostKanbanColumnCountViewModel,
		PostKanbanColumnId
	} from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { KanbanCardDragPayload } from './kanbanDnd';

	import KanbanColumnDropZone from './KanbanColumnDropZone.svelte';
	import KanbanColumnShell from '$lib/ui/components/kanban-board/KanbanColumnShell.svelte';
	import KanbanPostCard from './KanbanPostCard.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	/** Cards per column page — sized so review + note fit without clipping. */
	const KANBAN_COLUMN_PAGE_SIZE = 4;

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
		onEditPost?: (postGroup: string) => void;
		/** When true, draft → scheduled drops are blocked (monthly post cap). */
		postsLimitFull?: boolean;
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
		onOpenPostActions,
		onEditPost,
		postsLimitFull = false
	}: Props = $props();

	let pageIndex = $state(0);
	let scrollViewport = $state<HTMLDivElement | null>(null);

	const pageCount = $derived(Math.max(1, Math.ceil(cardsVm.length / KANBAN_COLUMN_PAGE_SIZE)));
	const safePageIndex = $derived(Math.min(pageIndex, pageCount - 1));
	const pageStart = $derived(safePageIndex * KANBAN_COLUMN_PAGE_SIZE);
	const visibleCardsVm = $derived(
		cardsVm.slice(pageStart, pageStart + KANBAN_COLUMN_PAGE_SIZE)
	);
	const showPagination = $derived(cardsVm.length > KANBAN_COLUMN_PAGE_SIZE);
	const rangeLabel = $derived(
		cardsVm.length === 0
			? ''
			: `${pageStart + 1}–${Math.min(pageStart + KANBAN_COLUMN_PAGE_SIZE, cardsVm.length)} of ${cardsVm.length}`
	);

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
				: postsLimitFull
					? 'Monthly post limit reached — upgrade to schedule more'
					: 'Drop here to schedule'
	);

	$effect(() => {
		cardsVm;
		pageIndex = 0;
	});

	$effect(() => {
		if (pageIndex !== safePageIndex) {
			pageIndex = safePageIndex;
		}
	});

	function goToPrevPage() {
		pageIndex = Math.max(0, safePageIndex - 1);
		scrollViewport?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goToNextPage() {
		pageIndex = Math.min(pageCount - 1, safePageIndex + 1);
		scrollViewport?.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<KanbanColumnShell
	{title}
	countLabel={countLabel}
	countTitle="Visible posts / total in column"
	bodyScrollable={false}
	bodyClass="min-h-0"
>
	<KanbanColumnDropZone
		{columnId}
		{isDragOver}
		{activeDrag}
		{postsLimitFull}
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
					{onEditPost}
				/>
			{/each}
		{/if}
	</KanbanColumnDropZone>

	{#snippet footer()}
		{#if showPagination}
			<footer
				class="mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-base-300 pt-2"
				aria-label="Column pagination"
			>
				<span class="text-[10px] tabular-nums text-base-content/60">{rangeLabel}</span>
				<div class="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="h-7 min-h-7 px-2"
						disabled={safePageIndex <= 0}
						aria-label="Previous page"
						onclick={goToPrevPage}
					>
						Prev
					</Button>
					<span class="text-[10px] tabular-nums text-base-content/50">
						{safePageIndex + 1}/{pageCount}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="h-7 min-h-7 px-2"
						disabled={safePageIndex >= pageCount - 1}
						aria-label="Next page"
						onclick={goToNextPage}
					>
						Next
					</Button>
				</div>
			</footer>
		{/if}
	{/snippet}
</KanbanColumnShell>
