import type { AlternativesHubCategory } from '$lib/content/constants/hubs/alternativesHubFilters';

export const ALTERNATIVES_PATH_CATEGORY_SLUGS = [
	'social-scheduler',
	'directory-submission'
] as const;

export type AlternativesPathCategorySlug = (typeof ALTERNATIVES_PATH_CATEGORY_SLUGS)[number];

const PATH_CATEGORY_SLUG_SET = new Set<string>(ALTERNATIVES_PATH_CATEGORY_SLUGS);

export function isAlternativesPathCategorySlug(slug: string): slug is AlternativesPathCategorySlug {
	return PATH_CATEGORY_SLUG_SET.has(slug);
}

export function alternativesPathCategorySlugForHubCategory(
	category: Exclude<AlternativesHubCategory, 'all'>
): AlternativesPathCategorySlug {
	return category === 'social' ? 'social-scheduler' : 'directory-submission';
}

export type AlternativesPathCategoryConfig = {
	slug: AlternativesPathCategorySlug;
	/** Card title on `/alternatives/categories`. */
	name: string;
	/** Breadcrumb and filter chip label on category hub pages. */
	breadcrumbLabel: string;
	description: string;
	hubFilterCategory: Exclude<AlternativesHubCategory, 'all'>;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	heroTitlePrefix: string;
	heroHighlightText: string;
	heroDescription: string;
};

export const PUBLIC_ALTERNATIVES_PATH_CATEGORIES: Record<
	AlternativesPathCategorySlug,
	AlternativesPathCategoryConfig
> = {
	'social-scheduler': {
		slug: 'social-scheduler',
		name: 'Social media schedulers',
		breadcrumbLabel: 'Social media schedulers',
		description:
			'Ranked pages for Buffer, Hootsuite, Later, Postiz, and other social media schedulers — list prices, channels, and compare links.',
		hubFilterCategory: 'social',
		metaTitle: 'Best Social Media Scheduler Alternatives in 2026',
		metaDescription:
			'Compare the best social media scheduler alternatives in 2026. See ranked picks with public list prices, supported channels, and head-to-head compare links. OpenQuok is first for teams that want agents, MCP, and self-host.',
		keywords: [
			'social media scheduler alternatives',
			'best buffer alternatives',
			'best hootsuite alternatives',
			'later alternatives',
			'postiz alternatives',
			'social scheduling tools 2026'
		],
		heroTitlePrefix: 'Find the best ',
		heroHighlightText: 'social media scheduler alternatives',
		heroDescription:
			'Ranked scheduler alternatives with list prices, channel support, and compare links. Sort by price or platform count, then open each page for detail.'
	},
	'directory-submission': {
		slug: 'directory-submission',
		name: 'Directory submission services',
		breadcrumbLabel: 'Directory submission services',
		description:
			'Ranked alternatives to done-for-you directory launch vendors — fees, pace, and control versus DIY directory submission.',
		hubFilterCategory: 'directory',
		metaTitle: 'Best Directory Submission Service Alternatives in 2026',
		metaDescription:
			'Compare the best directory submission service alternatives in 2026. See ranked vendors with one-time package prices, coverage summaries, and compare links against OpenQuok DIY directory launch.',
		keywords: [
			'directory submission service alternatives',
			'directory launch alternatives',
			'boringlaunch alternatives',
			'done for you directory submission',
			'product directory listing service'
		],
		heroTitlePrefix: 'Find the best ',
		heroHighlightText: 'directory submission alternatives',
		heroDescription:
			'Ranked directory submission alternatives with package pricing and compare links. Sort by price, then open each page to weigh done-for-you fees against DIY launch.'
	}
};

export const PUBLIC_ALTERNATIVES_CATEGORIES_INDEX = {
	metaTitle: 'Alternatives categories',
	metaDescription:
		'Browse social media scheduler and directory submission alternatives by category. Each category hub lists ranked tools with prices and compare links.',
	heroTitle: 'All alternatives categories',
	heroDescription:
		'Pick a category to see ranked alternatives, filter by price or platform count, and open compare pages when you are ready for detail.',
	keywords: [
		'alternatives categories',
		'social scheduler alternatives hub',
		'directory submission alternatives hub'
	] as const
};
