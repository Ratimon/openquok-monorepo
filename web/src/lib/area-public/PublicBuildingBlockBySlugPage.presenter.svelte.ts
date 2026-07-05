import type {
	ExtensionCardViewModel,
	ExtensionDetailViewModel,
	GetListingPresenter,
	ListingCommentViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export type PublicListingDetailMutationResultViewModel =
	| { ok: true }
	| { ok: false; error: string };

function mutationPmToVm(pm: ListingUpsertProgrammerModel): PublicListingDetailMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true };
}

export class PublicBuildingBlockBySlugPagePresenter {
	public buildingBlockVm: ExtensionDetailViewModel | null = $state(null);
	public relatedBuildingBlocksVm: ExtensionCardViewModel[] = $state([]);
	public submittingLike = $state(false);
	public submittingComment = $state(false);
	public submittingRating = $state(false);
	public submittingBookmark = $state(false);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	/** Stateless — safe for SSR loads. */
	async loadBuildingBlockBySlugStateless(params: {
		slug: string;
		userSlug?: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}): Promise<{
		buildingBlockVm: ExtensionDetailViewModel | null;
		relatedBuildingBlocksVm: ExtensionCardViewModel[];
	}> {
		const buildingBlockVm = await this.getListingPresenter.loadPublishedExtensionBySlugStateless(
			params.slug,
			params.fetch
		);

		if (!buildingBlockVm) {
			return { buildingBlockVm: null, relatedBuildingBlocksVm: [] };
		}

		const ownerUsername = buildingBlockVm.owner?.username?.trim() ?? '';
		const requestedUserSlug = params.userSlug?.trim() ?? '';
		if (requestedUserSlug) {
			if (!ownerUsername || ownerUsername !== requestedUserSlug) {
				return { buildingBlockVm: null, relatedBuildingBlocksVm: [] };
			}
		}

		const relatedBuildingBlocksVm = await this.getListingPresenter.loadRelatedExtensionsStateless({
			categorySlug: buildingBlockVm.category?.slug,
			excludeId: buildingBlockVm.id,
			limit: params.relatedLimit ?? 4,
			fetch: params.fetch
		});

		return { buildingBlockVm, relatedBuildingBlocksVm };
	}

	/** Stateful wrapper for client convenience. */
	async loadBuildingBlockBySlug(params: {
		slug: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}) {
		const result = await this.loadBuildingBlockBySlugStateless(params);
		this.buildingBlockVm = result.buildingBlockVm;
		this.relatedBuildingBlocksVm = result.relatedBuildingBlocksVm;
		return result;
	}

	/** Fire-and-forget view tracking on detail mount. */
	async trackBuildingBlockView(listingId: string): Promise<PublicListingDetailMutationResultViewModel> {
		const resultPm = await this.listingRepository.trackView(listingId);
		return mutationPmToVm(resultPm);
	}

	async trackBuildingBlockLike(listingId: string): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingLike = true;
		try {
			const resultPm = await this.listingRepository.incrementLikes(listingId);
			const resultVm = mutationPmToVm(resultPm);
			if (resultVm.ok && this.buildingBlockVm?.id === listingId) {
				this.buildingBlockVm = { ...this.buildingBlockVm, likes: this.buildingBlockVm.likes + 1 };
			}
			return resultVm;
		} finally {
			this.submittingLike = false;
		}
	}

	async trackBuildingBlockClick(listingId: string): Promise<void> {
		const resultPm = await this.listingRepository.incrementClicks(listingId);
		if (resultPm.ok && this.buildingBlockVm?.id === listingId) {
			this.buildingBlockVm = { ...this.buildingBlockVm, clicks: this.buildingBlockVm.clicks + 1 };
		}
	}

	async loadListingCommentsStateless(params: {
		listingId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<ListingCommentViewModel[]> {
		return this.getListingPresenter.loadListingCommentsVm(params.listingId, params.fetch);
	}

	async submitListingComment(params: {
		listingId: string;
		content: string;
		parentId: string | null;
	}): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingComment = true;
		try {
			const resultPm = await this.listingRepository.createListingComment({
				listingId: params.listingId,
				content: params.content,
				parentId: params.parentId
			});
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingComment = false;
		}
	}

	async submitListingRating(
		listingId: string,
		rating: number
	): Promise<PublicListingDetailMutationResultViewModel> {
		this.submittingRating = true;
		try {
			const resultPm = await this.listingRepository.upsertListingRating(listingId, rating);
			return mutationPmToVm(resultPm);
		} finally {
			this.submittingRating = false;
		}
	}

	async toggleBookmark(
		listingId: string,
		nextBookmarked: boolean
	): Promise<PublicListingDetailMutationResultViewModel & { bookmarked?: boolean }> {
		this.submittingBookmark = true;
		try {
			const resultPm = nextBookmarked
				? await this.listingRepository.addBookmark(listingId)
				: await this.listingRepository.removeBookmark(listingId);
			const resultVm = mutationPmToVm(resultPm);
			if (resultVm.ok) {
				return { ...resultVm, bookmarked: nextBookmarked };
			}
			return resultVm;
		} finally {
			this.submittingBookmark = false;
		}
	}
}
