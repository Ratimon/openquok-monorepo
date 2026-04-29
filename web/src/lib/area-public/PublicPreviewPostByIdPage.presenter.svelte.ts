import type { PostPreviewProgrammerModel } from '$lib/posts/Posts.repository.svelte';
import type {
	GetScheduledPostsPresenter,
	PublicPreviewPostViewModel
} from '$lib/posts/GetScheduledPosts.presenter.svelte';

export type { PublicPreviewPostViewModel };

/**
 * Public `/p/[postId]` page shell: maps preview PM → VM via {@link GetScheduledPostsPresenter}.
 *
 * Naming pairs {@link loadPreviewPostStateless} (PM→VM only, SSR-safe, no `$state`) vs {@link loadPreviewPost}
 */
export class PublicPreviewPostByIdPagePresenter {
	constructor(private readonly getScheduledPostsPresenter: GetScheduledPostsPresenter) {}

	public currentPreviewPostVm: PublicPreviewPostViewModel | null = $state(null);

	/**
	 * ✅ Stateless — safe for `+page.server.ts` (SSR): maps programmer model → view model **without** mutating `$state`.
	 */
	loadPreviewPostStateless(postPreviewPm: PostPreviewProgrammerModel): { postVm: PublicPreviewPostViewModel } {
		const previewPostVm = this.getScheduledPostsPresenter.mapPreviewPostPmToVm(postPreviewPm);
		return { postVm: previewPostVm };
	}

	/**
	 * Stateful wrapper — calls {@link loadPreviewPostStateless} and assigns {@link currentPreviewPostVm}.
	 */
	loadPreviewPost(postPreviewPm: PostPreviewProgrammerModel): { postVm: PublicPreviewPostViewModel } {
		const previewPostVm = this.loadPreviewPostStateless(postPreviewPm).postVm;
		this.currentPreviewPostVm = previewPostVm;
		return { postVm: previewPostVm };
	}

	// /**
	//  * Stateless — fetch preview PM via {@link GetScheduledPostsPresenter.fetchPostPreviewPm}, then {@link loadPreviewPostStateless}.
	//  * Does **not** mutate `$state` (usable from tests or orchestration).
	//  */
	// async loadPreviewPostByIdStateless(params: {
	// 	postId: string;
	// 	fetch?: typeof globalThis.fetch;
	// }): Promise<{ postVm: PublicPreviewPostViewModel | null; loadError: string | null }> {
	// 	const postPreviewPmResult = await this.getScheduledPostsPresenter.fetchPostPreviewPm(
	// 		params.postId,
	// 		params.fetch ? { fetch: params.fetch } : undefined
	// 	);
	// 	if (!postPreviewPmResult.ok) {
	// 		return { postVm: null, loadError: postPreviewPmResult.error };
	// 	}
	// 	const previewPostPm = postPreviewPmResult.post;
	// 	const previewPostVm = this.loadPreviewPostStateless(previewPostPm).postVm;
	// 	return { postVm: previewPostVm, loadError: null };
	// }

	// /**
	//  * Stateful wrapper — calls {@link loadPreviewPostByIdStateless} and assigns {@link currentPreviewPostVm} for client-side use.
	//  */
	// async loadPreviewPostById(params: {
	// 	postId: string;
	// 	fetch?: typeof globalThis.fetch;
	// }): Promise<{ postVm: PublicPreviewPostViewModel | null; loadError: string | null }> {
	// 	const { postVm, loadError } = await this.loadPreviewPostByIdStateless(params);
	// 	this.currentPreviewPostVm = postVm;
	// 	return { postVm, loadError };
	// }
}
