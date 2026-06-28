import type { AdminListingCommentVm } from '$lib/listings/listing.types';
import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

export class AdminListingCommentsManagerPagePresenter {
	public commentsToManageVm: AdminListingCommentVm[] = $state([]);
	public loading = $state(false);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	public async loadComments(fetch?: typeof globalThis.fetch): Promise<AdminListingCommentVm[]> {
		this.loading = true;
		try {
			const comments = await this.getListingPresenter.loadAdminCommentsVm({ limit: 100 }, fetch);
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
		const resultPm = await this.listingRepository.approveComment(commentId, fetch);

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
