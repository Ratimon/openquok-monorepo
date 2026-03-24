import type { BlogTopicOverviewPublicViewModel, GetBlogPresenter } from '$lib/blog/GetBlog.presenter.svelte';

export class PublicBlogTopicPagePresenter {
	public topicsVm: BlogTopicOverviewPublicViewModel[] = $state([]);

	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	/**
	 * Safe for SSR: does not mutate `$state` fields.
	 */
	async loadDataForTopicsOverviewStateless({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ topics: BlogTopicOverviewPublicViewModel[] }> {
		return this.getBlogPresenter.loadActiveBlogTopicsOverviewVm({ fetch });
	}

	/**
	 * Stateful wrapper for client-side use: updates `topicsVm` after load.
	 */
	async loadDataForTopicsOverview({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ topics: BlogTopicOverviewPublicViewModel[] }> {
		const result = await this.loadDataForTopicsOverviewStateless({ fetch });
		this.topicsVm = result.topics;
		return result;
	}
}
