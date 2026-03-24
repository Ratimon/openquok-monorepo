import type { PublicBlogOverviewVm, BlogPostPublicViewModel, BlogTopicPublicViewModel } from '$lib/blog/index';
import type { GetBlogPresenter } from '$lib/blog/GetBlog.presenter.svelte';

export class PublicBlogPagePresenter {
	public postsVm: BlogPostPublicViewModel[] = $state([]);
	public countVm: number = $state(0);
	public topicsVm: BlogTopicPublicViewModel[] = $state([]);
	public pageVm: number = $state(1);
	public itemsPerPageVm: number = $state(4);
	public topicIdVm: string | null = $state(null);

	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	/**
	 * Safe for SSR: does not mutate `$state` fields.
	 */
	async loadDataForOverviewBlogStateless({
		fetch,
		page,
		itemsPerPage,
		topicId,
		authorId
	}: {
		fetch?: typeof globalThis.fetch;
		page: number;
		itemsPerPage: number;
		topicId: string | null;
		authorId?: string | null;
	}): Promise<{
		posts: BlogPostPublicViewModel[];
		count: number;
		topics: BlogTopicPublicViewModel[];
		page: number;
		itemsPerPage: number;
		topicId: string | null;
		authorId: string | null;
	}> {
		const skip = (page - 1) * itemsPerPage;

		const { posts, count, topics }: PublicBlogOverviewVm = await this.getBlogPresenter.loadPublishedBlogOverviewVm({
			fetch,
			limit: itemsPerPage,
			skip,
			topicId,
			authorId: authorId ?? null
		});

		return {
			posts,
			count,
			topics,
			page,
			itemsPerPage,
			topicId,
			authorId: authorId ?? null
		};
	}

	/**
	 * Stateful wrapper for client-side use: calls `loadDataForOverviewBlogStateless()` then updates `$state` fields.
	 * This is safe to call from client handlers, but do not use it from SSR load if you want immutable state.
	 */
	async loadDataForOverviewBlog({
		fetch,
		page,
		itemsPerPage,
		topicId,
		authorId
	}: {
		fetch?: typeof globalThis.fetch;
		page: number;
		itemsPerPage: number;
		topicId: string | null;
		authorId?: string | null;
	}): Promise<{
		posts: BlogPostPublicViewModel[];
		count: number;
		topics: BlogTopicPublicViewModel[];
		page: number;
		itemsPerPage: number;
		topicId: string | null;
		authorId: string | null;
	}> {
		const overview = await this.loadDataForOverviewBlogStateless({
			fetch,
			page,
			itemsPerPage,
			topicId,
			authorId: authorId ?? null
		});

		// Update VM only in this stateful wrapper.
		this.postsVm = overview.posts;
		this.countVm = overview.count;
		this.topicsVm = overview.topics;
		this.pageVm = overview.page;
		this.itemsPerPageVm = overview.itemsPerPage;
		this.topicIdVm = overview.topicId;

		return overview;
	}
}
