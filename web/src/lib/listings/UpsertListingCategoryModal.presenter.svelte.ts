import type {
	ListingCategoryProgrammerModel,
	ListingRepository
} from '$lib/listings/Listing.repository.svelte';
import type { ListingCategoryFormSchemaType } from '$lib/listings/listing.types';

import { stringToSlug } from '$lib/ui/helpers/common';

export function buildListingCategoryViewModelFromUpsert(params: {
	id: string;
	name: string;
	description: string | null | undefined;
	parentId: string | null | undefined;
	allCategories: Pick<ListingCategoryProgrammerModel, 'id' | 'name' | 'slug'>[];
}): ListingCategoryProgrammerModel {
	const parentId = params.parentId ?? null;
	const parentRow = parentId ? params.allCategories.find((c) => c.id === parentId) : undefined;
	const parent = parentRow
		? { id: parentRow.id, name: parentRow.name, slug: parentRow.slug }
		: null;

	return {
		id: params.id,
		name: params.name,
		slug: stringToSlug(params.name),
		parentPath: '/',
		description: params.description ?? null,
		parentId,
		parent,
		headline: null,
		emoji: null,
		color: null,
		imageUrlHero: null,
		imageUrlSmall: null,
		href: null
	};
}

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
