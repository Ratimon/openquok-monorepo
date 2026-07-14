import type {
	RoadmapCategoryId,
	RoadmapColumnsViewModel,
	RoadmapColumnId,
	RoadmapItemViewModel
} from '$lib/roadmap/roadmap.types';

export function filterRoadmapItems(
	items: readonly RoadmapItemViewModel[],
	selectedCategoryIds: readonly RoadmapCategoryId[]
): RoadmapItemViewModel[] {
	if (selectedCategoryIds.length === 0) return [...items];
	const selected = new Set(selectedCategoryIds);
	return items.filter((item) => selected.has(item.categoryId));
}

export function groupRoadmapItemsByColumn(
	items: readonly RoadmapItemViewModel[]
): RoadmapColumnsViewModel {
	const columns: RoadmapColumnsViewModel = {
		planned: [],
		in_progress: [],
		complete: []
	};

	for (const item of items) {
		columns[item.columnId].push(item);
	}

	for (const columnId of Object.keys(columns) as RoadmapColumnId[]) {
		columns[columnId].sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
	}

	return columns;
}

export function countActiveRoadmapFilters(selectedCategoryIds: readonly RoadmapCategoryId[]): number {
	return selectedCategoryIds.length;
}
