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
		id: 'emoji-parser',
		title: 'Emoji Parser',
		categoryId: 'product',
		columnId: 'planned',
		priority: 1
	},
	{
		id: 'ai-writer',
		title: 'AI Writer',
		categoryId: 'product',
		columnId: 'planned',
		priority: 1
	},
	{
		id: 'ai-editor',
		title: 'AI Content Editor',
		categoryId: 'product',
		columnId: 'planned',
		priority: 1
	},
	{
		id: 'auto-short-links',
		title: 'Auto Short links',
		categoryId: 'product',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'desktop-app',
		title: 'Desktop application',
		categoryId: 'product',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'mobile-app',
		title: 'Mobile application',
		categoryId: 'product',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'n8n-integration',
		title: 'n8n integration',
		categoryId: 'product',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'facebook-provider',
		title: 'Facebook Provider',
		categoryId: 'integrations',
		columnId: 'in_progress',
		priority: 1
	},
	{
		id: 'instagram-provider',
		title: 'Instagram Provider',
		categoryId: 'integrations',
		columnId: 'in_progress',
		priority: 1
	},
	{
		id: 'threads-provider',
		title: 'Threads Provider',
		categoryId: 'integrations',
		columnId: 'in_progress',
		priority: 1
	},
	{
		id: 'reddit-provider',
		title: 'Reddit Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'pinterest-provider',
		title: 'Pinterest Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'discord-provider',
		title: 'Discord Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'slack-provider',
		title: 'Slack Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'telegram-provider',
		title: 'Telegram Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'discord-support-bot',
		title: 'Discord Support Bot',
		categoryId: 'platform',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'medium-provider',
		title: 'Medium Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'devto-provider',
		title: 'Dev.to Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'twitch-provider',
		title: 'Twitch Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 2
	},
	{
		id: 'warpcast-provider',
		title: 'Warpcast Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'farcaster-provider',
		title: 'Farcaster Provider',
		categoryId: 'integrations',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'publish-webhooks',
		title: 'Webhooks for publish events',
		categoryId: 'platform',
		columnId: 'planned',
		priority: 3
	},
	{
		id: 'dockerization',
		title: 'Dockerization',
		categoryId: 'platform',
		columnId: 'planned',
		priority: 1
	}
] as const;

export function roadmapCategoryLabel(categoryId: RoadmapItemViewModel['categoryId']): string {
	return ROADMAP_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}
