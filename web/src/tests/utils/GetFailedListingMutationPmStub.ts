import type { ListingUpsertProgrammerModel } from '$lib/listings/Listing.repository.svelte';

export function GetFailedListingMutationPmStub(
	error = 'Mutation failed.'
): ListingUpsertProgrammerModel {
	return { ok: false, error };
}
