import type { BlogPostPublicViewModel, BlogTopicOverviewPublicViewModel } from '$lib/blog/GetBlog.presenter.svelte';
import type { GetBlogPresenter } from '$lib/blog/GetBlog.presenter.svelte';

export class PublicBlogTopicBySlugPagePresenter {
	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	/**
	 * Safe for SSR: does not mutate `$state` fields.
	 * Resolves the topic by slug from active topics, then loads published posts for that topic.
	 */
	async loadDataForTopicBySlugStateless({
		fetch,
		topicSlug,
		page,
		itemsPerPage
	}: {
		fetch?: typeof globalThis.fetch;
		topicSlug: string;
		page: number;
		itemsPerPage: number;
	}): Promise<{
		topic: BlogTopicOverviewPublicViewModel | null;
		posts: BlogPostPublicViewModel[];
		count: number;
		topicsNav: BlogTopicOverviewPublicViewModel[];
		page: number;
		itemsPerPage: number;
	}> {
		const { topics: topicsNav } = await this.getBlogPresenter.loadActiveBlogTopicsOverviewVm({ fetch });
		const currentTopic = topicsNav.find((t) => t.slug === topicSlug) ?? null;

		if (!currentTopic) {
			return {
				topic: null,
				posts: [],
				count: 0,
				topicsNav,
				page,
				itemsPerPage
			};
		}

		const skip = (page - 1) * itemsPerPage;
		const { posts, count } = await this.getBlogPresenter.loadPublishedBlogOverviewVm({
			fetch,
			limit: itemsPerPage,
			skip,
			topicId: currentTopic.id,
			authorId: null
		});

		return {
			topic: currentTopic,
			posts,
			count,
			topicsNav,
			page,
			itemsPerPage
		};
	}
}
