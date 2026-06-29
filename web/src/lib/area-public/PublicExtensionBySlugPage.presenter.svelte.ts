import type {
	ExtensionCardViewModel,
	ExtensionDetailViewModel,
	GetListingPresenter
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository, ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export type PublicExtensionMutationResultViewModel =
	| { ok: true }
	| { ok: false; error: string };

function mutationPmToVm(pm: ListingUpsertProgrammerModel): PublicExtensionMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true };
}

export class PublicExtensionBySlugPagePresenter {
	public extensionVm: ExtensionDetailViewModel | null = $state(null);
	public relatedExtensionsVm: ExtensionCardViewModel[] = $state([]);
	public submittingLike = $state(false);

	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	/** Stateless — safe for SSR loads. */
	async loadExtensionBySlugStateless(params: {
		slug: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}): Promise<{
		extensionVm: ExtensionDetailViewModel | null;
		relatedExtensionsVm: ExtensionCardViewModel[];
	}> {
		const extensionVm = await this.getListingPresenter.loadPublishedExtensionBySlugStateless(
			params.slug,
			params.fetch
		);

		if (!extensionVm) {
			return { extensionVm: null, relatedExtensionsVm: [] };
		}

		const relatedExtensionsVm = await this.getListingPresenter.loadRelatedExtensionsStateless({
			categorySlug: extensionVm.category?.slug,
			excludeId: extensionVm.id,
			limit: params.relatedLimit ?? 4,
			fetch: params.fetch
		});

		return { extensionVm, relatedExtensionsVm };
	}

	/** Stateful wrapper for client convenience. */
	async loadExtensionBySlug(params: {
		slug: string;
		fetch?: typeof globalThis.fetch;
		relatedLimit?: number;
	}) {
		const result = await this.loadExtensionBySlugStateless(params);
		this.extensionVm = result.extensionVm;
		this.relatedExtensionsVm = result.relatedExtensionsVm;
		return result;
	}

	/** Fire-and-forget view tracking on detail mount. */
	async trackExtensionView(listingId: string): Promise<PublicExtensionMutationResultViewModel> {
		const resultPm = await this.listingRepository.trackView(listingId);
		return mutationPmToVm(resultPm);
	}

	async trackExtensionLike(listingId: string): Promise<PublicExtensionMutationResultViewModel> {
		this.submittingLike = true;
		try {
			const resultPm = await this.listingRepository.incrementLikes(listingId);
			const resultVm = mutationPmToVm(resultPm);
			if (resultVm.ok && this.extensionVm?.id === listingId) {
				this.extensionVm = { ...this.extensionVm, likes: this.extensionVm.likes + 1 };
			}
			return resultVm;
		} finally {
			this.submittingLike = false;
		}
	}

	async trackExtensionClick(listingId: string): Promise<void> {
		const resultPm = await this.listingRepository.incrementClicks(listingId);
		if (resultPm.ok && this.extensionVm?.id === listingId) {
			this.extensionVm = { ...this.extensionVm, clicks: this.extensionVm.clicks + 1 };
		}
	}
}
