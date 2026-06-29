import type { ListingTagProgrammerModel } from '$lib/listings/Listing.repository.svelte';
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
