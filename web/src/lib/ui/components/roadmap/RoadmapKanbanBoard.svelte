<script lang="ts">
	import type {
		RoadmapColumnOptionViewModel,
		RoadmapColumnsViewModel
	} from '$lib/roadmap/roadmap.types';

	import KanbanBoardLayout from '$lib/ui/components/kanban-board/KanbanBoardLayout.svelte';
	import RoadmapKanbanColumn from '$lib/ui/components/roadmap/RoadmapKanbanColumn.svelte';

	type Props = {
		columns: readonly RoadmapColumnOptionViewModel[];
		columnsVm: RoadmapColumnsViewModel;
	};

	let { columns, columnsVm }: Props = $props();
</script>

<KanbanBoardLayout>
	{#each columns as column (column.id)}
		<RoadmapKanbanColumn {column} items={columnsVm[column.id]} />
	{/each}
</KanbanBoardLayout>
