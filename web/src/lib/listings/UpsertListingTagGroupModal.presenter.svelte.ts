import type {
	ListingRepository,
	ListingTagGroupProgrammerModel
} from '$lib/listings/Listing.repository.svelte';
import type { ListingTagGroupFormSchemaType } from '$lib/listings/listing.types';

export function buildListingTagGroupViewModelFromUpsert(params: {
	id: string;
	name: string;
}): ListingTagGroupProgrammerModel {
	return {
		id: params.id,
		name: params.name
	};
}

export class UpsertListingTagGroupModalPresenter {
	constructor(private readonly listingRepository: ListingRepository) {}

	public async createListingTagGroup(
		input: Omit<ListingTagGroupFormSchemaType, 'id'>,
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingTagGroup({ name: input.name }, fetch);
	}

	public async updateListingTagGroup(
		input: ListingTagGroupFormSchemaType & { id: string },
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingTagGroup(
			{
				id: input.id,
				name: input.name
			},
			fetch
		);
	}
}
