import type { BlogAuthorPublicViewModel, GetBlogPresenter } from '$lib/blog/GetBlog.presenter.svelte';

export class PublicBlogAuthorPagePresenter {
	public authorsVm: BlogAuthorPublicViewModel[] = $state([]);

	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	/**
	 * Safe for SSR: does not mutate `$state` fields.
	 */
	async loadDataForAuthorsOverviewStateless({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ authors: BlogAuthorPublicViewModel[] }> {
		return this.getBlogPresenter.loadPublishedBlogAuthorsVm({ fetch });
	}

	/**
	 * Stateful wrapper for client-side use: updates `authorsVm` after load.
	 */
	async loadDataForAuthorsOverview({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ authors: BlogAuthorPublicViewModel[] }> {
		const result = await this.loadDataForAuthorsOverviewStateless({ fetch });
		this.authorsVm = result.authors;
		return result;
	}
}
