/** Kanban column keys mapped from `posts.state`. */
export type PostKanbanColumnId = 'draft' | 'scheduled' | 'published';

export const POST_KANBAN_COLUMNS: { id: PostKanbanColumnId; title: string }[] = [
	{ id: 'draft', title: 'Drafted posts' },
	{ id: 'scheduled', title: 'Scheduled posts' },
	{ id: 'published', title: 'Published posts' }
];

export type PostKanbanSourceFilter = 'all' | 'agent' | 'human';
