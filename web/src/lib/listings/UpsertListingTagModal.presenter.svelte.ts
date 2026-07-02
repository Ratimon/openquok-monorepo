import type { ListingTagProgrammerModel, ListingRepository } from '$lib/listings/Listing.repository.svelte';
import type { ListingTagFormSchemaType } from '$lib/listings/listing.types';

import { stringToSlug } from '$lib/ui/helpers/common';

export function buildListingTagViewModelFromUpsert(params: {
	id: string;
	name: string;
	description: string | null | undefined;
}): ListingTagProgrammerModel {
	return {
		id: params.id,
		name: params.name,
		slug: stringToSlug(params.name),
		description: params.description ?? null,
		headline: null,
		emoji: null,
		color: null,
		imageUrlHero: null,
		imageUrlSmall: null,
		href: null,
		tagGroups: []
	};
}

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
