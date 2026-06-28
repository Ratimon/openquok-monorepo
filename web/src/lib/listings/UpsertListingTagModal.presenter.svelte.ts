import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingTagFormSchemaType } from '$lib/listings/listing.types';

export class UpsertListingTagModalPresenter {
	constructor(private readonly listingRepository: ListingRepository) {}

	public async createListingTag(
		input: Omit<ListingTagFormSchemaType, 'id'>,
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingTag(
			{
				name: input.name,
				description: input.description ?? null
			},
			fetch
		);
	}

	public async updateListingTag(
		input: ListingTagFormSchemaType & { id: string },
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingTag(
			{
				id: input.id,
				name: input.name,
				description: input.description ?? null
			},
			fetch
		);
	}
}
