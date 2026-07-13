export type RoadmapColumnId = 'planned' | 'in_progress' | 'complete';

export type RoadmapCategoryId = 'product' | 'platform' | 'integrations';

export type RoadmapItemViewModel = {
	id: string;
	title: string;
	categoryId: RoadmapCategoryId;
	columnId: RoadmapColumnId;
	upvoteCount: number;
};

export type RoadmapColumnOptionViewModel = {
	id: RoadmapColumnId;
	title: string;
	statusDotClass: string;
	emptyTitle?: string;
	emptyDescription?: string;
};

export type RoadmapCategoryOptionViewModel = {
	id: RoadmapCategoryId;
	label: string;
};

export type RoadmapColumnsViewModel = Record<RoadmapColumnId, RoadmapItemViewModel[]>;
