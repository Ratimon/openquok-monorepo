import type {
	ExtensionCardViewModel,
	GetListingPresenter,
	ListingCreatorViewModel,
	StackCardViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';

export class PublicCreatorsPagePresenter {
	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadCreatorsHubStateless(params: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ creators: ListingCreatorViewModel[] }> {
		const creators = await this.listingRepository.getListingCreators(params.fetch);
		return {
			creators: creators.map((creator) => this.getListingPresenter.toListingCreatorVm(creator))
		};
	}
}

export class PublicCreatorByUsernamePagePresenter {
	constructor(
		private readonly getListingPresenter: GetListingPresenter,
		private readonly listingRepository: ListingRepository
	) {}

	async loadCreatorByUsernameStateless(params: {
		username: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<{
		creator: ListingCreatorViewModel | null;
		buildingBlocks: ExtensionCardViewModel[];
		playbooks: StackCardViewModel[];
	}> {
		const username = params.username.trim();
		if (!username) {
			return { creator: null, buildingBlocks: [], playbooks: [] };
		}

		const [creators, listings] = await Promise.all([
			this.listingRepository.getListingCreators(params.fetch),
			this.listingRepository.getCreatorListings(username, params.fetch)
		]);

		const creatorRow = creators.find((row) => row.username === username) ?? null;
		if (!creatorRow) {
			return { creator: null, buildingBlocks: [], playbooks: [] };
		}

		const buildingBlocks: ExtensionCardViewModel[] = [];
		const playbooks: StackCardViewModel[] = [];

		for (const listing of listings) {
			if (listing.listingKind === 'stack') {
				playbooks.push(this.getListingPresenter.toStackCardVmStateless(listing));
			} else {
				buildingBlocks.push(this.getListingPresenter.toExtensionCardVmStateless(listing));
			}
		}

		return {
			creator: this.getListingPresenter.toListingCreatorVm(creatorRow),
			buildingBlocks,
			playbooks
		};
	}
}
