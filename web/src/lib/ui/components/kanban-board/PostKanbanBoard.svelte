<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PostKanbanBoardPresenter } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { PostKanbanColumnId, PostKanbanSourceFilter } from '$lib/ui/components/kanban-board/kanbanTypes';
	import type { KanbanCardDragPayload } from '$lib/ui/components/kanban-board/kanbanDnd';

	import { POST_KANBAN_COLUMNS } from './kanbanTypes';
	import KanbanColumn from './KanbanColumn.svelte';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		presenter: PostKanbanBoardPresenter;
		channels?: readonly CreateSocialPostChannelViewModel[];
		onOpenPostActions?: (payload: { postGroup: string; postId: string }) => void;
	};

	let { presenter, channels = [], onOpenPostActions }: Props = $props();

	$effect(() => {
		presenter.setChannels(channels);
	});

	let dragOverColumnId = $state<PostKanbanColumnId | null>(null);
	let activeDrag = $state<KanbanCardDragPayload | null>(null);

	const sourceFilter = $derived(presenter.sourceFilter);
	const status = $derived(presenter.status);
	const columns = $derived(presenter.columnsVm);
	const error = $derived(presenter.error);
	const movingPostGroup = $derived(presenter.movingPostGroup);

	function setFilter(next: PostKanbanSourceFilter) {
		presenter.setSourceFilter(next);
	}

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

	function handleDropOnColumn(columnId: PostKanbanColumnId, payload: KanbanCardDragPayload) {
		dragOverColumnId = null;
		activeDrag = null;
		void presenter.moveCardToColumn(payload, columnId);
	}
</script>

<section class="mt-8" aria-labelledby="post-kanban-heading">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 id="post-kanban-heading" class="text-lg font-semibold text-base-content">
				Post approval board
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Review AI-generated and manual posts before they go live. Drag between Drafted and Scheduled;
				use the menu on a card for edit, preview, and delete; double-click the review note to edit.
			</p>
		</div>
		<div
			class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
			role="group"
			aria-label="Filter by source"
		>
			{#each [
				{ id: 'all' as const, label: 'All' },
				{ id: 'agent' as const, label: 'Agent (AI)' },
				{ id: 'human' as const, label: 'Human' }
			] as opt}
				<Button
					type="button"
					variant={sourceFilter === opt.id ? 'secondary' : 'ghost'}
					size="sm"
					class="rounded-none px-3"
					aria-pressed={sourceFilter === opt.id}
					onclick={() => setFilter(opt.id)}
				>
					{opt.label}
				</Button>
			{/each}
		</div>
	</div>

	{#if status === 'loading'}
		<p class="mt-4 text-sm text-base-content/60">Loading posts…</p>
	{:else if status === 'error' && error}
		<p class="mt-4 text-sm text-error">{error}</p>
	{:else}
		<div class="mt-4 flex gap-3 overflow-x-auto pb-2">
			{#each POST_KANBAN_COLUMNS as col}
				<KanbanColumn
					columnId={col.id}
					title={col.title}
					cards={columns[col.id]}
					{movingPostGroup}
					{activeDrag}
					isDragOver={dragOverColumnId === col.id}
					{onOpenPostActions}
					onDragStart={handleCardDragStart}
					onDragEnd={handleCardDragEnd}
					onDragOverColumn={handleDragOverColumn}
					onDropOnColumn={handleDropOnColumn}
					onToggleReviewed={(id, checked) => presenter.toggleReviewed(id, checked)}
					onNoteChange={(id, note) => presenter.updateNote(id, note)}
				/>
			{/each}
		</div>
	{/if}
</section>
