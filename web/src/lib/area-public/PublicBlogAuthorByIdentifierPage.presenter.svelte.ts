import type { BlogAuthorPublicViewModel, BlogPostPublicViewModel, GetBlogPresenter } from '$lib/blogs/GetBlog.presenter.svelte';
import { stringToSlug } from '$lib/ui/helpers/common';

function authorProfileSlug(author: BlogAuthorPublicViewModel): string {
	return stringToSlug(author.fullName || author.username || 'Anonymous');
}

/**
 * Match URL segment to an author: slug from display name (Next.js overview links),
 * or direct `id` / `username` (metadata / bookmarks).
 */
export function findPublishedAuthorByIdentifier(
	authors: BlogAuthorPublicViewModel[],
	rawIdentifier: string
): BlogAuthorPublicViewModel | null {
	const id = decodeURIComponent(rawIdentifier.trim());
	if (!id) return null;
	return (
		authors.find((a) => {
			if (a.id === id) return true;
			if (a.username && a.username === id) return true;
			return authorProfileSlug(a) === id;
		}) ?? null
	);
}

export class PublicBlogAuthorByIdentifierPagePresenter {
	constructor(private readonly getBlogPresenter: GetBlogPresenter) {}

	/**
	 * Safe for SSR: does not mutate `$state` fields.
	 */
	async loadDataForAuthorByIdentifierStateless({
		fetch,
		identifier,
		page,
		itemsPerPage
	}: {
		fetch?: typeof globalThis.fetch;
		identifier: string;
		page: number;
		itemsPerPage: number;
	}): Promise<{
		author: BlogAuthorPublicViewModel | null;
		posts: BlogPostPublicViewModel[];
		count: number;
		page: number;
		itemsPerPage: number;
	}> {
		const { authors } = await this.getBlogPresenter.loadPublishedBlogAuthorsVm({ fetch });
		const author = findPublishedAuthorByIdentifier(authors, identifier);

		if (!author) {
			return {
				author: null,
				posts: [],
				count: 0,
				page,
				itemsPerPage
			};
		}

		const skip = (page - 1) * itemsPerPage;
		const overview = await this.getBlogPresenter.loadPublishedBlogOverviewVm({
			fetch,
			limit: itemsPerPage,
			skip,
			topicId: null,
			authorId: author.id
		});

		return {
			author,
			posts: overview.posts,
			count: overview.count,
			page,
			itemsPerPage
		};
	}
}
