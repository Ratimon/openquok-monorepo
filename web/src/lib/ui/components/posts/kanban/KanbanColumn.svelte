<script lang="ts">
	import type { PostKanbanCardViewModel } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type {
		PostKanbanColumnCountViewModel,
		PostKanbanColumnId
	} from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { KanbanCardDragPayload } from './kanbanDnd';

	import KanbanColumnDropZone from './KanbanColumnDropZone.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import KanbanColumnShell from '$lib/ui/components/kanban-board/KanbanColumnShell.svelte';
	import KanbanPostCard from './KanbanPostCard.svelte';

	const DEFAULT_KANBAN_COLUMN_PAGE_SIZE = 4;

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

	let itemsPerPage = $state(DEFAULT_KANBAN_COLUMN_PAGE_SIZE);
	let currentPage = $state(1);
	let scrollViewport = $state<HTMLDivElement | null>(null);

	const totalPages = $derived(Math.max(1, Math.ceil(cardsVm.length / itemsPerPage)));
	const safeCurrentPage = $derived(Math.min(currentPage, totalPages));
	const pageStart = $derived((safeCurrentPage - 1) * itemsPerPage);
	const visibleCardsVm = $derived(cardsVm.slice(pageStart, pageStart + itemsPerPage));

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
		currentPage = 1;
	});

	$effect(() => {
		if (currentPage !== safeCurrentPage) {
			currentPage = safeCurrentPage;
		}
	});

	function setItemsPerPage(size: number) {
		itemsPerPage = size;
		currentPage = 1;
		scrollViewport?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function setCurrentPage(page: number) {
		currentPage = page;
		scrollViewport?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function paginateToFirstPage() {
		setCurrentPage(1);
	}

	function paginateToLastPage() {
		setCurrentPage(totalPages);
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
		<Pagination
			compact
			class="border-t border-base-300 pt-2"
			pageSizeSelectId={`kanban-${columnId}-page-size`}
			{itemsPerPage}
			totalItems={cardsVm.length}
			currentPage={safeCurrentPage}
			{totalPages}
			{setItemsPerPage}
			setCurrentPage={setCurrentPage}
			paginateBackFF={paginateToFirstPage}
			paginateFrontFF={paginateToLastPage}
			nameOfItems="posts"
			pageSizeOptions={[2, 4, 6, 8, 10]}
		/>
	{/snippet}
</KanbanColumnShell>
