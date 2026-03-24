import type { BlogRepository, BlogUpsertProgrammerModel } from '$lib/blog/Blog.repository.svelte';
import type {
	BlogPostBySlugPublicViewModel,
	BlogPostPublicViewModel,
	GetBlogPresenter
} from '$lib/blog/GetBlog.presenter.svelte';

export class PublicBlogBySlugPagePresenter {
	public currentPostVm: BlogPostBySlugPublicViewModel | null = $state(null);
	public otherPostsVm: BlogPostPublicViewModel[] = $state([]);

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

	public async submitBlogComment(params: {
		postId: string;
		content: string;
		parentId: string | null;
	}): Promise<BlogUpsertProgrammerModel> {
		this.submittingComment = true;
		this.showCommentSubmitToast = false;
		try {
			const result = await this.blogRepository.createBlogComment({
				postId: params.postId,
				content: params.content,
				parentId: params.parentId
			});
			this.commentSubmitToastMessage = result.success
				? 'Comment submitted. It may appear after moderation.'
				: (result.message || 'Could not submit comment.');
			this.commentSubmitToastIsError = !result.success;
			this.showCommentSubmitToast = true;
			return result;
		} finally {
			this.submittingComment = false;
		}
	}

	public async trackBlogLike(postId: string): Promise<BlogUpsertProgrammerModel> {
		this.submittingLike = true;
		this.showLikeSubmitToast = false;
		try {
			const resultPm = await this.blogRepository.trackBlogActivity(postId, 'like');
			this.likeSubmitToastMessage = resultPm.success
				? 'Thanks for the like!'
				: (resultPm.message || 'Could not record like.');
			this.likeSubmitToastIsError = !resultPm.success;
			this.showLikeSubmitToast = true;
			return resultPm;
		} finally {
			this.submittingLike = false;
		}
	}

	public async trackBlogShare(postId: string): Promise<BlogUpsertProgrammerModel> {
		this.submittingShare = true;
		this.showShareSubmitToast = false;
		try {
			const resultPm = await this.blogRepository.trackBlogActivity(postId, 'share');
			this.shareSubmitToastMessage = resultPm.success
				? 'Thanks for sharing!'
				: (resultPm.message || 'Could not record share.');
			this.shareSubmitToastIsError = !resultPm.success;
			this.showShareSubmitToast = true;
			return resultPm;
		} finally {
			this.submittingShare = false;
		}
	}

	/** View count on post open; no toast (fire-and-forget from UI). */
	public async trackBlogView(postId: string): Promise<BlogUpsertProgrammerModel> {
		return this.blogRepository.trackBlogActivity(postId, 'view');
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

