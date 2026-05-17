<script lang="ts">
	import type { PostKanbanBoardPresenter } from '$lib/posts/PostKanbanBoard.presenter.svelte';
	import type { PostKanbanSourceFilter } from './kanbanTypes';
	import { POST_KANBAN_COLUMNS } from './kanbanTypes';
	import KanbanColumn from './KanbanColumn.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		presenter: PostKanbanBoardPresenter;
	};

	let { presenter }: Props = $props();

	const sourceFilter = $derived(presenter.sourceFilter);
	const status = $derived(presenter.status);
	const columns = $derived(presenter.columnsVm);
	const error = $derived(presenter.error);

	function setFilter(next: PostKanbanSourceFilter) {
		presenter.setSourceFilter(next);
	}
</script>

<section class="mt-8" aria-labelledby="post-kanban-heading">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 id="post-kanban-heading" class="text-lg font-semibold text-base-content">
				Post approval board
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				Review AI-generated and manual posts before they go live.
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
					title={col.title}
					cards={columns[col.id]}
					onToggleReviewed={(id, checked) => presenter.toggleReviewed(id, checked)}
					onNoteChange={(id, note) => presenter.updateNote(id, note)}
				/>
			{/each}
		</div>
	{/if}
</section>
