import type { ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingCategoryFormSchemaType } from '$lib/listings/listing.types';

export class UpsertListingCategoryModalPresenter {
	constructor(private readonly listingRepository: ListingRepository) {}

	public async createListingCategory(
		input: Omit<ListingCategoryFormSchemaType, 'id'>,
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingCategory(
			{
				name: input.name,
				description: input.description ?? null,
				parent_path: '/',
				...(input.parent_id ? { parent_id: input.parent_id } : {})
			},
			fetch
		);
	}

	public async updateListingCategory(
		input: ListingCategoryFormSchemaType & { id: string },
		fetch?: typeof globalThis.fetch
	) {
		return this.listingRepository.upsertListingCategory(
			{
				id: input.id,
				name: input.name,
				description: input.description ?? null,
				parent_path: '/',
				...(input.parent_id ? { parent_id: input.parent_id } : {})
			},
			fetch
		);
	}
}
