<script lang="ts">
	import type {
		PostKanbanColumnCountsViewModel,
		PostKanbanColumnId,
		PostKanbanColumnOptionViewModel,
		PostKanbanColumnsViewModel,
		PostKanbanMoveCardResultViewModel,
		PostKanbanSourceFilter,
		PostKanbanSourceFilterOptionViewModel,
		PostKanbanTimeFilter,
		PostKanbanTimeFilterOptionViewModel
	} from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { KanbanCardDragPayload } from '$lib/ui/components/kanban-board/kanbanDnd';

	import KanbanColumn from './KanbanColumn.svelte';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { toast } from '$lib/ui/sonner';

	function moveTargetColumnLabel(columnId: PostKanbanColumnId): string {
		if (columnId === 'draft') return 'Draft';
		if (columnId === 'scheduled') return 'Scheduled';
		return 'Published';
	}

	type Props = {
		columnsVm: PostKanbanColumnsViewModel;
		columnCountsVm: PostKanbanColumnCountsViewModel;
		columnOptions: readonly PostKanbanColumnOptionViewModel[];
		sourceFilterOptions: readonly PostKanbanSourceFilterOptionViewModel[];
		timeFilterOptions: readonly PostKanbanTimeFilterOptionViewModel[];
		sourceFilter: PostKanbanSourceFilter;
		timeFilter: PostKanbanTimeFilter;
		status: 'idle' | 'loading' | 'ready' | 'error';
		error: string | null;
		movingPostGroup: string | null;
		onSourceFilterChange: (next: PostKanbanSourceFilter) => void;
		onTimeFilterChange: (next: PostKanbanTimeFilter) => void;
		onMoveCardToColumn: (
			payload: KanbanCardDragPayload,
			targetColumn: PostKanbanColumnId
		) => Promise<PostKanbanMoveCardResultViewModel>;
		onToggleReviewed: (postId: string, isReviewed: boolean) => void;
		onNoteChange: (postId: string, note: string) => void;
		onOpenPostActions?: (payload: { postGroup: string; postId: string }) => void;
	};

	let {
		columnsVm,
		columnCountsVm,
		columnOptions,
		sourceFilterOptions,
		timeFilterOptions,
		sourceFilter,
		timeFilter,
		status,
		error,
		movingPostGroup,
		onSourceFilterChange,
		onTimeFilterChange,
		onMoveCardToColumn,
		onToggleReviewed,
		onNoteChange,
		onOpenPostActions
	}: Props = $props();

	let dragOverColumnId = $state<PostKanbanColumnId | null>(null);
	let activeDrag = $state<KanbanCardDragPayload | null>(null);

	function handleDragOverColumn(columnId: PostKanbanColumnId | null) {
		dragOverColumnId = columnId;
	}

	function handleCardDragStart(payload: KanbanCardDragPayload) {
		activeDrag = payload;
	}

	function handleCardDragEnd() {
		activeDrag = null;
		dragOverColumnId = null;
	}

	async function handleDropOnColumn(columnId: PostKanbanColumnId, payload: KanbanCardDragPayload) {
		dragOverColumnId = null;
		activeDrag = null;
		const result = await onMoveCardToColumn(payload, columnId);
		if (result.ok) {
			toast.success(`Post moved to ${moveTargetColumnLabel(result.targetColumn)}.`);
		} else {
			toast.error(result.error);
		}
	}
</script>

<section class="mt-8" aria-labelledby="post-kanban-heading">
	<div class="flex flex-col gap-3">
		<div>
			<h2 id="post-kanban-heading" class="text-lg font-semibold text-base-content">
				On-going Tasks
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Review AI-generated and manual posts before they go live. Drag between Drafted and Scheduled;
				use the menu on a card for edit, preview, and delete; double-click the review note to edit.
			</p>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
			<div
				class="inline-flex max-w-full overflow-x-auto rounded-lg border border-base-300 bg-base-100"
				role="group"
				aria-label="Filter by publish date"
			>
				{#each timeFilterOptions as opt (opt.id)}
					<Button
						type="button"
						variant={timeFilter === opt.id ? 'secondary' : 'ghost'}
						size="sm"
						class="shrink-0 rounded-none px-3"
						aria-pressed={timeFilter === opt.id}
						onclick={() => onTimeFilterChange(opt.id)}
					>
						{opt.label}
					</Button>
				{/each}
			</div>
			<div
				class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
				role="group"
				aria-label="Filter by source"
			>
				{#each sourceFilterOptions as opt (opt.id)}
					<Button
						type="button"
						variant={sourceFilter === opt.id ? 'secondary' : 'ghost'}
						size="sm"
						class="rounded-none px-3"
						aria-pressed={sourceFilter === opt.id}
						onclick={() => onSourceFilterChange(opt.id)}
					>
						{opt.label}
					</Button>
				{/each}
			</div>
		</div>
	</div>

	{#if status === 'loading'}
		<p class="mt-4 text-sm text-base-content/60">Loading posts…</p>
	{:else if status === 'error' && error}
		<p class="mt-4 text-sm text-error">{error}</p>
	{:else}
		<div class="mt-4 flex gap-3 overflow-x-auto pb-2">
			{#each columnOptions as col (col.id)}
				<KanbanColumn
					columnId={col.id}
					title={col.title}
					cardsVm={columnsVm[col.id]}
					countVm={columnCountsVm[col.id]}
					{movingPostGroup}
					{activeDrag}
					isDragOver={dragOverColumnId === col.id}
					{onOpenPostActions}
					onDragStart={handleCardDragStart}
					onDragEnd={handleCardDragEnd}
					onDragOverColumn={handleDragOverColumn}
					onDropOnColumn={handleDropOnColumn}
					{onToggleReviewed}
					{onNoteChange}
				/>
			{/each}
		</div>
	{/if}
</section>
