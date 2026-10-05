import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

import type {
	LinkDirectoryRepository,
	LinkDirectorySiteEngagementMutationResult
} from '$lib/link-directory/LinkDirectory.repository';
import type { LinkDirectorySiteCommentDto } from '$lib/link-directory/link-directory.types';

export type PublicBuildBacklinksSiteEngagementMutationViewModel =
	| { ok: true }
	| { ok: false; error: string };

function mutationToVm(result: LinkDirectorySiteEngagementMutationResult): PublicBuildBacklinksSiteEngagementMutationViewModel {
	if (!result.ok) return { ok: false, error: result.error };
	return { ok: true };
}

function toSiteCommentVm(comment: LinkDirectorySiteCommentDto): ListingCommentViewModel {
	return {
		id: comment.id,
		content: comment.content,
		isApproved: comment.isApproved,
		createdAt: comment.createdAt,
		updatedAt: comment.updatedAt,
		parentId: comment.parentId,
		userId: comment.userId,
		author: comment.author ? { ...comment.author } : null
	};
}

export class PublicBuildBacklinksSiteBySlugPagePresenter {
	public submittingLike = $state(false);
	public submittingComment = $state(false);
	public submittingRating = $state(false);

	constructor(private readonly linkDirectoryRepository: LinkDirectoryRepository) {}

	async loadSiteCommentsStateless(params: {
		siteId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<ListingCommentViewModel[]> {
		const rows = await this.linkDirectoryRepository.getSiteComments(params.siteId, params.fetch);
		return rows.map((row) => toSiteCommentVm(row));
	}

	async recordSiteView(siteId: string, fetch?: typeof globalThis.fetch): Promise<PublicBuildBacklinksSiteEngagementMutationViewModel> {
		const result = await this.linkDirectoryRepository.incrementSiteViews(siteId, fetch);
		return mutationToVm(result);
	}

	async incrementSiteLikes(siteId: string, fetch?: typeof globalThis.fetch): Promise<PublicBuildBacklinksSiteEngagementMutationViewModel> {
		this.submittingLike = true;
		try {
			const result = await this.linkDirectoryRepository.incrementSiteLikes(siteId, fetch);
			return mutationToVm(result);
		} finally {
			this.submittingLike = false;
		}
	}

	async submitSiteComment(params: {
		siteId: string;
		content: string;
		parentId: string | null;
		fetch?: typeof globalThis.fetch;
	}): Promise<PublicBuildBacklinksSiteEngagementMutationViewModel> {
		this.submittingComment = true;
		try {
			const result = await this.linkDirectoryRepository.createSiteComment(params);
			return mutationToVm(result);
		} finally {
			this.submittingComment = false;
		}
	}

	async submitSiteRating(
		siteId: string,
		rating: number,
		fetch?: typeof globalThis.fetch
	): Promise<PublicBuildBacklinksSiteEngagementMutationViewModel> {
		this.submittingRating = true;
		try {
			const result = await this.linkDirectoryRepository.upsertSiteRating(siteId, rating, fetch);
			return mutationToVm(result);
		} finally {
			this.submittingRating = false;
		}
	}
}
