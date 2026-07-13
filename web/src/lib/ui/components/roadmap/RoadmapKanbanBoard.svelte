<script lang="ts">
	import type {
		RoadmapColumnOptionViewModel,
		RoadmapColumnsViewModel
	} from '$lib/roadmap/roadmap.types';

	import KanbanBoardLayout from '$lib/ui/components/kanban-board/KanbanBoardLayout.svelte';
	import RoadmapKanbanColumn from '$lib/ui/components/roadmap/RoadmapKanbanColumn.svelte';

	type Props = {
		columnOptionsVm: readonly RoadmapColumnOptionViewModel[];
		columnsVm: RoadmapColumnsViewModel;
	};

	let { columnOptionsVm, columnsVm }: Props = $props();
</script>

<KanbanBoardLayout>
	{#each columnOptionsVm as columnVm (columnVm.id)}
		<RoadmapKanbanColumn
			columnOptionVm={columnVm}
			itemsVm={columnsVm[columnVm.id]}
		/>
	{/each}
</KanbanBoardLayout>
