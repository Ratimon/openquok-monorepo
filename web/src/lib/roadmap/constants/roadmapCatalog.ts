import type {
	RoadmapCategoryOptionViewModel,
	RoadmapColumnOptionViewModel,
	RoadmapItemViewModel
} from '$lib/roadmap/roadmap.types';

export const ROADMAP_COLUMNS: readonly RoadmapColumnOptionViewModel[] = [
	{
		id: 'planned',
		title: 'Planned',
		statusDotClass: 'bg-info'
	},
	{
		id: 'in_progress',
		title: 'In Progress',
		statusDotClass: 'bg-secondary'
	},
	{
		id: 'complete',
		title: 'Complete',
		statusDotClass: 'bg-success',
		emptyTitle: 'Nothing shipped yet',
		emptyDescription: 'Share your feedback and check back here for updates.'
	}
] as const;

export const ROADMAP_CATEGORIES: readonly RoadmapCategoryOptionViewModel[] = [
	{ id: 'product', label: 'Product' },
	{ id: 'platform', label: 'Platform' },
	{ id: 'integrations', label: 'Integrations' }
] as const;

/** Public roadmap catalog — replace with API data when backend ships. */
export const ROADMAP_ITEMS: readonly RoadmapItemViewModel[] = [
	{
		id: 'tag-posts-filter',
		title: 'Tag posts and filter them later',
		categoryId: 'product',
		columnId: 'planned',
		upvoteCount: 4
	},
	{
		id: 'mobile-app',
		title: 'Mobile application',
		categoryId: 'product',
		columnId: 'planned',
		upvoteCount: 16
	},
	{
		id: 'workspace-templates',
		title: 'Workspace-level post templates',
		categoryId: 'product',
		columnId: 'planned',
		upvoteCount: 2
	},
	{
		id: 'bulk-reschedule',
		title: 'Bulk reschedule from the calendar',
		categoryId: 'product',
		columnId: 'planned',
		upvoteCount: 5
	},
	{
		id: 'analytics-export',
		title: 'Export analytics to CSV',
		categoryId: 'product',
		columnId: 'planned',
		upvoteCount: 1
	},
	{
		id: 'publish-webhooks',
		title: 'Webhooks for publish events',
		categoryId: 'platform',
		columnId: 'planned',
		upvoteCount: 3
	},
	{
		id: 'ai-portraits',
		title: 'Generate Portraits of yourself with AI Agents',
		categoryId: 'product',
		columnId: 'in_progress',
		upvoteCount: 3
	}
] as const;

export function roadmapCategoryLabel(categoryId: RoadmapItemViewModel['categoryId']): string {
	return ROADMAP_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}
