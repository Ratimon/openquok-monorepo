import type { AdminLinkDirectorySiteCommentVm } from '$lib/link-directory/link-directory-admin.types';
import type { LinkDirectoryRepository } from '$lib/link-directory/LinkDirectory.repository';

export class AdminLinkDirectorySiteCommentsManagerPagePresenter {
	public commentsToManageVm: AdminLinkDirectorySiteCommentVm[] = $state([]);
	public loading = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	public async loadComments(fetch?: typeof globalThis.fetch): Promise<AdminLinkDirectorySiteCommentVm[]> {
		this.loading = true;
		try {
			const comments = await this.linkDirectoryRepository.getAdminSiteComments({ limit: 100 }, fetch);
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

	public async handleApproveComment(
		commentId: string,
		fetch?: typeof globalThis.fetch
	): Promise<void> {
		const result = await this.linkDirectoryRepository.approveAdminSiteComment(commentId, fetch);

		if (result.ok) {
			this.patchCommentApproved(commentId);
			this.showToastMessage = true;
			this.toastMessage = 'Comment approved.';
		} else {
			this.showToastMessage = true;
			this.toastMessage = result.error || 'Failed to approve comment.';
		}
	}
}
