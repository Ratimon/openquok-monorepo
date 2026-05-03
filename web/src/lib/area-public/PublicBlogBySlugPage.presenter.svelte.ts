import type { BlogRepository, BlogUpsertProgrammerModel } from '$lib/blogs/Blog.repository.svelte';
import type {
	BlogPostBySlugPublicViewModel,
	BlogPostCommentViewModel,
	BlogPostPublicViewModel,
	GetBlogPresenter
} from '$lib/blogs/GetBlog.presenter.svelte';

/** Mutation result for public blog post actions (comment, like, share, view). Maps from {@link BlogUpsertProgrammerModel}. */
export type PublicBlogMutationResultViewModel =
	| { ok: true; id?: string }
	| { ok: false; error: string };

function blogUpsertPmToMutationVm(pm: BlogUpsertProgrammerModel): PublicBlogMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return pm.id !== undefined ? { ok: true, id: pm.id } : { ok: true };
}

export class PublicBlogBySlugPagePresenter {
	public currentPostVm: BlogPostBySlugPublicViewModel | null = $state(null);
	public otherPostsVm: BlogPostPublicViewModel[] = $state([]);
	public currentCommentsVm: BlogPostCommentViewModel[] = $state([]);

	public submittingComment = $state(false);
	public showCommentSubmitToast = $state(false);
	public commentSubmitToastMessage = $state('');
	public commentSubmitToastIsError = $state(false);

	public submittingLike = $state(false);
	public showLikeSubmitToast = $state(false);
	public likeSubmitToastMessage = $state('');
	public likeSubmitToastIsError = $state(false);

	public submittingShare = $state(false);
	public showShareSubmitToast = $state(false);
	public shareSubmitToastMessage = $state('');
	public shareSubmitToastIsError = $state(false);

	constructor(
		private readonly getBlogPresenter: GetBlogPresenter,
		private readonly blogRepository: BlogRepository
	) {}

	/**
	 * ✅ Stateless — safe for SSR loads: fetch approved public comments for a post.
	 * Does **not** mutate `$state` (usable from `+page.server.ts`).
	 */
	public async loadPostCommentsStateless(params: {
		postId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<BlogPostCommentViewModel[]> {
		return this.getBlogPresenter.loadPublishedBlogPostComments(params.postId, params.fetch);
	}

	/** Stateful wrapper — calls {@link getPostCommentsStateless} and assigns {@link currentCommentsVm}. */
	public async loadPostComments(params: {
		postId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<BlogPostCommentViewModel[]> {
		const comments = await this.loadPostCommentsStateless(params);
		this.currentCommentsVm = comments;
		return comments;
	}

	public async submitBlogComment(params: {
		postId: string;
		content: string;
		parentId: string | null;
	}): Promise<PublicBlogMutationResultViewModel> {
		this.submittingComment = true;
		this.showCommentSubmitToast = false;
		try {
			const resultPm = await this.blogRepository.createBlogComment({
				postId: params.postId,
				content: params.content,
				parentId: params.parentId
			});
			const resultVm = blogUpsertPmToMutationVm(resultPm);
			this.commentSubmitToastMessage = resultVm.ok
				? 'Comment submitted. It may appear after moderation.'
				: (resultVm.error || 'Could not submit comment.');
			this.commentSubmitToastIsError = !resultVm.ok;
			this.showCommentSubmitToast = true;
			return resultVm;
		} finally {
			this.submittingComment = false;
		}
	}

	public async trackBlogLike(postId: string): Promise<PublicBlogMutationResultViewModel> {
		this.submittingLike = true;
		this.showLikeSubmitToast = false;
		try {
			const resultPm = await this.blogRepository.trackBlogActivity(postId, 'like');
			const resultVm = blogUpsertPmToMutationVm(resultPm);
			this.likeSubmitToastMessage = resultVm.ok
				? 'Thanks for the like!'
				: (resultVm.error || 'Could not record like.');
			this.likeSubmitToastIsError = !resultVm.ok;
			this.showLikeSubmitToast = true;
			return resultVm;
		} finally {
			this.submittingLike = false;
		}
	}

	public async trackBlogShare(postId: string): Promise<PublicBlogMutationResultViewModel> {
		this.submittingShare = true;
		this.showShareSubmitToast = false;
		try {
			const resultPm = await this.blogRepository.trackBlogActivity(postId, 'share');
			const resultVm = blogUpsertPmToMutationVm(resultPm);
			this.shareSubmitToastMessage = resultVm.ok
				? 'Thanks for sharing!'
				: (resultVm.error || 'Could not record share.');
			this.shareSubmitToastIsError = !resultVm.ok;
			this.showShareSubmitToast = true;
			return resultVm;
		} finally {
			this.submittingShare = false;
		}
	}

	/** View count on post open; no toast (fire-and-forget from UI). */
	public async trackBlogView(postId: string): Promise<PublicBlogMutationResultViewModel> {
		const resultPm = await this.blogRepository.trackBlogActivity(postId, 'view');
		return blogUpsertPmToMutationVm(resultPm);
	}

	/**
	 * SSR-safe: returns data without mutating `$state` fields.
	 */
	public async loadDataForBlogPostBySlugStateless({
		slug,
		fetch,
		relatedLimit = 2
	}: {
		slug: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}): Promise<{
		currentPostVm: BlogPostBySlugPublicViewModel | null;
		otherPostsVm: BlogPostPublicViewModel[];
	}> {
		const currentVm = await this.getBlogPresenter.loadPublishedBlogPostBySlug(slug, fetch);
		if (!currentVm) {
			return { currentPostVm: null, otherPostsVm: [] };
		}

		const otherPostsVm = await this.getBlogPresenter.loadPublishedRelatedBlogPosts({
			limit: relatedLimit,
			skipId: currentVm.id,
			fetch
		});

		return {
			currentPostVm: currentVm,
			otherPostsVm
		};
	}

	/**
	 * Stateful wrapper (client-side convenience).
	 */
	public async loadDataForBlogPostBySlug({
		slug,
		fetch,
		relatedLimit = 2
	}: {
		slug: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}) {
		const result = await this.loadDataForBlogPostBySlugStateless({ slug, fetch, relatedLimit });
		this.currentPostVm = result.currentPostVm;
		this.otherPostsVm = result.otherPostsVm;
		return result;
	}
}

