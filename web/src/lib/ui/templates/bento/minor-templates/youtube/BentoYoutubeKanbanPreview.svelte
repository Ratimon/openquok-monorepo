<script lang="ts">
	import type { PostKanbanReviewFilter, PostKanbanSourceFilter, PostKanbanTimeFilter } from '$lib/posts/postKanbanBoard.types';
	import {
		POST_KANBAN_COLUMNS,
		POST_KANBAN_REVIEW_FILTER_OPTIONS,
		POST_KANBAN_SOURCE_FILTER_OPTIONS,
		POST_KANBAN_TIME_FILTER_OPTIONS
	} from '$lib/posts/postKanbanBoard.types';
	import {
		buildKanbanColumnCounts,
		buildKanbanColumnsWithTimeFilter,
		filterKanbanCardsByReview,
		filterKanbanCardsBySource,
		groupKanbanCardsIntoColumns
	} from '$lib/posts/utils/postKanbanBoardCards';

	import KanbanBoardFilters from '$lib/ui/components/posts/kanban/KanbanBoardFilters.svelte';
	import KanbanColumn from '$lib/ui/components/posts/kanban/KanbanColumn.svelte';
	import { YOUTUBE_LANDING_KANBAN_CARDS } from './youtubeLandingKanbanMock';
	import { YOUTUBE_LANDING_MOCK_CHANNEL } from './youtubeLandingMock';

	const mockChannels = [YOUTUBE_LANDING_MOCK_CHANNEL];
	const kanbanPosts = YOUTUBE_LANDING_KANBAN_CARDS.map((card) => ({ tagNames: card.tagNames }));

	let sourceFilter = $state<PostKanbanSourceFilter>('all');
	let reviewFilter = $state<PostKanbanReviewFilter>('all');
	let timeFilter = $state<PostKanbanTimeFilter>('all-upcoming');

	const filteredCards = $derived(
		filterKanbanCardsByReview(
			filterKanbanCardsBySource(YOUTUBE_LANDING_KANBAN_CARDS, sourceFilter),
			reviewFilter
		)
	);
	const columnsVm = $derived(buildKanbanColumnsWithTimeFilter(filteredCards, timeFilter));
	const columnCountsVm = $derived(
		buildKanbanColumnCounts(columnsVm, groupKanbanCardsIntoColumns(filteredCards))
	);

	function noop() {}
</script>

<div class="bg-base-100 text-base-content">
	<div class="border-b border-base-300 px-4 py-3">
		<h3 class="text-base font-semibold">On-going Tasks</h3>
		<p class="mt-1 text-xs text-base-content/70">
			Review agent and human drafts, then drag YouTube uploads between Drafted and Scheduled.
		</p>
	</div>

	<div class="pointer-events-auto px-4 py-3">
		<KanbanBoardFilters
			channels={mockChannels}
			allGroups={true}
			selectedGroupIds={[]}
			allSocialPlatforms={true}
			selectedSocialPlatformIdentifiers={[]}
			allTags={true}
			selectedTagNames={[]}
			tagsVm={[]}
			{kanbanPosts}
			timeFilterOptions={POST_KANBAN_TIME_FILTER_OPTIONS}
			{timeFilter}
			sourceFilterOptions={POST_KANBAN_SOURCE_FILTER_OPTIONS}
			{sourceFilter}
			reviewFilterOptions={POST_KANBAN_REVIEW_FILTER_OPTIONS}
			{reviewFilter}
			calendarHref="/account/calendar"
			onGroupFilterChange={noop}
			onSocialPlatformFilterChange={noop}
			onTagFilterChange={noop}
			onTimeFilterChange={(next) => {
				timeFilter = next;
			}}
			onSourceFilterChange={(next) => {
				sourceFilter = next;
			}}
			onReviewFilterChange={(next) => {
				reviewFilter = next;
			}}
		/>
	</div>

	<div class="pointer-events-none flex gap-3 overflow-x-auto px-4 pb-4">
		{#each POST_KANBAN_COLUMNS as col (col.id)}
			<KanbanColumn
				columnId={col.id}
				title={col.title}
				cardsVm={columnsVm[col.id]}
				countVm={columnCountsVm[col.id]}
				movingPostGroup={null}
				isDragOver={false}
				activeDrag={null}
				onDragStart={noop}
				onDragEnd={noop}
				onDragOverColumn={noop}
				onDropOnColumn={async () => ({ ok: false, error: 'Preview only' })}
				onToggleReviewed={noop}
				onNoteChange={noop}
			/>
		{/each}
	</div>
</div>
