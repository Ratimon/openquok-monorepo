import type { AdminBlogCommentVm } from '$lib/blogs/blog.types';
import type { GetBlogPresenter } from '$lib/blogs/GetBlog.presenter.svelte';
import type { BlogRepository } from '$lib/blogs/Blog.repository.svelte';

export class AdminBlogCommentsManagerPagePresenter {
	public commentsToManageVm: AdminBlogCommentVm[] = $state([]);
	public loading = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getBlogPresenter: GetBlogPresenter,
		private readonly blogRepository: BlogRepository
	) {}

	public async loadComments(fetch?: typeof globalThis.fetch): Promise<AdminBlogCommentVm[]> {
		this.loading = true;
		try {
			const comments = await this.getBlogPresenter.loadAdminCommentsVm({ limit: 100 }, fetch);
			this.commentsToManageVm = comments;
			return this.commentsToManageVm;
		} finally {
			this.loading = false;
		}
	}

	public patchCommentApproved(commentId: string): void {
		this.commentsToManageVm = this.commentsToManageVm.map((c) =>
			c.id === commentId ? { ...c, isApproved: true } : c
		);
	}

	public removeComment(commentId: string): void {
		this.commentsToManageVm = this.commentsToManageVm.filter((c) => c.id !== commentId);
	}

	public async handleApproveComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<void> {
		const resultPm = await this.blogRepository.approveBlogComment(commentId, fetch);

		if (resultPm.ok) {
			this.patchCommentApproved(commentId);
			this.showToastMessage = true;
			this.toastMessage = 'Comment approved.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.error || 'Failed to approve comment.';
		}
	}
}
