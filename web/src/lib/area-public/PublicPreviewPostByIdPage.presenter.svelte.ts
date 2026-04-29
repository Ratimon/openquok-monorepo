import type {
	GetScheduledPostsPresenter,
	PostCommentViewModel,
	PublicPreviewPostViewModel
} from '$lib/posts/GetScheduledPosts.presenter.svelte';
import type {  PostsRepository } from '$lib/posts';


/**
 * Public `/p/[postId]` page shell: maps preview PM → VM via {@link GetScheduledPostsPresenter}.
 */
export class PublicPreviewPostByIdPagePresenter {
	constructor(
		private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter,
		private readonly postsRepository: PostsRepository
	) {}

	public currentPreviewPostVm: PublicPreviewPostViewModel | null = $state(null);
	public currentCommentsVm: PostCommentViewModel[] = $state([]);
	public submittingComment = $state(false);
	public showCommentSubmitToast = $state(false);
	public commentSubmitToastMessage = $state('');
	public commentSubmitToastIsError = $state(false);
	/**
	 * ✅ Stateless — safe for `+page.server.ts` (SSR): maps programmer model → view model **without** mutating `$state`.
	 * Does **not** mutate `$state` (usable from tests or orchestration).
	 */
	async loadPreviewPostByIdStateless(params: {
		postId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<PublicPreviewPostViewModel | null> {
		return this.getScheduledPostsPresenter.loadPostPreviewVmById(
			params.postId,
			params.fetch ? { fetch: params.fetch } : undefined
		);
	}

	/**
	 * Stateful wrapper — calls {@link loadPreviewPostByIdStateless} and assigns {@link currentPreviewPostVm} for client-side use.
	 */
	async loadPreviewPostById(params: {
		postId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<PublicPreviewPostViewModel | null> {
		const postVm = await this.loadPreviewPostByIdStateless(params);
		this.currentPreviewPostVm = postVm;
		return postVm;
	}

	/**
	 * ✅ Stateless — safe for SSR loads: fetch comments via {@link GetScheduledPostsPresenter.getPublicComments}.
	 * Does **not** mutate `$state` (usable from `+page.server.ts` and other stateless composition).
	 */
	async loadPublicCommentsStateless(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<PostCommentViewModel[]> {
		return this.getScheduledPostsPresenter.loadPublicCommentsVm(postId, options);
	}

	/**
	 * Stateful wrapper — calls {@link getPublicCommentsStateless} and assigns {@link currentCommentsVm}
	 * for client-side use (e.g. after posting a comment, or on client navigations without SSR).
	 */
	async loadPublicComments(
		postId: string,
		options?: { fetch?: typeof globalThis.fetch }
	): Promise<PostCommentViewModel[]> {
		const comments = await this.loadPublicCommentsStateless(postId, options);
		this.currentCommentsVm = comments;
		return comments;
	}

	async createComment(params: {
		postId: string;
		organizationId: string;
		comment: string;
	}): Promise<PostCommentViewModel | null> {
		this.submittingComment = true;
		this.showCommentSubmitToast = false;
		try {
			const resultPm = await this.postsRepository.createPostComment(params);
			if (!resultPm.ok) {
				this.commentSubmitToastMessage = resultPm.error || 'Could not submit comment.';
				this.commentSubmitToastIsError = true;
				this.showCommentSubmitToast = true;
				return null;
			}
			const vm = this.getScheduledPostsPresenter.mapPostCommentPmToVm(resultPm.comment);
			this.currentCommentsVm = [...this.currentCommentsVm, vm];
			this.commentSubmitToastMessage = 'Comment posted.';
			this.commentSubmitToastIsError = false;
			this.showCommentSubmitToast = true;
			return vm;
		} catch {
			this.commentSubmitToastMessage = 'Could not submit comment.';
			this.commentSubmitToastIsError = true;
			this.showCommentSubmitToast = true;
			return null;
		} finally {
			this.submittingComment = false;
		}
	}

}
